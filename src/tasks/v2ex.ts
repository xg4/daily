import cookie from 'cookie'
import puppeteer from 'puppeteer'

export default async function v2ex(page: puppeteer.Page) {
  if (!process.env.V2EX_COOKIE) {
    return
  }
  const jar = cookie.parse(process.env.V2EX_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.v2ex.com',
  }))
  await page.setCookie(...cookies)

  await page.goto('https://www.v2ex.com/mission/daily', {
    waitUntil: 'domcontentloaded',
  })
  const btn = await page.waitForSelector(
    '#Main > div.box > div:nth-child(2) > input'
  )
  await btn?.click()
  await page.waitForTimeout(30 * 1e3)
}
