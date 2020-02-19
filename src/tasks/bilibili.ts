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
  // 直播签到
  await page.goto(
    'https://link.bilibili.com/p/center/index?visit_id=bdkl86he4so0#/user-center/my-info/operation'
  )
  await page.hover(
    '#live-center-app > nav > div > div.right-part.h-100.f-right.f-clear > div.shortcuts-ctnr.h-100.f-left > div:nth-child(2)'
  )
  try {
    // hover 之后会有 .4s 的动画
    const checkInBtn = await page.waitForSelector(
      '#live-center-app > nav > div > div.right-part.h-100.f-right.f-clear > div.shortcuts-ctnr.h-100.f-left > div:nth-child(2) > div > div > div.calendar-checkin.p-absolute.ts-dot-4.panel-shadow.over-hidden.slot-component > div > div > div.checkin-btn.t-center.pointer',
      {
        timeout: 1000
      }
    )
    checkInBtn.click()
  } catch {
    // 已签到
  }

  // 主站签到
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
