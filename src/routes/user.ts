import Router from '@koa/router'
import { userController } from '../controllers'

const router = new Router({
  prefix: '/users',
})

router.get('/profile', userController.profile)

router.get('/:id', userController.getUser)

export { router as userRouter }
