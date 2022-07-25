import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const taskData: Prisma.TaskCreateInput[] = [
  {
    name: 'bilibili',
    envPrefix: 'BILIBILI_COOKIE',
    domain: '.bilibili.com',
  },
  {
    name: 'v2ex',
    envPrefix: 'V2EX_COOKIE',
    domain: '.v2ex.com',
  },
  {
    name: 'music163',
    envPrefix: 'MUSIC163_COOKIE',
    domain: '.music.163.com',
  },
  {
    name: 'acfun',
    envPrefix: 'ACFUN_COOKIE',
    domain: '.acfun.cn',
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of taskData) {
    const task = await prisma.task.create({
      data: u,
    })
    console.log(`Created user with id: ${task.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
