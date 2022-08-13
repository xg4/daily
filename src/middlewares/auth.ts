import createHttpError from 'http-errors'
import type { Middleware } from 'koa'
import { prisma } from '../helpers'

export function auth(): Middleware {
  return async (ctx, next) => {
    if (!ctx.state.jwt) {
      return await next()
    }
    const id = ctx.state.jwt.user.id

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    if (!user) {
      throw new createHttpError.Unauthorized('User not found')
    }

    ctx.user = user

    await next()
  }
}
