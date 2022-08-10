import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { prisma } from '../../helpers'
import type { Middleware } from '../../types'

export function record(): Middleware {
  return async (ctx, next) => {
    const record = await prisma.record.findFirst({
      where: {
        accountId: ctx.account.id,
        status: 1,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (record && dayjs(record.createdAt).isToday()) {
      throw createHttpError('今日已经执行过了')
    }

    // reset status and message
    ctx.message = ''
    ctx.status = 0

    await next()

    let message
    if (typeof ctx.message === 'string') {
      message = ctx.message
    } else {
      message = JSON.stringify(ctx.message)
    }

    await prisma.record.create({
      data: {
        accountId: ctx.account.id,
        message,
        status: ctx.status,
      },
    })
  }
}
