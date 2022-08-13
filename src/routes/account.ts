import Router from '@koa/router'
import { accountController } from '../controllers'

const router = new Router({
  prefix: '/accounts',
})

router.get('/', accountController.getAccounts)

router.post('/', accountController.createAccount)

router.get('/:id', accountController.getAccount)

router.patch('/:id', accountController.updateAccount)

router.delete('/:id', accountController.deleteAccount)

// task
router.post('/:accountId/tasks/:taskId', accountController.createTask)

router.delete('/:accountId/tasks/:taskId', accountController.deleteTask)

// daily
router.get('/:accountId/:taskId', accountController.getDailyStatus)

router.post('/:id/daily', accountController.checkInById)

router.post('/daily', accountController.checkIn)

export { router as accountRouter }
