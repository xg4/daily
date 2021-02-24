import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

async function receiveAward(
  page: puppeteer.Page,
  buttons: puppeteer.ElementHandle<Element>[]
) {
  for (const btn of buttons) {
    await btn.click()
    const closeBtn = await page.waitForSelector(
      'body > div.gui-common-dialog.dialog.show > div.get-gift > div.gift-content > div > div.btn-close'
    )
    await closeBtn?.click()
  }
}

export default async function egame(page: puppeteer.Page) {
  const jar = cookie.parse(CONFIG.EGAME_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.qq.com',
  }))
  await page.setCookie(...cookies)

  // 每日签到
  await page.goto('https://egame.qq.com/usercenter/userinfo')
  const taskTab = await page.waitForSelector(
    '#__layout > div > div.user-wrap > div.user-center > div.nav > div.nav-bd > ul:nth-child(3) > li:nth-child(3) > a'
  )
  await taskTab?.click()

  const dailyBtn = await page.waitForSelector(
    'body > div.gui-common-dialog.dialog.show > div.dialog-checkin > div.bar > div:nth-child(1)'
  )
  await dailyBtn?.click()

  // 日常任务
  await page.goto('https://egame.qq.com/usercenter/userinfo')
  const taskBtn = await page.waitForSelector(
    '#__layout > div > div.user-wrap > div.user-center > div.nav > div.nav-bd > ul:nth-child(3) > li:nth-child(3) > a'
  )
  await taskBtn?.click()
  const list = await page.waitForSelector(
    'body > div.gui-common-dialog.dialog.show > div.dialog-checkin > div.content > ul'
  )

  const items = (await list?.$$('.btn-primary')) ?? []

  await receiveAward(page, items)
}
