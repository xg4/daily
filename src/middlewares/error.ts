import { Prisma } from '@prisma/client'
import createHttpError from 'http-errors'
import type { Middleware } from 'koa'

export function error(): Middleware {
  return async (ctx, next) => {
    return next().catch((err) => {
      if (createHttpError.isHttpError(err)) {
        ctx.status = err.statusCode
        ctx.body = {
          error: err.message,
        }
        return
      }

      if (err.status === 401) {
        ctx.status = 401
        ctx.body = {
          error: err.originalError ? err.originalError.message : err.message,
        }
        return
      }

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        ctx.status = 500
        ctx.body = {
          error: 'DB Error',
        }
        return
      }

      throw err
    })
  }
}
