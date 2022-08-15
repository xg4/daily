import type { Middleware } from '@koa/router'
import { SHA256 } from 'crypto-js'
import createHttpError from 'http-errors'
import {
  difference,
  intersection,
  isArray,
  isInteger,
  merge,
  omit,
} from 'lodash'
import { prisma } from '../helpers'

const ACCOUNT_OMIT: string[] = []

export const createAccount: Middleware = async (ctx) => {
  const { cookie, taskIds, name, description } = ctx.request.body

  if (!cookie || !name) {
    throw new createHttpError.BadRequest('参数错误')
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

  const ids = isArray(taskIds) ? taskIds.map(Number).filter(isInteger) : []
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

async function diffTasks(accountId: number, ids: number[]) {
  const allProjects = await prisma.project.findMany({
    where: {
      accountId,
    },
  })
  const allIds = allProjects.map((i) => i.taskId)
  const newIds = difference(ids, allIds)
  const projects = await prisma.$transaction(
    newIds.map((id) =>
      prisma.project.create({
        data: {
          accountId,
          taskId: id,
        },
        include: {
          task: true,
        },
      })
    )
  )
  const deletedIds = difference(allIds, ids)
  await prisma.project.deleteMany({
    where: {
      accountId,
      taskId: {
        in: deletedIds,
      },
    },
  })
  const savedIds = intersection(allIds, ids)
  const savedProjects = await prisma.project.findMany({
    where: {
      accountId,
      taskId: {
        in: savedIds,
      },
    },
    include: {
      task: true,
    },
  })
  return projects.concat(savedProjects).map((item) => item.task)
}

export const updateAccount: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isInteger(id)) {
    throw new createHttpError.BadRequest('参数错误')
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

  const { cookie, name, description } = ctx.request.body

  const newAccount = await prisma.account.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      cookie,
      cookieHash: SHA256(cookie).toString(),
    },
  })

  const { taskIds } = ctx.request.body
  const ids = isArray(taskIds) ? taskIds.map(Number).filter(isInteger) : []
  const tasks = await diffTasks(id, ids)

  ctx.body = merge(omit(newAccount, ACCOUNT_OMIT), { tasks })
}

export const getAccount: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isInteger(id)) {
    throw new createHttpError.BadRequest('参数错误')
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
  if (!isInteger(id)) {
    throw new createHttpError.BadRequest('参数错误')
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
