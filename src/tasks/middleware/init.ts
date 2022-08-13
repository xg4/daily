import createHttpError from 'http-errors'
import { prisma } from '../../helpers'
import type { Middleware } from '../../types'

import type { AccountWithTask } from '../../types'

export function init(state: AccountWithTask): Middleware {
  return async (ctx, next) => {
    ctx.account = state.account
    ctx.task = state.task

    try {
      await next()
    } catch (err: any) {
      if (!createHttpError.isHttpError(err)) {
        // save unknown error message
        await prisma.record.create({
          data: {
            taskId: ctx.task.id,
            accountId: ctx.account.id,
            message: err.message,
            status: 0,
          },
        })
      }
    }
  }
}
