import retry from 'async-retry'
import puppeteer from 'puppeteer'
import * as tasks from './tasks'

async function main() {
  await Promise.all(
    Object.values(tasks).map(async (task) => {
      const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      const page = await browser.newPage()

      try {
        await retry(() => task(page), {
          retries: 2,
        })
        console.log(`Success: ${task.name}`)
      } catch (err) {
        console.log(`Fail: ${task.name} \n`, err)
      }

      await browser.close()
    })
  )
}

main()
