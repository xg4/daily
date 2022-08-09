import type { Middleware } from '@koa/router'
import { SHA256 } from 'crypto-js'
import createHttpError from 'http-errors'
import { prisma } from '../helpers'

export const create: Middleware = async (ctx) => {
  let { cookie, projectId } = ctx.request.body

  if (!cookie || !projectId) {
    throw new createHttpError.BadRequest('cookie或projectId不能为空')
  }

  projectId = +projectId

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  })
  if (!project) {
    throw new createHttpError.BadRequest('项目不存在')
  }

  const cookieHash = SHA256(cookie).toString()
  const savedCookie = await prisma.account.findUnique({
    where: {
      cookieHash,
    },
  })
  if (savedCookie) {
    throw new createHttpError.BadRequest('cookie已存在')
  }

  const currentUser = ctx.state.jwt.user
  const account = await prisma.account.create({
    data: {
      cookie,
      cookieHash,
      projectId,
      authorId: currentUser.id,
    },
  })
  ctx.status = 201
  ctx.body = account
}

export const getAll: Middleware = async (ctx) => {
  const currentUser = ctx.state.jwt.user

  const accounts = await prisma.account.findMany({
    where: {
      authorId: currentUser.id,
    },
  })
  ctx.body = accounts
}
