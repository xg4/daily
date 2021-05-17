import cookie from 'cookie'
import puppeteer from 'puppeteer'

export default async function music163(page: puppeteer.Page) {
  if (!process.env.MUSIC163_COOKIE) {
    return
  }
  await page.goto('https://music.163.com/')
  const jar = cookie.parse(process.env.MUSIC163_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.music.163.com',
  }))
  await page.setCookie(...cookies)
  await page.reload()
  const frames = await page.frames()
  const frame = frames.find((f) => f.url() === 'https://music.163.com/discover')
  const selector =
    '#discover-module > div.g-sd1 > div.n-myinfo.s-bg.s-bg-5 > div > div > div > a'
  const checkInBtn = await frame?.waitForSelector(selector)
  const checkInText = await frame?.$eval(selector, (el) => el.textContent)
  if (checkInText?.trim() === '已签到') {
    return '已签到'
  }
  await checkInBtn?.click()
  return '签到成功'
}
