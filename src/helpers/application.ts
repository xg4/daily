import compose, { Middleware } from 'koa-compose'
import puppeteer from 'puppeteer'
import { Ctx } from '../types'

export default class Application {
  middleware: Middleware<Ctx>[]

  constructor() {
    this.middleware = []
  }

  use(fn: Middleware<Ctx>) {
    this.middleware.push(fn)
    return this
  }

  async run() {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    this.middleware.unshift(async (ctx, next) => {
      await next()
      await browser.close()
    })
    const fn = compose(this.middleware)
    const ctx = {
      app: this,
      browser,
    }
    fn(ctx)
  }
}

export const app = new Application()
