import cors from '@koa/cors'
import Koa from 'koa'
import body from 'koa-body'
import jwt from 'koa-jwt'
import logger from 'koa-logger'
import { get } from 'lodash'
import { errorHandler } from './middlewares'
import { router } from './routes'

const app = new Koa()

app
  .use(errorHandler())
  .use(logger())
  .use(cors())
  .use(body())
  .use(
    jwt({ key: 'jwt', secret: get(process.env, 'JWT_SECRET')! }).unless({
      path: [/^\/auth/],
    })
  )
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000, () => {
  console.log('Server is running on port http://localhost:3000')
})
