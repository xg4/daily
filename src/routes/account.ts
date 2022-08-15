import Router from '@koa/router'
import { accountController } from '../controllers'

const router = new Router({
  prefix: '/accounts',
})

router.get('/', accountController.getAccounts)

router.post('/', accountController.createAccount)

router.get('/:id', accountController.getAccount)

router.put('/:id', accountController.updateAccount)

router.delete('/:id', accountController.deleteAccount)

export { router as accountRouter }
