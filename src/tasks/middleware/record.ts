import dayjs from 'dayjs'
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
      throw new Error('You have already logged today')
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
