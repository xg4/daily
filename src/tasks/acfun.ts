import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

export default async function acfun(page: puppeteer.Page) {
  const jar = cookie.parse(CONFIG.ACFUN_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.acfun.cn',
  }))
  await page.setCookie(...cookies)

  await page.goto('https://www.acfun.cn/member/')
  const btn = await page.waitForSelector('#btn-sign-user')
  const text = await page.$eval('#btn-sign-user', (btn) => btn.textContent)
  if (text?.includes('已签到')) {
    return
  }
  await btn?.click()

  await page.waitForTimeout(2 * 1e3)
  const signBtn = await page.waitForSelector('#sign-content > div.sign-in-web')
  await signBtn?.click()
}
