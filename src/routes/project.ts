import Router from '@koa/router'
import { projectController } from '../controllers'

const router = new Router({
  prefix: '/project',
})

router.get('/', projectController.getProjects)

router.get('/:id', projectController.getProject)

export { router as projectRouter }
