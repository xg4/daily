import { Page } from 'puppeteer'

interface DetailResult {
  text: string
  specialText: string
  allDays: number
  hadSignDays: number
  isBonusDay: number
}

interface BiliResult {
  // 0 成功
  code: number
  message: string
  ttl: number
  data: DetailResult | null
}

export default async function bilibili(page: Page) {
  // await page.goto('https://www.bilibili.com/')

  // // main
  // const avatar = await page.waitForSelector(
  //   '#internationalHeader > div.mini-header.m-header > div > div.nav-user-center > div.user-con.signin > div:nth-child(1) > span > div > div > div > img'
  // )
  // await avatar?.hover()
  // await page.waitForTimeout(2 * 1e3)

  // live
  await page.goto('https://live.bilibili.com/7777')

  const result = await page.evaluate(async () =>
    fetch('https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign', {
      credentials: 'include',
    }).then((r) => r.json())
  )
  console.log(result)
}
