import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'
import { bot } from '../utils'

async function bootstrap() {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const [page] = await browser.pages()
  await page.setViewport({ width: 1200, height: 900 })
  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    const url = interceptedRequest.url()
    if (/\.(png|jpe?g|gif)$/i.test(url)) interceptedRequest.abort()
    else interceptedRequest.continue()
  })
  await page.goto('https://www.v2ex.com/', {
    waitUntil: 'domcontentloaded'
  })
  const jar = cookie.parse(CONFIG.V2EX_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value
  }))
  await page.setCookie(...cookies)
  await page.goto('https://www.v2ex.com/mission/daily', {
    waitUntil: 'domcontentloaded'
  })
  await page.click('#Main > div.box > div:nth-child(2) > input')
  await browser.close()
}

bootstrap()
  .then(async () => {
    console.log('success')
    await bot.text(`v2ex 签到 => 成功`)
  })
  .catch(async err => {
    console.log('error', err)
    await bot.text(`v2ex 签到 => 错误 \n ${err?.message ?? err}`)
    process.exit(0)
  })
