import puppeteer from 'puppeteer'
import CONFIG from '../config'

async function bootstrap() {
  const browser = await puppeteer.launch({
    headless: false
  })
  const [page] = await browser.pages()
  await page.setViewport({ width: 1200, height: 900 })
  await page.goto(
    'https://www.acfun.cn/login/?returnUrl=https%3A%2F%2Fwww.acfun.cn%2F'
  )
  const isLoginForm = await page.$eval('#login', el =>
    el.classList.contains('login-account')
  )
  if (!isLoginForm) {
    await page.click('#login-switch')
  }
  await page.type('#ipt-account-login', CONFIG.ACFUN_USERNAME)
  await page.type('#ipt-pwd-login', CONFIG.ACFUN_PASSWORD)
  await Promise.all([
    page.waitForNavigation(),
    page.click('#form-login > div.area-tool > div')
  ])
  // const cookies = await page.cookies()
  // console.log(cookies)
  await page.goto('https://www.acfun.cn/member/')

  await page.click('#btn-sign-user')
}

bootstrap()
