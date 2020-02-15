import cookie from 'cookie'
import dayjs from 'dayjs'
import puppeteer from 'puppeteer'
import { bot } from '../'
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
  await Promise.all([
    page.click('#Main > div.box > div:nth-child(2) > input'),
    page.waitForNavigation({
      waitUntil: 'domcontentloaded'
    })
  ])
  await page.goto('https://www.v2ex.com/balance', {
    waitUntil: 'domcontentloaded'
  })
  const records = await page.$$eval(
    '#Main > div.box > div:nth-child(4) > table > tbody > tr',
    els => els.map(el => el.textContent?.split('\n') ?? [])
  )
  const isCheckedIn = records.some(
    ([_, date, type]) => dayjs().isSame(date, 'day') && type === '每日登录奖励'
  )
  await browser.close()

  if (isCheckedIn) {
    return '已签到'
  }
  return Promise.reject('签到失败，未找到记录')
}

bootstrap()
  .then(async msg => {
    console.log('success')
    await bot.text(`v2ex 签到 => ${msg}`)
  })
  .catch(async err => {
    console.log('error', err)
    await bot.text(`v2ex 签到 => 错误 \n ${err?.message ?? err}`)
    process.exit(0)
  })
