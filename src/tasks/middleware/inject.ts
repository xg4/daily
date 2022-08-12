import type { AccountWithProject, Middleware } from '../../types'

export function inject(state: AccountWithProject): Middleware {
  return async (ctx, next) => {
    const page = await ctx.browser.newPage()
    ctx.page = page
    ctx.account = state.account
    ctx.project = state.project

    await next()

    await page.close()
  }
}
