import retry from 'async-retry'
import dayjs from 'dayjs'
import dotenv from 'dotenv'
import puppeteer from 'puppeteer'
import * as tasks from './tasks'

dotenv.config()

async function main() {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  for (const task of Object.values(tasks)) {
    const page = await browser.newPage()

    try {
      await retry(() => task(page), {
        retries: 2,
      })
      console.log(`${dayjs().format('MM-DD HH:mm')} Success: ${task.name}`)
    } catch (err) {
      console.log(`${dayjs().format('MM-DD HH:mm')} Fail: ${task.name} \n`, err)
    }
  }
  await browser.close()
}

main()
