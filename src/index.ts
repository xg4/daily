import cors from '@koa/cors'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import Koa from 'koa'
import body from 'koa-body'
import jwt from 'koa-jwt'
import logger from 'koa-logger'
import { get } from 'lodash'
import { errorHandler } from './middlewares'
import { router } from './routes'

dayjs.extend(isToday)

const app = new Koa()

app
  .use(errorHandler())
  .use(logger())
  .use(cors())
  .use(body())
  .use(
    jwt({ key: 'jwt', secret: get(process.env, 'JWT_SECRET')! }).unless({
      path: [/^(?!\/api)/, /^\/api\/auth/],
    })
  )
  .use(router.routes())
  .use(router.allowedMethods())

const port = process.env['PORT'] || 3000

app.listen(port, () => {
  console.log(`\n\n 🚀 Server is running on http://localhost:${port} \n\n`)
})
