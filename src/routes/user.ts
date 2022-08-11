import Router from '@koa/router'
import { userController } from '../controllers'

const router = new Router({
  prefix: '/user',
})

router.get('/profile', userController.profile)

router.get('/daily', userController.check)

router.get('/:id', userController.getUser)

export { router as userRouter }
