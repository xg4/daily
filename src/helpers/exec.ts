import compose from 'koa-compose'
import { noop } from 'lodash'
import puppeteer, { Browser } from 'puppeteer'
import { tasks } from '../tasks'
import { cookie, error, inject, logger, record } from '../tasks/middleware'
import type { AccountWithProject, ComposedMiddleware } from '../types'

export default class Executor {
  static browser?: Browser

  static async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }

    return this.browser
  }

  private queue: ComposedMiddleware[] = []
  private running = false

  register(account: AccountWithProject[]): Executor
  register(account: AccountWithProject): Executor
  register(account: AccountWithProject | AccountWithProject[]): Executor {
    if (Array.isArray(account)) {
      for (const item of account) {
        this.register.call(this, item)
      }
      return this
    }

    const task = tasks.find((t) => t.name === account.project.name)
    if (!task) {
      return this
    }

    const handlers = [error(), inject(account), record(), logger(), cookie()]
    handlers.push(task.handler)
    this.use(compose(handlers))
    return this
  }

  use(handler: ComposedMiddleware[]): Executor
  use(handler: ComposedMiddleware): Executor
  use(handler: ComposedMiddleware | ComposedMiddleware[]) {
    if (Array.isArray(handler)) {
      for (const h of handler) {
        this.use.call(this, h)
      }
      return this
    }
    this.queue.push(handler)
    return this
  }

  async run() {
    if (this.running) {
      return
    }
    this.running = true
    const fns = [...this.queue]
    this.queue = []
    const browser = await Executor.getBrowser()
    const ctx: any = {
      browser,
    }

    for (const fn of fns) {
      await fn(ctx).catch(noop)
    }

    this.running = false
    if (this.queue.length) {
      await this.run()
    }
  }
}

export const exec = new Executor()
