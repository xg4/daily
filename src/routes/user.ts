import Router from '@koa/router'
import { userController } from '../controllers'

const router = new Router({
  prefix: '/user',
})

router.get('/profile', userController.profile)

router.get('/daily', userController.check)

export { router as userRouter }
