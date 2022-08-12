import type { Middleware } from '../types'

export const juejinLucky: Middleware = async (ctx) => {
  const { page } = ctx

  await page.goto('https://juejin.cn/user/center/lottery')
  const btn2 = await page.waitForSelector('.tooltip-box')
  if (!btn2) {
    throw new Error('not found btn2')
  }
  const [result] = await Promise.all([
    page
      .waitForResponse((res) =>
        res
          .url()
          .startsWith(
            'https://api.juejin.cn/growth_api/v1/lottery_lucky/dip_lucky'
          )
      )
      .then((res) => res.json()),
    btn2.click(),
  ])

  ctx.status = 1
  ctx.message = result
}

export const juejinLottery: Middleware = async (ctx) => {
  const { page } = ctx
  await page.goto('https://juejin.cn/user/center/lottery?t=' + Date.now())
  const btn3 = await page.waitForSelector('#turntable-item-0')
  if (!btn3) {
    throw new Error('not found btn3')
  }
  const [result] = await Promise.all([
    page
      .waitForResponse((res) =>
        res.url().startsWith('https://api.juejin.cn/growth_api/v1/lottery/draw')
      )
      .then((res) => res.json()),
    btn3.click(),
  ])

  ctx.status = 1
  ctx.message = result
}

export const juejin: Middleware = async (ctx) => {
  const { page } = ctx

  await page.goto('https://juejin.cn/user/center/signin')
  await page.waitForSelector('.signin-content')
  const btn = await page.waitForSelector('.code-calender .btn')
  if (!btn) {
    throw new Error('not found btn')
  }
  const text = await btn.evaluate((el) => el.textContent)
  if (text && text.includes('已签到')) {
    ctx.message = text
    ctx.status = 1
  } else {
    const [result] = await Promise.all([
      page
        .waitForResponse((res) =>
          res.url().startsWith('https://api.juejin.cn/growth_api/v1/check_in')
        )
        .then((res) => res.json()),
      btn.click(),
    ])
    ctx.message = result
    ctx.status = 1
  }
}
