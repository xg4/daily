import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

async function checkIn(page: puppeteer.Page, id: number) {
  await page.goto(`https://www.douyu.com/${id}`)

  try {
    await page.waitForSelector('[data-flag="room_level"]')
    await page.click('[data-flag="room_level"] .ActivityBtn')
  } catch {
    // not find
  }
}

export default async function douyu(page: puppeteer.Page) {
  await page.goto('https://www.douyu.com/')
  const jar = cookie.parse(CONFIG.DOUYU_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.douyu.com'
  }))
  await page.setCookie(...cookies)

  const [_, res] = await Promise.all([
    await page.goto('https://www.douyu.com/directory/myFollow'),
    await page.waitForResponse(res =>
      res
        .url()
        .startsWith('https://www.douyu.com/wgapi/livenc/liveweb/follow/list')
    )
  ])

  const data: any = await res.json()
  if (data.error) {
    return Promise.reject(data.msg)
  }
  const online = data?.data?.list.filter((item: any) => item.online != '0')

  const ids = online.map((item: any) => item.room_id)

  for (const id of ids) {
    await checkIn(page, id)
  }

  return online.map((item: any) => item.nickname).join(' / ')
}
