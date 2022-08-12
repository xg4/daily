import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { isNumber } from 'lodash'
import { prisma } from '../helpers'

export const getProjects: Middleware = async (ctx) => {
  ctx.body = await prisma.project.findMany()
}

export const getProject: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入项目 id')
  }

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  })
  if (!project) {
    throw new createHttpError.NotFound('项目不存在')
  }
  ctx.body = project
}
