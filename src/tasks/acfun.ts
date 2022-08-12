import type { Middleware } from '../types'

export const acfun: Middleware = async (ctx) => {
  const { page } = ctx
  await page.goto('https://www.acfun.cn/member/')

  const result = await page.evaluate(async () =>
    fetch('https://www.acfun.cn/rest/pc-direct/user/signIn').then((r) =>
      r.json()
    )
  )

  ctx.message = result
  if ([0, 122].includes(result.result)) {
    ctx.status = 1
  }
}
