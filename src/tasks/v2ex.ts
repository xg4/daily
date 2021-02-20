import cookie from 'cookie'
import dayjs from 'dayjs'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

export default async function v2ex(page: puppeteer.Page) {
  await page.goto('https://www.v2ex.com/', {
    waitUntil: 'domcontentloaded',
  })
  const jar = cookie.parse(CONFIG.V2EX_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.v2ex.com',
  }))
  await page.setCookie(...cookies)
  await page.goto('https://www.v2ex.com/mission/daily', {
    waitUntil: 'domcontentloaded',
  })
  await Promise.all([
    page.click('#Main > div.box > div:nth-child(2) > input'),
    page.waitForNavigation({
      waitUntil: 'domcontentloaded',
    }),
  ])
  await page.goto('https://www.v2ex.com/balance', {
    waitUntil: 'domcontentloaded',
  })
  const records = await page.$$eval(
    '#Main > div.box > div:nth-child(4) > table > tbody > tr',
    (els) => els.map((el) => el.textContent?.split('\n') ?? [])
  )
  const isCheckedIn = records.find(
    ([_, date, type]) => dayjs().isSame(date, 'day') && type === '每日登录奖励'
  )

  if (isCheckedIn) {
    return `${isCheckedIn[1]} 已签到`
  }
  return Promise.reject('签到失败，未找到记录')
}
