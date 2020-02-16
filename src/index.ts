import Bot from '@xg4/dingtalk-bot'
import puppeteer from 'puppeteer'
import CONFIG from './config'
import * as tasks from './tasks'

export const bot = new Bot(CONFIG.DINGTALK_WEBHOOK, CONFIG.DINGTALK_SECRET)

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
  for (const task of Object.values(tasks)) {
    console.log(task.name)
    let msg
    try {
      msg = await task(page)
      msg = '🙆🏻‍♀️ ' + msg
      console.log(`${task.name} 成功 🙆🏻‍♀️`)
    } catch (err) {
      console.log(`${task.name} 失败 🙅🏻‍♀️`, err)
      msg = err?.message ?? err
      msg = '🙅🏻‍♀️ ' + msg
    }

    await bot.text(`${task.name} 签到 => ${msg}`)
  }

  await browser.close()
}

bootstrap()
