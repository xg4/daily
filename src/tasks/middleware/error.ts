import createHttpError from 'http-errors'
import { prisma } from '../../helpers'
import type { Middleware } from '../../types'

export function error(): Middleware {
  return async (ctx, next) =>
    next().catch(async (err) => {
      const { account } = ctx
      if (!createHttpError.isHttpError(err)) {
        await prisma.record.create({
          data: {
            accountId: account.id,
            message: err.message,
            status: 0,
          },
        })
      }
    })
}
