import type { Middleware } from '@koa/router'
import type { Account, Project, Record, Task } from '@prisma/client'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { isNumber, merge, pick } from 'lodash'
import { prisma } from '../helpers'

function filterRecord(
  record: Record & {
    project: Project & {
      task: Task
      account: Account
    }
  }
) {
  return merge(
    pick(record, ['id', 'accountId', 'taskId', 'createdAt', 'status']),
    {
      name: `[${record.project.task.name}]: ${record.project.account.name}`,
    }
  )
}

export const getRecords: Middleware = async (ctx) => {
  const currentUser = ctx.user

  const packages = await prisma.project.findMany({
    where: {
      account: {
        authorId: currentUser.id,
      },
    },
  })

  const records = await prisma.record.findMany({
    where: {
      accountId: {
        in: packages.map(({ accountId }) => accountId),
      },
      taskId: {
        in: packages.map(({ taskId }) => taskId),
      },
      status: 1,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      project: {
        include: {
          task: true,
          account: true,
        },
      },
    },
  })

  ctx.body = records.map(filterRecord)
}

export const getTodayRecords: Middleware = async (ctx) => {
  const currentUser = ctx.user

  const packages = await prisma.project.findMany({
    where: {
      account: {
        authorId: currentUser.id,
      },
    },
  })

  const startsAt = dayjs().startOf('day').toDate()
  const endsAt = dayjs().endOf('day').toDate()
  const records = await prisma.record.findMany({
    where: {
      accountId: {
        in: packages.map(({ accountId }) => accountId),
      },
      taskId: {
        in: packages.map(({ taskId }) => taskId),
      },
      status: 1,
      createdAt: {
        gte: startsAt,
        lte: endsAt,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      project: {
        include: {
          task: true,
          account: true,
        },
      },
    },
  })

  ctx.body = records.map(filterRecord)
}

export const getLatestRecord: Middleware = async (ctx) => {
  const accountId = +ctx.query['accountId']!
  const taskId = +ctx.query['taskId']!

  if (!isNumber(taskId) || !isNumber(accountId)) {
    throw new createHttpError.BadRequest('请输入账号 id，任务 id')
  }

  const currentUser = ctx.user

  const record = await prisma.record.findFirst({
    where: {
      accountId,
      taskId,
      status: 1,
      project: {
        account: {
          authorId: currentUser.id,
        },
      },
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
