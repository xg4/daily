import createHttpError from 'http-errors'
import { prisma } from '../../helpers'
import type { Middleware } from '../../types'

import type { AccountWithProject } from '../../types'

export function init(state: AccountWithProject): Middleware {
  return async (ctx, next) => {
    ctx.account = state.account
    ctx.project = state.project

    try {
      await next()
    } catch (err: any) {
      if (!createHttpError.isHttpError(err)) {
        // save unknown error message
        await prisma.record.create({
          data: {
            projectId: ctx.project.id,
            accountId: ctx.account.id,
            message: err.message,
            status: 0,
          },
        })
      }
    }
  }
}
