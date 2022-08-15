import Router from '@koa/router'
import { recordController } from '../controllers'

const router = new Router({
  prefix: '/records',
})

router.get('/', recordController.getRecords)

router.get('/today', recordController.getTodayRecords)

router.get('/latest', recordController.getLatestRecord)

export { router as recordRouter }
