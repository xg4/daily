import Router from '@koa/router'
import { accountController } from '../controllers'

const router = new Router({
  prefix: '/account',
})

router.get('/', accountController.getAll)

router.post('/', accountController.create)

export { router as accountRouter }
