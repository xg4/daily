import Router from '@koa/router'
import { accountRouter } from './account'
import { authRouter } from './auth'
import { projectRouter } from './project'
import { recordRouter } from './record'
import { taskRouter } from './task'
import { userRouter } from './user'

export const router = new Router()

router
  .use(taskRouter.routes())
  .use(userRouter.routes())
  .use(authRouter.routes())
  .use(accountRouter.routes())
  .use(recordRouter.routes())
  .use(projectRouter.routes())
