import cookie from 'cookie'
import puppeteer from 'puppeteer'

interface AcFunResult {
  // 0 签到成功 122 已签到
  result: number
  msg: string
  bananaDelta?: number
  error_msg?: string
  'host-name': string
}

export default async function acfun(
  page: puppeteer.Page,
  cookieValue?: string
) {
  if (!cookieValue) {
    return
  }
  const jar = cookie.parse(cookieValue)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.acfun.cn',
  }))
  await page.setCookie(...cookies)

  await page.goto('https://www.acfun.cn/member/')

  const result = await page.evaluate(async () =>
    fetch('https://www.acfun.cn/rest/pc-direct/user/signIn').then((r) =>
      r.json()
    )
  )
  console.log(result)
}
