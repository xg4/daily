import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { isInteger } from 'lodash'
import { prisma } from '../helpers'

export const getTasks: Middleware = async (ctx) => {
  ctx.body = await prisma.task.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export const getTask: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isInteger(id)) {
    throw new createHttpError.BadRequest('参数错误')
  }

  const task = await prisma.task.findUnique({
    where: {
      id,
    },
  })
  if (!task) {
    throw new createHttpError.NotFound('任务不存在')
  }
  ctx.body = task
}

export const getCount: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isInteger(id)) {
    throw new createHttpError.BadRequest('参数错误')
  }

  ctx.body = await prisma.project.count({
    where: {
      taskId: id,
    },
  })
}
