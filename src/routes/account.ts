import Router from '@koa/router'
import { accountController } from '../controllers'

const router = new Router({
  prefix: '/account',
})

router.get('/', accountController.getAll)

router.post('/', accountController.create)

router.get('/:id', accountController.getAccount)

router.delete('/:id', accountController.deleteAccount)

export { router as accountRouter }
