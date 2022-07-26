import type { Account, Task } from '@prisma/client'
import type { Middleware } from 'koa-compose'
import type { Browser, Page } from 'puppeteer'
import type Application from '../helpers/application'
import type Project from '../helpers/project'

export interface Ctx {
  app: Application
  project: Project

  browser: Browser
  page: Page

  body: any
}

export type AccountWithTask = Account & { task: Task }

export type Handler = Middleware<Ctx>
