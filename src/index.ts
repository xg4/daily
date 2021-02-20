import puppeteer from 'puppeteer'
import * as tasks from './tasks'
import retry from 'async-retry'

async function main() {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  // await page.setViewport({ width: 1920, height: 1080 })

  for (const task of Object.values(tasks)) {
    try {
      // retry
      await retry(() => task(page), {
        retries: 2,
      })
      console.log(`Success: ${task.name}`)
    } catch (err) {
      console.log(`Fail: ${task.name} \n`, err)
    }
  }
  await browser.close()
}

main()
