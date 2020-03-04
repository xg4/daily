import Bot from '@xg4/dingtalk-bot'
import puppeteer from 'puppeteer'
import CONFIG from './config'
import * as tasks from './tasks'

const bot = new Bot(CONFIG.DINGTALK_WEBHOOK, CONFIG.DINGTALK_SECRET)

async function bootstrap() {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const [page] = await browser.pages()
  await page.setViewport({ width: 1920, height: 1080 })
  await page.setRequestInterception(true)
  page.on('request', async interceptedRequest => {
    if (interceptedRequest.resourceType() === 'image') {
      await interceptedRequest.abort()
    } else {
      await interceptedRequest.continue()
    }
  })

  const messages = []
  for (const task of Object.values(tasks)) {
    try {
      await task(page)
      console.log(`✅ ${task.name} 成功`)
      // messages.push(`✅ ${task.name} => ${msg}`)
    } catch (err) {
      console.log(`❎ ${task.name} 失败`, err)
      messages.push(`❎ **${task.name}** => ${err?.message ?? err}`)
    }
  }
  await browser.close()
  if (messages.length) {
    await bot.markdown({
      title: '签到',
      text: messages.join('  \n')
    })
  }
}

bootstrap()
