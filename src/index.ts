import dotenv from 'dotenv'
import { prisma } from './helpers'
import Application from './helpers/application'
import { init, injectEnv, logger } from './middleware'
import { project } from './tasks'

dotenv.config()

async function main() {
  const app = new Application()

  app.use(logger())
  app.use(init)
  app.use(injectEnv)

  await project.register()
  app.use(project.tasks())

  await app.run()
}

main()
  .catch(console.log)
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
