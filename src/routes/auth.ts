import Router from '@koa/router'
import { authController } from '../controllers'

const router = new Router({
  prefix: '/auth',
})

router.post('/login', authController.login)

router.post('/signup', authController.signup)

export { router as authRouter }
