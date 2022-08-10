import Router from '@koa/router'
import { accountRouter } from './account'
import { authRouter } from './auth'
import { projectRouter } from './project'
import { userRouter } from './user'

export const router = new Router({
  prefix: '/api',
})

router
  .use(projectRouter.routes())
  .use(userRouter.routes())
  .use(authRouter.routes())
  .use(accountRouter.routes())
