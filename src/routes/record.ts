import Router from '@koa/router'
import { recordController } from '../controllers'

const router = new Router({
  prefix: '/records',
})

router.get('/', recordController.getRecords)

router.get('/today', recordController.getTodayRecords)

export { router as recordRouter }
