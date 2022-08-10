import type { Account, Project, User } from '@prisma/client'
import type compose from 'koa-compose'
import type { Browser, Page } from 'puppeteer'

type Ctx = {
  readonly browser: Browser

  page: Page
  account: AccountWithProject

  message: any
  status: number
}

export type Middleware = compose.Middleware<Ctx>
export type ComposedMiddleware = compose.ComposedMiddleware<Ctx>

export type AccountWithProject = Account & { project: Project }

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
