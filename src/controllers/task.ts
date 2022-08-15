import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { isNumber } from 'lodash'
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
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入任务 id')
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
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入任务 id')
  }

  ctx.body = await prisma.project.count({
    where: {
      taskId: id,
    },
  })
}
