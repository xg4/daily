import { Task } from '@prisma/client'
import dayjs from 'dayjs'
import dotenv from 'dotenv'
import { app, prisma } from './helpers'
import * as fns from './tasks'
import { parseCookies } from './utils'

dotenv.config()

function injectEnv(tasks: Task[]) {
  return Promise.all(
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
}

async function main() {
  const tasks = await prisma.task.findMany()

  await injectEnv(tasks)

  app.use(async (ctx, next) => {
    const now = Date.now()
    console.log(`[App] ---------> ${dayjs().format('MM-DD HH:mm')}`)
    await next()
    console.log(`[App] <--------- +${(Date.now() - now) / 1e3}s`)
  })

  tasks.forEach(async (t) => {
    const handler = (fns as any)[t.name]
    if (!handler) {
      return
    }

    const accounts = await prisma.account.findMany({
      where: {
        published: true,
        taskId: t.id,
      },
    })

    accounts.forEach((account) => {
      app.use(async (ctx, next) => {
        console.log(`[${t.name}] ${account.id}`)

        let cookies: any
        if (account.pptrCookie) {
          cookies = JSON.parse(account.pptrCookie)
        } else if (account.cookie) {
          cookies = parseCookies(account.cookie).map((i) => ({
            ...i,
            domain: t.domain,
          }))
        }

        if (cookies) {
          const page = await ctx.browser.newPage()
          await page.setCookie(...cookies)
          await handler(page)
          const newCookies = await page.cookies()
          await prisma.account.update({
            where: {
              id: account.id,
            },
            data: {
              pptrCookie: JSON.stringify(newCookies),
            },
          })

          await page.deleteCookie(...newCookies)
          await page.close()
        }

        await next()
      })
    })
  })

  app.run()
}

main()
  .catch(console.log)
  .finally(() => {
    prisma.$disconnect()
  })
