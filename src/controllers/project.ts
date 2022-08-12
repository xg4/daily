import type { Middleware } from '@koa/router'
import createHttpError from 'http-errors'
import { isNumber } from 'lodash'
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

export const deleteProject: Middleware = async (ctx) => {
  const id = +ctx.params['id']!
  if (!isNumber(id)) {
    throw new createHttpError.BadRequest('请输入项目 id')
  }

  const currentUser = ctx.state.jwt.user

  const project = await prisma.project.findFirst({
    where: {
      id,
      authorId: currentUser.id,
    },
  })
  if (!project) {
    throw new createHttpError.NotFound('项目不存在')
  }
  await prisma.project.delete({
    where: {
      id,
    },
  })
  ctx.status = 204
}
