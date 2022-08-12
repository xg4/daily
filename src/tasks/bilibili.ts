import type { Middleware } from '../types'

export const bilibili: Middleware = async (ctx) => {
  const { page } = ctx

  await page.goto('https://live.bilibili.com/')
  const result = await page.evaluate(async () =>
    fetch('https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign', {
      credentials: 'include',
    }).then((r) => r.json())
  )

  ctx.message = result
  if ([0, 1011040].includes(result.code)) {
    ctx.status = 1
  }
}
