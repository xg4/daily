import { prisma } from '../helpers'
import type { AccountWithTask, Handler } from '../types'
import { parseCookies } from '../utils'

export function injectCookie(account: AccountWithTask): Handler {
  return async (ctx, next) => {
    const page = await ctx.browser.newPage()
    ctx.page = page

    let cookies: any
    if (account.pptrCookie) {
      cookies = JSON.parse(account.pptrCookie)
    } else if (account.cookie) {
      cookies = parseCookies(account.cookie).map((i) => ({
        ...i,
        domain: account.task.domain,
      }))
    }
    ctx.body = `${account.task.name} - ${account.id} start`

    if (!cookies) {
      return next()
    }

    await page.setCookie(...cookies)

    await next()

    let content
    if (typeof ctx.body === 'string') {
      content = ctx.body
    } else {
      content = JSON.stringify(ctx.body)
    }

    await prisma.record.create({
      data: {
        accountId: account.id,
        taskId: account.task.id,
        content,
      },
    })
    const newCookies = await page.cookies()
    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        pptrCookie: JSON.stringify(newCookies),
      },
    })

    await page.deleteCookie(...newCookies)
    await page.close()
  }
}
