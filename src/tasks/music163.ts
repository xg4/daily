import puppeteer from 'puppeteer'
import CONFIG from '../config'

async function bootstrap() {
  const browser = await puppeteer.launch({
    headless: false
  })
  const [page] = await browser.pages()
  await page.setViewport({ width: 1200, height: 900 })
  await page.goto('https://music.163.com/')
  const [_, frame] = await page.frames()
  const loginBtn = await frame.waitForSelector('#index-enter-default')
  await loginBtn.click()
  await page.click('#j-official-terms')
  await page.click('.zcnt div.u-main > div:nth-child(2) > a')
  await page.type('#p', CONFIG.MUSIC163_USERNAME)
  await page.type('#pw', CONFIG.MUSIC163_PASSWORD)
  await page.click('.zcnt div.n-log2.n-log2-2 > div.f-mgt20 > a')
  const checkInBtn = await frame.waitForSelector(
    '#discover-module > div.g-sd1 > div.n-myinfo.s-bg.s-bg-5 > div > div > div > a'
  )
  await checkInBtn.click()
  await browser.close()
}

bootstrap()
