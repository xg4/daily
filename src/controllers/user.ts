import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { isNumber, pick } from 'lodash'
import { exec, prisma } from '../helpers'

export const checkIn: Middleware = async (ctx) => {
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
  ctx.body = '加入签到队列成功'
}

export const profile: Middleware = async (ctx) => {
  const currentUser = ctx.state.jwt.user

  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
  })

  ctx.body = pick(user, ['id', 'username', 'email'])
}

export const getUser: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入用户 id')
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })
  if (!user) {
    throw new createHttpError.NotFound('用户不存在')
  }
  ctx.body = pick(user, ['id', 'username', 'email'])
}
