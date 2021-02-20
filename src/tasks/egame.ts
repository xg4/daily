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

  await page.goto('https://egame.qq.com/77777')

  const area = await page.waitForSelector(
    '#__layout > div > div:nth-child(2) > div > div.gui-main > div.live-panel-player-bottom > div.panel-interactive > ul > li:nth-child(4)'
  )
  await area?.hover()

  const task = await page.waitForSelector(
    '#__layout > div > div:nth-child(2) > div > div.gui-main > div.live-panel-player-bottom > div.panel-interactive > ul > li:nth-child(4) > div > div.interactive-area-item > ul > li:nth-child(3)'
  )
  await task?.click()

  const taskModal = await page.waitForSelector(
    'body > div.gui-common-dialog.dialog.show > div.dialog-checkin > div.content > ul'
  )

  const items = (await taskModal?.$$('.btn-primary')) ?? []

  await receiveAward(page, items)

  const daily = await page.waitForSelector(
    'body > div.gui-common-dialog.dialog.show > div.dialog-checkin > div.bar > div:nth-child(1)'
  )
  await daily?.click()

  await page.waitForTimeout(30 * 60 * 1e3)
}
