import Router from '@koa/router'
import { projectController } from '../controllers'

const router = new Router({
  prefix: '/projects',
})

router.get('/', projectController.getProjects)

router.post('/', projectController.createProject)

router.delete('/', projectController.deleteProject)

router.post('/check-in', projectController.checkIn)

router.post('/check-in/all', projectController.checkInAll)

export { router as projectRouter }
