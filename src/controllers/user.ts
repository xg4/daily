import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { isNumber, pick } from 'lodash'
import { prisma } from '../helpers'

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
