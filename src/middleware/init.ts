import puppeteer from 'puppeteer'
import type { Handler } from '../types'

export const init: Handler = async (ctx, next) => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  ctx.browser = browser

  await next()
  await browser.close()
}
