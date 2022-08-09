import { prisma } from '../../helpers'
import type { AccountWithProject, Middleware } from '../../types'
import { parseCookies } from '../../utils'

export function cookie(account: AccountWithProject): Middleware {
  return async (ctx, next) => {
    const { browser } = ctx
    const page = await browser.newPage()
    ctx.page = page

    let cookies: any
    if (account.latestCookie) {
      cookies = JSON.parse(account.latestCookie)
    } else if (account.cookie) {
      cookies = parseCookies(account.cookie).map((i) => ({
        ...i,
        domain: account.project.domain,
      }))
    }
    ctx.message = ''
    ctx.status = 0

    if (!cookies) {
      throw new Error('No cookie')
    }

    await page.setCookie(...cookies)

    await next()

    let message
    if (typeof ctx.message === 'string') {
      message = ctx.message
    } else {
      message = JSON.stringify(ctx.message)
    }

    await prisma.record.create({
      data: {
        accountId: account.id,
        message,
        status: ctx.status,
      },
    })
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
