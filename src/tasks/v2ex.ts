import type { Middleware } from '../types'

export const v2ex: Middleware = async (ctx) => {
  const { page } = ctx
  await page.goto('https://www.v2ex.com/mission/daily', {
    waitUntil: 'domcontentloaded',
  })
  const main = await page.waitForSelector('#Main')
  if (!main) {
    throw new Error('not found #Main')
  }
  try {
    const btn = await page.waitForSelector('input[value="领取 X 铜币"]', {
      timeout: 10,
    })
    await Promise.all([btn?.click(), page.waitForNavigation()])
    ctx.message = await page.$eval(
      '#Main > div.box > div.message',
      (el) => el.textContent
    )
    ctx.status = 1
  } catch {
    ctx.message = await page.$eval(
      '#Main > div.box > div:nth-child(2) > span',
      (el) => el.textContent
    )
    ctx.status = 1
  }
}
