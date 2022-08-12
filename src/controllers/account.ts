import type { Middleware } from '@koa/router'
import { SHA256 } from 'crypto-js'
import createHttpError from 'http-errors'
import { isNumber, omit } from 'lodash'
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

export const getAccount: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入账号 id')
  }

  const currentUser = ctx.state.jwt.user
  const account = await prisma.account.findFirst({
    where: {
      id,
      authorId: currentUser.id,
    },
  })
  if (!account) {
    throw new createHttpError.NotFound('账号不存在')
  }

  ctx.body = omit(account, ['cookie', 'latestCookie'])
}

export const deleteAccount: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入账号 id')
  }

  const currentUser = ctx.state.jwt.user
  const account = await prisma.account.findFirst({
    where: {
      id,
      authorId: currentUser.id,
    },
  })
  if (!account) {
    throw new createHttpError.NotFound('账号不存在')
  }

  await prisma.account.delete({
    where: {
      id,
    },
  })

  ctx.status = 204
}

export const getRecords: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入账号 id')
  }

  const currentUser = ctx.state.jwt.user

  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  })

  if (account?.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('无权限')
  }

  const records = await prisma.record.findMany({
    where: {
      accountId: id,
      status: 1,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  ctx.body = records
}
