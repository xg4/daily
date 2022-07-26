import compose from 'koa-compose'
import type { Handler } from '../types'

export default class Application {
  middleware: Handler[]

  constructor() {
    this.middleware = []
  }

  use(middleware: Handler[]): Application
  use(middleware: Handler): Application
  use(middleware: Handler | Handler[]) {
    if (Array.isArray(middleware)) {
      for (const m of middleware) {
        this.use.call(this, m)
      }
      return this
    }
    this.middleware.push(middleware)
    return this
  }

  run() {
    const ctx: any = {
      app: this,
    }
    return compose(this.middleware)(ctx)
  }
}
