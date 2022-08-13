import Router from '@koa/router'
import { accountController } from '../controllers'

const router = new Router({
  prefix: '/account',
})

router.get('/', accountController.getAll)

router.post('/', accountController.create)

router.get('/:id', accountController.getOne)

router.patch('/:id', accountController.updateOne)

router.delete('/:id', accountController.deleteAccount)

// project
router.post('/:accountId/project/:projectId', accountController.createProject)

router.delete('/:accountId/project/:projectId', accountController.deleteProject)

// daily
router.get('/:id/daily', accountController.getDailyStatus)

router.post('/:id/daily', accountController.checkInById)

router.post('/daily', accountController.checkIn)

export { router as accountRouter }
