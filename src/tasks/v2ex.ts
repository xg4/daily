import type { Page } from 'puppeteer'

export default async function v2ex(page: Page) {
  await page.goto('https://www.v2ex.com/mission/daily', {
    waitUntil: 'domcontentloaded',
  })
  const main = await page.waitForSelector('#Main')
  if (!main) {
    throw new Error('not found #Main')
  }
  try {
    const btn = await page.waitForSelector('input[value="领取 X 铜币"]', {
      timeout: 2 * 1e3,
    })
    if (btn) {
      await Promise.all([btn.click(), page.waitForNavigation()])
    }
  } catch {}
}
