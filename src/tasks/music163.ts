import type { Middleware } from '../types'

export const music163: Middleware = async (ctx) => {
  const { page } = ctx
  await page.goto('https://music.163.com/')

  const elementHandle = await page.waitForSelector('#g_iframe')
  if (!elementHandle) {
    throw new Error('not found #g_iframe')
  }
  const frame = await elementHandle.contentFrame()
  if (!frame) {
    throw new Error('not found frame')
  }

  const selector =
    '#discover-module > div.g-sd1 > div.n-user-profile > div > div > div > div > a'
  const checkInBtn = await frame.waitForSelector(selector)
  const checkInText = await frame.$eval(selector, (el) => el.textContent)
  if (!checkInBtn || !checkInText) {
    throw new Error('not found checkInBtn or checkInText')
  }
  if (checkInText.includes('已签到')) {
    ctx.message = checkInText
    ctx.status = 1
  } else {
    const [result] = await Promise.all([
      page
        .waitForResponse((res) => {
          return res
            .url()
            .startsWith('https://music.163.com/weapi/point/dailyTask')
        })
        .then((res) => res.json()),
      checkInBtn.click(),
    ])

    ctx.message = result
    ctx.status = 1
  }
}
