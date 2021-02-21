import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

export default async function bilibili(page: puppeteer.Page) {
  const jar = cookie.parse(CONFIG.BILIBILI_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.bilibili.com',
  }))
  await page.setCookie(...cookies)
  await page.goto('https://www.bilibili.com/')

  // main
  const avatar = await page.waitForSelector(
    '#internationalHeader > div.mini-header.m-header > div > div.nav-user-center > div.user-con.signin > div:nth-child(1) > span > div > div > div > img'
  )
  await avatar?.hover()
  await page.waitForTimeout(2 * 1e3)

  // live
  await page.goto('https://live.bilibili.com/')
  const navbar = await page.waitForSelector(
    '#app > div.nav-ctnr > div > nav > div > div.right-part.h-100.f-right.f-clear > div.shortcuts-ctnr.h-100.f-left > div:nth-child(2)'
  )
  await navbar?.hover()

  await page.waitForTimeout(2 * 1e3)
  try {
    await page.click(
      '#app > div.nav-ctnr > div > nav > div > div.right-part.h-100.f-right.f-clear > div.shortcuts-ctnr.h-100.f-left > div:nth-child(2) > div > div > div.calendar-checkin.p-absolute.ts-dot-4.panel-shadow.over-hidden.slot-component > div > div > div.checkin-btn.t-center.pointer'
    )
  } catch {
    // already checked in
  }
}
