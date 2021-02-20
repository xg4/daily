import cookie from 'cookie'
import dayjs from 'dayjs'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

export default async function bilibili(page: puppeteer.Page) {
  await page.goto('https://www.bilibili.com/', {
    waitUntil: 'domcontentloaded',
  })
  const jar = cookie.parse(CONFIG.BILIBILI_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.bilibili.com',
  }))
  await page.setCookie(...cookies)
  // 直播签到
  const liveCheckInData = await page.evaluate(() =>
    fetch('https://api.live.bilibili.com/sign/doSign', {
      method: 'GET',
      credentials: 'include',
    }).then((res) => res.json())
  )
  let liveMessage = 'live: '
  if (liveCheckInData.code && liveCheckInData.code !== 1011040) {
    liveMessage += liveCheckInData.message
  } else {
    liveMessage += '签到成功'
  }

  const checkInResult = await page.evaluate(() =>
    fetch('https://api.bilibili.com/x/member/web/coin/log?jsonp=jsonp', {
      method: 'GET',
      credentials: 'include',
    }).then((res) => res.json())
  )
  if (checkInResult.code) {
    return Promise.reject(checkInResult.message)
  }
  const records: any[] = checkInResult.data.list
  const isCheckedIn = records.find(
    (record) =>
      record.reason === '登录奖励' && dayjs().isSame(record.time, 'day')
  )

  if (isCheckedIn) {
    return `${isCheckedIn.time} 已签到  \n ${liveMessage}`
  }
  return '签到成功  \n' + liveMessage
}
