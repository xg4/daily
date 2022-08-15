import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { isNumber } from 'lodash'
import { exec, prisma } from '../helpers'

export const getProjects: Middleware = async (ctx) => {
  const currentUser = ctx.user
  const projects = await prisma.project.findMany({
    where: {
      account: {
        authorId: currentUser.id,
      },
    },
    include: {
      task: true,
      account: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  })

  ctx.status = 201
  ctx.body = projects
}

export const createProject: Middleware = async (ctx) => {
  const accountId = +ctx.request.body['accountId']!
  const taskId = +ctx.request.body['taskId']!
  if (!isNumber(accountId) || !isNumber(taskId)) {
    throw new createHttpError.BadRequest('请输入账号 id，任务 id')
  }

  const savedProject = await prisma.project.findUnique({
    where: {
      accountId_taskId: {
        accountId,
        taskId,
      },
    },
  })

  if (savedProject) {
    throw new createHttpError.BadRequest('任务已存在')
  }

  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
    },
  })

  const currentUser = ctx.user
  if (account?.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('没有权限')
  }

  const project = await prisma.project.create({
    data: {
      accountId,
      taskId,
    },
  })

  ctx.status = 201
  ctx.body = project
}

export const deleteProject: Middleware = async (ctx) => {
  const accountId = +ctx.request.body['accountId']!
  const taskId = +ctx.request.body['taskId']!
  if (!isNumber(accountId) || !isNumber(taskId)) {
    throw new createHttpError.BadRequest('请输入账号 id，任务 id')
  }

  const currentUser = ctx.user
  const item = await prisma.project.findUnique({
    where: {
      accountId_taskId: {
        accountId,
        taskId,
      },
    },
    include: {
      account: true,
    },
  })

  if (item?.account.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('无权限')
  }

  await prisma.project.delete({
    where: {
      accountId_taskId: {
        accountId,
        taskId,
      },
    },
  })

  ctx.status = 204
}

export const checkIn: Middleware = async (ctx) => {
  const accountId = +ctx.request.body['accountId']!
  const taskId = +ctx.request.body['taskId']!
  if (!isNumber(accountId) || !isNumber(taskId)) {
    throw new createHttpError.BadRequest('请输入账号 id，任务 id')
  }

  const currentUser = ctx.user

  const project = await prisma.project.findFirst({
    where: {
      accountId,
      taskId,
      account: {
        authorId: currentUser.id,
      },
    },
    include: {
      task: true,
      account: true,
    },
  })

  if (!project) {
    throw new createHttpError.NotFound('任务不存在')
  }

  exec.register(project)

  ctx.status = 201
  ctx.body = '加入签到队列成功'
}

export const checkInAll: Middleware = async (ctx) => {
  const currentUser = ctx.user

  const projects = await prisma.project.findMany({
    where: {
      account: {
        authorId: currentUser.id,
      },
    },
    include: {
      account: true,
      task: true,
    },
  })

  exec.register(projects)

  ctx.status = 201
  ctx.body = '加入签到队列成功'
}
