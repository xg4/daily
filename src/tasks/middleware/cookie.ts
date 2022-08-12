import { prisma } from '../../helpers'
import type { Middleware } from '../../types'
import { parseCookies } from '../../utils'

export function cookie(): Middleware {
  return async (ctx, next) => {
    const page = await ctx.browser.newPage()
    ctx.page = page
    const { account } = ctx

    let cookies: any
    if (account.latestCookie) {
      cookies = JSON.parse(account.latestCookie)
    } else if (account.cookie) {
      cookies = parseCookies(account.cookie).map((i) => ({
        ...i,
        domain: ctx.project.domain,
      }))
    }

    if (!cookies) {
      throw new Error('No cookie')
    }

    await page.setCookie(...cookies)

    await next()

    const latestCookie = await page.cookies()
    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        latestCookie: JSON.stringify(latestCookie),
      },
    })
    await page.deleteCookie(...latestCookie)
    await page.close()
  }
}
