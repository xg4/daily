import type { Middleware } from '@koa/router'
import type { Account } from '@prisma/client'
import { SHA256 } from 'crypto-js'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { isArray, isNumber, omit } from 'lodash'
import { exec, prisma } from '../helpers'

const ACCOUNT_OMIT = ['cookie', 'latestCookie']

export const create: Middleware = async (ctx) => {
  const { cookie, projectIds } = ctx.request.body

  if (!cookie) {
    throw new createHttpError.BadRequest('cookie 不能为空')
  }

  const cookieHash = SHA256(cookie).toString()
  const savedCookie = await prisma.account.findUnique({
    where: {
      cookieHash,
    },
  })
  if (savedCookie) {
    throw new createHttpError.BadRequest('账号已存在')
  }

  const currentUser = ctx.state.jwt.user
  const account = await prisma.account.create({
    data: {
      cookie,
      cookieHash,
      authorId: currentUser.id,
      projects: {
        create: isArray(projectIds)
          ? projectIds.map((projectId) => ({
              projectId,
            }))
          : [],
      },
    },
    include: {
      projects: {
        include: {
          project: true,
        },
      },
    },
  })

  ctx.status = 201
  ctx.body = omit(account, ACCOUNT_OMIT)
}

export const getAll: Middleware = async (ctx) => {
  const currentUser = ctx.state.jwt.user

  const accounts = await prisma.account.findMany({
    where: {
      authorId: currentUser.id,
    },
    include: {
      projects: {
        include: {
          project: true,
        },
      },
    },
  })

  ctx.body = accounts.map((account) => omit(account, ACCOUNT_OMIT))
}

export const getOne: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入账号 id')
  }

  const currentUser = ctx.state.jwt.user
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
    include: {
      projects: {
        include: {
          project: true,
        },
      },
    },
  })
  if (account?.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('无权限')
  }

  ctx.body = omit(account, ACCOUNT_OMIT)
}

export const deleteAccount: Middleware = async (ctx) => {
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

  await prisma.$transaction([
    prisma.projectsOnAccounts.deleteMany({
      where: {
        accountId: id,
      },
    }),
    prisma.record.deleteMany({
      where: {
        accountId: id,
      },
    }),
    prisma.account.delete({
      where: {
        id,
      },
    }),
  ])

  ctx.status = 204
}

export const getDailyStatus: Middleware = async (ctx) => {
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

  const record = await prisma.record.findFirst({
    where: {
      accountId: id,
      status: 1,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!record) {
    throw new createHttpError.NotFound('没有找到签到记录')
  }

  ctx.body = dayjs(record.createdAt).isToday()
}

export const checkInById: Middleware = async (ctx) => {
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

  await register(account)

  ctx.status = 201
  ctx.body = '加入签到队列成功'
}

export const checkIn: Middleware = async (ctx) => {
  const currentUser = ctx.state.jwt.user

  const accounts = await prisma.account.findMany({
    where: {
      authorId: currentUser.id,
    },
  })

  await register(accounts)

  ctx.status = 201
  ctx.body = '加入签到队列成功'
}

function register(account: Account[]): Promise<void>
function register(account: Account): Promise<void>
async function register(account: Account | Account[]): Promise<void> {
  if (Array.isArray(account)) {
    for (const item of account) {
      await register(item)
    }
    return
  }

  const list = await prisma.projectsOnAccounts.findMany({
    where: {
      accountId: account.id,
    },
    include: {
      project: true,
    },
  })

  exec.register(list.map((item) => ({ account, project: item.project })))
}
