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
  await page.goto('https://www.acfun.cn/login')
  const isLoginForm = await page.$eval('#login', el =>
    el.classList.contains('login-account')
  )
  if (!isLoginForm) {
    await page.click('#login-switch')
  }
  await page.type('#ipt-account-login', CONFIG.ACFUN_USERNAME)
  await page.type('#ipt-pwd-login', CONFIG.ACFUN_PASSWORD)
  await page.click('#form-login > div.area-tool > div')
  const result = await page.waitForResponse(
    'https://id.app.acfun.cn/rest/web/login/signin'
  )
  const data: any = await result.json()
  if (data.result) {
    console.log('登录失败')
    return
  }
  await page.goto('https://www.acfun.cn/member/')
  await page.click('#btn-sign-user')
  let msg
  try {
    const checkInBtn = await page.waitForSelector(
      '#sign-content > div.sign-in-web'
    )
    await checkInBtn.click()
    msg = '成功'
  } catch {
    // 已签到
    msg = '已签到'
  }

  await browser.close()
  return msg
}

bootstrap()
  .then(async msg => {
    console.log('success')
    await bot.text(`acfun 签到 => ${msg}`)
  })
  .catch(async err => {
    console.log('error', err)
    await bot.text(`acfun 签到 => 错误 \n ${err?.message ?? err}`)
    process.exit(0)
  })
