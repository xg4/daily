import type { Middleware } from '../types'

export const douyu: Middleware = async (ctx) => {
  const { page } = ctx

  const [_, res] = await Promise.all([
    await page.goto('https://www.douyu.com/directory/myFollow'),
    await page.waitForResponse((res: any) =>
      res
        .url()
        .startsWith('https://www.douyu.com/wgapi/livenc/liveweb/follow/list')
    ),
  ])

  const data: any = await res.json()
  if (data.error) {
    throw new Error(data.msg)
  }
  const online = data?.data?.list.filter((item: any) => item.online != '0')

  const ids = online.map((item: any) => item.room_id)

  async function checkIn(id: number) {
    await page.goto(`https://www.douyu.com/${id}`)

    try {
      await page.waitForSelector('[data-flag="room_level"]')
      await page.click('[data-flag="room_level"] .ActivityBtn')
    } catch {
      // not find
    }
  }

  for (const id of ids) {
    await checkIn(id)
  }

  ctx.message = online.map((item: any) => item.nickname).join(' / ')
}
