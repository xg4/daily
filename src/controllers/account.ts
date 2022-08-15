import type { Middleware } from '@koa/router'
import type { Task } from '@prisma/client'
import { SHA256 } from 'crypto-js'
import createHttpError from 'http-errors'
import { isArray, isNumber, merge, omit, pick } from 'lodash'
import { prisma } from '../helpers'

const ACCOUNT_OMIT = ['cookie', 'latestCookie']

export const createAccount: Middleware = async (ctx) => {
  const { cookie, taskIds, name, description } = ctx.request.body

  if (!cookie || !name) {
    throw new createHttpError.BadRequest('cookie或name 不能为空')
  }

  const cookieHash = SHA256(cookie).toString()
  const savedAccount = await prisma.account.findUnique({
    where: {
      cookieHash,
    },
  })
  if (savedAccount) {
    throw new createHttpError.BadRequest('账号已存在')
  }

  const currentUser = ctx.user
  const account = await prisma.account.create({
    data: {
      name,
      description,
      cookie,
      cookieHash,
      authorId: currentUser.id,
    },
  })

  const ids = isArray(taskIds) ? taskIds.map(Number).filter(isNumber) : []
  const projects = await prisma.$transaction(
    ids.map((id) =>
      prisma.project.create({
        data: {
          accountId: account.id,
          taskId: id,
        },
        include: {
          task: true,
        },
      })
    )
  )

  ctx.status = 201
  ctx.body = merge(omit(account, ACCOUNT_OMIT), {
    tasks: projects.map((item) => item.task),
  })
}

export const getAccounts: Middleware = async (ctx) => {
  const currentUser = ctx.user

  const accounts = await prisma.account.findMany({
    where: {
      authorId: currentUser.id,
    },
  })

  ctx.body = await Promise.all(
    accounts.map(async (account) => {
      const projects = await prisma.project.findMany({
        where: {
          accountId: account.id,
        },
        include: {
          task: true,
        },
      })
      return merge(omit(account, ACCOUNT_OMIT), {
        tasks: projects.map((i) => i.task),
      })
    })
  )
}

export const updateAccount: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入账号 id')
  }

  const currentUser = ctx.user
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  })
  if (account?.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('无权限')
  }

  const newAccount = await prisma.account.update({
    where: {
      id,
    },
    data: pick(ctx.request.body, ['name', 'description']),
  })
  const { taskIds } = ctx.request.body
  let tasks: Task[] = []
  if (isArray(taskIds)) {
    const ids = taskIds.filter(isNumber)
    const list = await prisma.$transaction(
      ids.map((id) =>
        prisma.project.create({
          data: {
            accountId: newAccount.id,
            taskId: id,
          },
          include: {
            task: true,
          },
        })
      )
    )
    tasks = list.map((i) => i.task)
  }

  ctx.body = merge(omit(newAccount, ACCOUNT_OMIT), { tasks })
}

export const getAccount: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入账号 id')
  }

  const currentUser = ctx.user
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  })
  if (account?.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('无权限')
  }

  const list = await prisma.project.findMany({
    where: {
      accountId: account.id,
    },
    include: {
      task: true,
    },
  })

  ctx.body = merge(omit(account, ACCOUNT_OMIT), {
    tasks: list.map((i) => i.task),
  })
}

export const deleteAccount: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入账号 id')
  }

  const currentUser = ctx.user
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  })
  if (account?.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('无权限')
  }

  await prisma.$transaction([
    prisma.project.deleteMany({
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
