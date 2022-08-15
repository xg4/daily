import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { isInteger, pick } from 'lodash'
import { prisma } from '../helpers'

export const profile: Middleware = async (ctx) => {
  const currentUser = ctx.user

  ctx.body = pick(currentUser, ['id', 'username', 'email'])
}

export const getUser: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isInteger(id)) {
    throw new createHttpError.BadRequest('参数错误')
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
