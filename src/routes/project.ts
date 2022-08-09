import Router from '@koa/router'
import { projectController } from '../controllers'

const router = new Router({
  prefix: '/project',
})

router.get('/', projectController.getAll)

router.post('/', projectController.create)

export { router as projectRouter }
