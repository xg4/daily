import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

export default async function music163(page: puppeteer.Page) {
  await page.goto('https://music.163.com/')
  const jar = cookie.parse(CONFIG.MUSIC163_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.music.163.com'
  }))
  await page.setCookie(...cookies)
  await page.reload()
  const [_, frame] = await page.frames()
  const selector =
    '#discover-module > div.g-sd1 > div.n-myinfo.s-bg.s-bg-5 > div > div > div > a'
  const checkInBtn = await frame.waitForSelector(selector)
  const checkInText = await frame.$eval(selector, el => el.textContent)
  if (checkInText?.trim() === '已签到') {
    return '已签到'
  }
  await checkInBtn.click()
  return '签到成功'
}
