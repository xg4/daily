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

  const res = await page.waitForResponse(
    'https://api.bilibili.com/x/member/web/coin/log?jsonp=jsonp'
  )
  const result: any = await res.json()
  if (result.code) {
    return Promise.reject(result.message)
  }
  const records = result.data.list

  const isCheckedIn = records.some(
    (record: any) =>
      record.reason === '登录奖励' && dayjs().isSame(record.time, 'day')
  )
  let msg
  if (isCheckedIn) {
    msg = '已签到'
  } else {
    msg = '成功'
  }
  await browser.close()
  return msg
}

bootstrap()
  .then(async msg => {
    console.log('success')
    await bot.text(`bilibili 签到✔ => ${msg}`)
  })
  .catch(async err => {
    console.log('error', err)
    await bot.text(`bilibili 签到❌ => 错误 \n ${err?.message ?? err}`)
    process.exit(0)
  })
