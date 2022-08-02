import Project from '../helpers/project'

export const project = new Project()

project.use(
  { name: 'bilibili', envPrefix: 'BILIBILI_COOKIE', domain: '.bilibili.com' },
  async (ctx, next) => {
    const { page } = ctx
    await page.goto('https://live.bilibili.com/')
    ctx.body = await page.evaluate(async () =>
      fetch('https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign', {
        credentials: 'include',
      }).then((r) => r.json())
    )
    await next()
  }
)

project.use(
  {
    name: 'v2ex',
    envPrefix: 'V2EX_COOKIE',
    domain: '.v2ex.com',
  },
  async (ctx, next) => {
    const { page } = ctx
    await page.goto('https://www.v2ex.com/mission/daily', {
      waitUntil: 'domcontentloaded',
    })
    const main = await page.waitForSelector('#Main')
    if (!main) {
      throw new Error('not found #Main')
    }
    try {
      const btn = await page.waitForSelector('input[value="领取 X 铜币"]', {
        timeout: 10,
      })
      await Promise.all([btn?.click(), page.waitForNavigation()])
      ctx.body = await page.$eval(
        '#Main > div.box > div.message',
        (el) => el.textContent
      )
    } catch {
      ctx.body = await page.$eval(
        '#Main > div.box > div:nth-child(2) > span',
        (el) => el.textContent
      )
    }

    await next()
  }
)

project.use(
  {
    name: 'music163',
    envPrefix: 'MUSIC163_COOKIE',
    domain: '.music.163.com',
  },
  async (ctx, next) => {
    const { page } = ctx
    await page.goto('https://music.163.com/')

    const elementHandle = await page.waitForSelector('#g_iframe')
    if (!elementHandle) {
      throw new Error('not found #g_iframe')
    }
    const frame = await elementHandle.contentFrame()
    if (!frame) {
      throw new Error('not found frame')
    }

    const selector =
      '#discover-module > div.g-sd1 > div.n-user-profile > div > div > div > div > a'
    const checkInBtn = await frame.waitForSelector(selector)
    const checkInText = await frame.$eval(selector, (el) => el.textContent)
    if (!checkInBtn || !checkInText) {
      throw new Error('not found checkInBtn or checkInText')
    }
    if (checkInText.includes('已签到')) {
      ctx.body = checkInText
    } else {
      await checkInBtn.click()

      ctx.body = await page
        .waitForResponse((res) => {
          return res
            .url()
            .startsWith('https://music.163.com/weapi/point/dailyTask')
        })
        .then((res) => res.json())
    }

    await next()
  }
)

project.use(
  {
    name: 'acfun',
    envPrefix: 'ACFUN_COOKIE',
    domain: '.acfun.cn',
  },
  async (ctx, next) => {
    const { page } = ctx
    await page.goto('https://www.acfun.cn/member/')

    ctx.body = await page.evaluate(async () =>
      fetch('https://www.acfun.cn/rest/pc-direct/user/signIn').then((r) =>
        r.json()
      )
    )

    await next()
  }
)

project.use(
  {
    name: 'douyu',
    envPrefix: 'DOUYU_COOKIE',
    domain: '.douyu.com',
  },
  async (ctx, next) => {
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

    ctx.body = online.map((item: any) => item.nickname).join(' / ')
    await next()
  }
)

project.use(
  {
    name: 'juejin',
    envPrefix: 'JUEJIN_COOKIE',
    domain: '.juejin.cn',
  },
  async (ctx, next) => {
    const { page } = ctx

    await page.goto('https://juejin.cn/user/center/signin')
    await page.waitForSelector('.signin-content')
    const btn = await page.waitForSelector('.code-calender .btn')
    if (!btn) {
      throw new Error('not found btn')
    }
    const text = await btn.evaluate((el) => el.textContent)
    if (text && text.includes('已签到')) {
      ctx.body = text
    } else {
      const [result] = await Promise.all([
        page
          .waitForResponse((res) =>
            res.url().startsWith('https://api.juejin.cn/growth_api/v1/check_in')
          )
          .then((res) => res.json()),
        btn.click(),
      ])
      ctx.body = result
    }

    // 沾喜气
    // page.waitForResponse((res) =>
    //   res
    //     .url()
    //     .startsWith(
    //       'https://api.juejin.cn/growth_api/v1/lottery_lucky/dip_lucky'
    //     )
    // )

    // const btns = await page.$$('.tooltip-box')

    // 抽奖
    // await page.goto('https://juejin.cn/user/center/lottery')
    // const btn2 = await page.waitForSelector('#turntable-item-0')
    // if (!btn2) {
    //   throw new Error('not found btn2')
    // }
    // await Promise.all([
    //   page
    //     .waitForResponse((res) =>
    //       res
    //         .url()
    //         .startsWith('https://api.juejin.cn/growth_api/v1/lottery/draw')
    //     )
    //     .then((res) => res.json()),
    //   btn2.click(),
    // ])
    await next()
  }
)
