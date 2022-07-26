import { prisma } from '../helpers'
import type { Handler } from '../types'

export const injectEnv: Handler = async (_, next) => {
  const tasks = await prisma.task.findMany()
  await Promise.all(
    tasks.map(async (task) => {
      const keys = Object.keys(process.env).filter((k) =>
        k.startsWith(task.envPrefix)
      )
      await Promise.all(
        keys.map(async (k) => {
          const cookie = process.env[k]
          if (!cookie) {
            return
          }
          const saved = await prisma.account.findUnique({
            where: {
              cookie,
            },
          })
          if (saved) {
            return
          }
          return prisma.account.create({
            data: {
              cookie,
              taskId: task.id,
              published: true,
            },
          })
        })
      )
    })
  )

  await next()
}
