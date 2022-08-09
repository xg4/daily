import type { Middleware } from '@koa/router'
import { exec, prisma } from '../helpers'

export const check: Middleware = async (ctx) => {
  const currentUser = ctx.state.jwt.user

  const accounts = await prisma.account.findMany({
    where: {
      authorId: currentUser.id,
    },
    include: {
      project: true,
    },
  })

  exec.register(accounts).run()

  ctx.status = 201
  ctx.body = 'success'
}

export const profile: Middleware = async (ctx) => {
  const currentUser = ctx.state.jwt.user

  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
  })

  ctx.body = user
}
