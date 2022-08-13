import type { Account, Prisma, Task, User } from '@prisma/client'
import type compose from 'koa-compose'
import type { Browser, Page } from 'puppeteer'

export interface TaskImpl extends Prisma.TaskCreateInput {
  handler: Middleware
}

type Ctx = {
  readonly browser: Browser

  page: Page

  message: any
  status: number
} & AccountWithTask

export type Middleware = compose.Middleware<Ctx>
export type ComposedMiddleware = compose.ComposedMiddleware<Ctx>

export type AccountWithTask = { account: Account } & { task: Task }

declare module 'koa' {
  type JwtUser = Pick<User, 'id' | 'username'>

  type JwtPayload = {
    user: JwtUser
    iat: number
  }
  interface BaseContext {
    state: {
      jwt: JwtPayload
    }
  }
}
