import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

export default async function egame(page: puppeteer.Page) {
  await page.goto('https://egame.qq.com/')
  const jar = cookie.parse(CONFIG.EGAME_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.qq.com'
  }))
  await page.setCookie(...cookies)

  await page.goto('https://egame.qq.com/usercenter/userinfo')

  await page.click(
    '#__layout > div > div.user-wrap > div.user-center > div.nav > div.nav-bd > ul:nth-child(3) > li > a'
  )
  await page.click(
    'body > div.gui-common-dialog.show > div.dialog-task > div.content > div.cnt-top > div:nth-child(1) > button'
  )
  await page.click(
    'body > div:nth-child(20) > div.dialog-checkin > div.content > div.btn-cnt > button'
  )

  return '签到成功'
}
