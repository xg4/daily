import type { Middleware } from '@koa/router'
import type { Account, Task } from '@prisma/client'
import { SHA256 } from 'crypto-js'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { isArray, isNumber, merge, omit, pick } from 'lodash'
import { exec, prisma } from '../helpers'

const ACCOUNT_OMIT = ['cookie', 'latestCookie']

export const createTask: Middleware = async (ctx) => {
  const accountId = +ctx.params['accountId']!
  const taskId = +ctx.params['taskId']!
  if (!isNumber(accountId) || !isNumber(taskId)) {
    throw new createHttpError.BadRequest('请输入账号 id，任务 id')
  }

  const item = await prisma.tasksOnAccounts.findUnique({
    where: {
      accountId_taskId: {
        accountId,
        taskId,
      },
    },
  })

  const currentUser = ctx.state.jwt.user
  if (item) {
    throw new createHttpError.BadRequest('任务已存在')
  }

  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
    },
  })

  if (account?.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('没有权限')
  }

  const newItem = await prisma.tasksOnAccounts.create({
    data: {
      accountId,
      taskId,
    },
  })

  ctx.status = 201
  ctx.body = newItem
}

export const createAccount: Middleware = async (ctx) => {
  const { cookie, taskIds, name, description } = ctx.request.body

  if (!cookie || !name) {
    throw new createHttpError.BadRequest('cookie或name 不能为空')
  }

  const cookieHash = SHA256(cookie).toString()
  const savedAccount = await prisma.account.findFirst({
    where: {
      OR: [{ cookieHash }, { name }],
    },
  })
  if (savedAccount) {
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

  let tasks: Task[] = []
  if (isArray(taskIds)) {
    const ids = taskIds.filter(isNumber)
    const list = await prisma.$transaction(
      ids.map((id) =>
        prisma.tasksOnAccounts.create({
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
    tasks = list.map((i) => i.task)
  }

  ctx.status = 201
  ctx.body = merge(omit(account, ACCOUNT_OMIT), { tasks })
}

export const getAccounts: Middleware = async (ctx) => {
  const currentUser = ctx.state.jwt.user

  const accounts = await prisma.account.findMany({
    where: {
      authorId: currentUser.id,
    },
  })

  ctx.body = await Promise.all(
    accounts.map(async (account) => {
      const list = await prisma.tasksOnAccounts.findMany({
        where: {
          accountId: account.id,
        },
        include: {
          task: true,
        },
      })
      return merge(omit(account, ACCOUNT_OMIT), {
        tasks: list.map((i) => i.task),
      })
    })
  )
}

export const updateAccount: Middleware = async (ctx) => {
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
  const { taskIds } = ctx.request.body
  let tasks: Task[] = []
  if (isArray(taskIds)) {
    const ids = taskIds.filter(isNumber)
    const list = await prisma.$transaction(
      ids.map((id) =>
        prisma.tasksOnAccounts.create({
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

  const currentUser = ctx.state.jwt.user
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  })
  if (account?.authorId !== currentUser.id) {
    throw new createHttpError.Forbidden('无权限')
  }

  const list = await prisma.tasksOnAccounts.findMany({
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

export const deleteTask: Middleware = async (ctx) => {
  const accountId = +ctx.params['accountId']!
  const taskId = +ctx.params['taskId']!
  if (!isNumber(accountId) || !isNumber(taskId)) {
    throw new createHttpError.BadRequest('请输入账号 id，任务 id')
  }

  const currentUser = ctx.state.jwt.user
  const item = await prisma.tasksOnAccounts.findUnique({
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

  await prisma.tasksOnAccounts.delete({
    where: {
      accountId_taskId: {
        accountId,
        taskId,
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
    prisma.tasksOnAccounts.deleteMany({
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

  const list = await prisma.tasksOnAccounts.findMany({
    where: {
      accountId: account.id,
    },
    include: {
      task: true,
    },
  })

  exec.register(list.map((item) => ({ account, task: item.task })))
}
