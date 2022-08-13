import cors from '@koa/cors'
import Koa from 'koa'
import body from 'koa-body'
import jwt from 'koa-jwt'
import logger from 'koa-logger'
import { get, pick } from 'lodash'
import { prisma } from '../helpers'
import { errorHandler } from '../middlewares'
import { router } from '../routes'
import { tasks } from '../tasks'

async function initDB() {
  await Promise.all(
    tasks.map(async (t) => {
      const task = pick(t, ['name', 'description', 'domain'])
      await prisma.task.upsert({
        where: {
          name: task.name,
        },
        create: task,
        update: task,
      })
    })
  )
}

initDB()

export const app = new Koa()

if (process.env['NODE_ENV'] !== 'production') {
  app.use(logger())
}

app
  .use(errorHandler())
  .use(cors())
  .use(body())
  .use(
    jwt({ key: 'jwt', secret: get(process.env, 'JWT_SECRET')! }).unless({
      path: [/^\/api\/auth/],
    })
  )
  .use(router.routes())
  .use(router.allowedMethods())

export { app as api }
