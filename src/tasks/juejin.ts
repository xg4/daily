import type { Middleware } from '../types'

export const juejin: Middleware = async (ctx, next) => {
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

  // 沾喜气
  // await page.goto('https://juejin.cn/user/center/lottery?t=' + Date.now())
  // const btn2 = await page.waitForSelector('.tooltip-box')
  // if (!btn2) {
  //   throw new Error('not found btn2')
  // }
  // await Promise.all([
  //   page.waitForResponse((res) =>
  //     res
  //       .url()
  //       .startsWith(
  //         'https://api.juejin.cn/growth_api/v1/lottery_lucky/dip_lucky'
  //       )
  //   ),
  //   btn2.click(),
  // ])

  // 抽奖
  // await page.goto('https://juejin.cn/user/center/lottery?t=' + Date.now())
  // const btn3 = await page.waitForSelector('#turntable-item-0')
  // if (!btn3) {
  //   throw new Error('not found btn3')
  // }
  // await Promise.all([
  //   page
  //     .waitForResponse((res) =>
  //       res
  //         .url()
  //         .startsWith('https://api.juejin.cn/growth_api/v1/lottery/draw')
  //     )
  //     .then((res) => res.json()),
  //   btn3.click(),
  // ])

  await next()
}
