import dotenv from 'dotenv'
import { prisma } from './helpers'
import Application from './helpers/application'
import { init, injectEnv, logger } from './middleware'
import { project } from './tasks'

dotenv.config()

async function main() {
  const app = new Application()

  const tasks = project.register()

  for (const t of tasks) {
    await prisma.task.upsert({
      where: {
        name: t.name,
      },
      update: t,
      create: t,
    })
  }

  app.use(logger())
  app.use(init)
  app.use(injectEnv)

  const accounts = await prisma.account.findMany({
    include: {
      task: true,
    },
  })

  app.use(project.tasks(accounts))

  await app.run()
}

main()
  .catch(console.log)
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
