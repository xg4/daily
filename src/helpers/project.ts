import type { Prisma } from '@prisma/client'
import retry from 'async-retry'
import compose from 'koa-compose'
import { injectCookie, logger } from '../middleware'
import type { AccountWithTask, Handler } from '../types'

class Layer {
  name: string

  constructor(public opt: Prisma.TaskCreateInput, public handler: Handler) {
    this.name = opt.name
  }

  toJSON() {
    return this.opt
  }
}

export default class Project {
  stack: Layer[] = []

  register() {
    return this.stack.map((s) => s.toJSON())
  }

  use(opt: Prisma.TaskCreateInput, ...middleware: Handler[]) {
    for (const m of middleware) {
      const layer = new Layer(opt, m)
      this.stack.push(layer)
    }

    return this
  }

  tasks(accounts: AccountWithTask[]) {
    return accounts.map((account) => {
      return this.compose(
        account,
        logger(`${account.task.name} - ${account.id}`),
        injectCookie(account)
      )
    })
  }

  compose(account: AccountWithTask, ...middleware: Handler[]) {
    const dispatch: Handler = async (ctx, next) => {
      ctx.project = this

      const layerChain = this.stack
        .filter((s) => s.name === account.task.name)
        .reduce((memo: Handler[], layer) => {
          return memo.concat(layer.handler)
        }, [])

      if (!layerChain.length) {
        return next()
      }

      layerChain.unshift(...middleware)
      try {
        await retry(() => compose(layerChain)(ctx), {
          retries: 2,
        })
      } catch (e) {
        console.log(`[${account.task.name} - ${account.id}]`, e)
      }
      await next()
    }

    return dispatch
  }
}
