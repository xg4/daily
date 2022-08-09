import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { prisma } from '../helpers'

export const getAll: Middleware = async (ctx) => {
  ctx.body = await prisma.project.findMany()
}

export const create: Middleware = async (ctx) => {
  const { name, description, domain } = ctx.request.body
  const currentUser = ctx.state.jwt.user
  const savedProject = await prisma.project.findUnique({
    where: {
      name,
    },
  })
  if (savedProject) {
    throw new createHttpError.BadRequest('项目已存在')
  }
  const project = await prisma.project.create({
    data: {
      name,
      description,
      domain,
      authorId: currentUser.id,
    },
  })
  ctx.status = 201
  ctx.body = project
}
