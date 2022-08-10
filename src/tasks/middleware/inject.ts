import type { AccountWithProject, Middleware } from '../../types'

export function inject(account: AccountWithProject): Middleware {
  return async (ctx, next) => {
    const page = await ctx.browser.newPage()
    ctx.page = page
    ctx.account = account

    await next()

    await page.close()
  }
}
