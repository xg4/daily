import Router from '@koa/router'
import { taskController } from '../controllers'

const router = new Router({
  prefix: '/tasks',
})

router.get('/', taskController.getTasks)

router.get('/:id', taskController.getTask)

router.get('/:id/count', taskController.getCount)

export { router as taskRouter }
