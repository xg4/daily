import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

export default async function acfun(page: puppeteer.Page) {
  await page.goto('https://www.acfun.cn/')
  const jar = cookie.parse(CONFIG.ACFUN_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.acfun.cn'
  }))
  await page.setCookie(...cookies)

  await page.goto('https://www.acfun.cn/member/')
  const checkInText = await page.$eval('#btn-sign-user', el => el.textContent)

  if (checkInText === '已签到') {
    return '已签到'
  }

  await page.click('#btn-sign-user')
  const checkInBtn = await page.waitForSelector(
    '#sign-content > div.sign-in-web'
  )
  await checkInBtn?.click()
  return '签到成功'
}
