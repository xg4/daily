import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

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
  await page.goto('https://account.bilibili.com/account/coin', {
    waitUntil: 'domcontentloaded'
  })
}

try {
  bootstrap()
} catch {
  process.exit(0)
}
