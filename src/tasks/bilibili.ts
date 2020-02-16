import cookie from 'cookie'
import dayjs from 'dayjs'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

export default async function bilibili(page: puppeteer.Page) {
  await page.goto('https://www.bilibili.com/', {
    waitUntil: 'domcontentloaded'
  })
  const jar = cookie.parse(CONFIG.BILIBILI_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.bilibili.com'
  }))
  await page.setCookie(...cookies)
  await page.goto('https://account.bilibili.com/account/coin', {
    waitUntil: 'domcontentloaded'
  })

  const res = await page.waitForResponse(
    'https://api.bilibili.com/x/member/web/coin/log?jsonp=jsonp'
  )
  const result: any = await res.json()
  if (result.code) {
    return Promise.reject(result.message)
  }
  const records: any[] = result.data.list

  const isCheckedIn = records.find(
    record => record.reason === '登录奖励' && dayjs().isSame(record.time, 'day')
  )

  if (isCheckedIn) {
    return `${isCheckedIn.time} 已签到`
  }
  return '签到成功'
}
