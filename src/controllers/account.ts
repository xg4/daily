import type { Middleware } from '@koa/router'
import type { Account, Project } from '@prisma/client'
import { SHA256 } from 'crypto-js'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { isArray, isNumber, merge, omit, pick } from 'lodash'
import { exec, prisma } from '../helpers'

const ACCOUNT_OMIT = ['cookie', 'latestCookie']

export const createProject: Middleware = async (ctx) => {
  const accountId = +ctx.params['accountId']!
  const projectId = +ctx.params['projectId']!
  if (!isNumber(accountId) || !isNumber(projectId)) {
    throw new createHttpError.BadRequest('请输入账号 id或项目 id')
  }

  const item = await prisma.projectsOnAccounts.findUnique({
    where: {
      accountId_projectId: {
        accountId,
        projectId,
      },
    },
  })

  const currentUser = ctx.state.jwt.user
  if (item) {
    throw new createHttpError.BadRequest('该项目已经存在')
  }

  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
    },
  })

  if (account?.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('没有权限')
  }

  const newItem = await prisma.projectsOnAccounts.create({
    data: {
      accountId,
      projectId,
    },
  })

  ctx.status = 201
  ctx.body = newItem
}

export const create: Middleware = async (ctx) => {
  const { cookie, projectIds, name, description } = ctx.request.body

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
      name,
      description,
      cookie,
      cookieHash,
      authorId: currentUser.id,
    },
  })

  let projects: Project[] = []
  if (isArray(projectIds)) {
    const ids = projectIds.filter(isNumber)
    const list = await prisma.$transaction(
      ids.map((id) =>
        prisma.projectsOnAccounts.create({
          data: {
            accountId: account.id,
            projectId: id,
          },
          include: {
            project: true,
          },
        })
      )
    )
    projects = list.map((i) => i.project)
  }

  ctx.status = 201
  ctx.body = omit(merge(account, { projects }), ACCOUNT_OMIT)
}

export const getAll: Middleware = async (ctx) => {
  const currentUser = ctx.state.jwt.user

  const accounts = await prisma.account.findMany({
    where: {
      authorId: currentUser.id,
    },
  })

  ctx.body = await Promise.all(
    accounts.map(async (account) => {
      const list = await prisma.projectsOnAccounts.findMany({
        where: {
          accountId: account.id,
        },
        include: {
          project: true,
        },
      })
      return merge(omit(account, ACCOUNT_OMIT), {
        projects: list.map((i) => i.project),
      })
    })
  )
}

export const updateOne: Middleware = async (ctx) => {
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

  const newAccount = await prisma.account.update({
    where: {
      id,
    },
    data: pick(ctx.request.body, ['name', 'description']),
  })
  const { projectIds } = ctx.request.body
  let projects: Project[] = []
  if (isArray(projectIds)) {
    const ids = projectIds.filter(isNumber)
    const _projects = await prisma.$transaction(
      ids.map((id) =>
        prisma.projectsOnAccounts.create({
          data: {
            accountId: newAccount.id,
            projectId: id,
          },
          include: {
            project: true,
          },
        })
      )
    )
    projects = _projects.map((i) => i.project)
  }

  ctx.body = omit(merge(newAccount, { projects }), ACCOUNT_OMIT)
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

export const deleteProject: Middleware = async (ctx) => {
  const accountId = +ctx.params['accountId']!
  const projectId = +ctx.params['projectId']!
  if (!isNumber(accountId) || !isNumber(projectId)) {
    throw new createHttpError.BadRequest('请输入账号 id或项目 id')
  }

  const currentUser = ctx.state.jwt.user
  const item = await prisma.projectsOnAccounts.findUnique({
    where: {
      accountId_projectId: {
        accountId,
        projectId,
      },
    },
    include: {
      account: true,
    },
  })

  if (item?.account.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('无权限')
  }

  await prisma.projectsOnAccounts.delete({
    where: {
      accountId_projectId: {
        accountId,
        projectId,
      },
    },
  })

  ctx.status = 204
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
