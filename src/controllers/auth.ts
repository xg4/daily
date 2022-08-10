import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { prisma } from '../helpers'
import { hashPassword, isValidPassword, jwtSign } from '../utils'

export const login: Middleware = async (ctx) => {
  const { username, password } = ctx.request.body

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    throw new createHttpError.BadRequest('Invalid username or password')
  }

  const validate = await isValidPassword(password, user.password)

  if (!validate) {
    throw new createHttpError.BadRequest('Invalid username or password')
  }

  const accessToken = await jwtSign(user)
  ctx.body = {
    accessToken,
  }
}

export const signup: Middleware = async (ctx) => {
  const { username, password } = ctx.request.body
  const savedUser = await prisma.user.findUnique({
    where: {
      username,
    },
  })
  if (savedUser) {
    throw new createHttpError.BadRequest('用户已存在')
  }
  const hashedPassword = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  })

  const accessToken = await jwtSign(user)
  ctx.status = 201
  ctx.body = {
    accessToken,
  }
}
