import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import Koa from 'koa'
import mount from 'koa-mount'
import { api } from './modules'

dayjs.extend(isToday)

const app = new Koa()

app.use(mount('/api', api))

const port = process.env['PORT'] || 3000

app.listen(port, () => {
  console.log(`\n\n 🚀 Server is running on http://localhost:${port} \n\n`)
})
