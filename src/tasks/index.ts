import { TaskHandler } from '../types'

export const taskHandlers: Record<string, TaskHandler | undefined> = {
  bilibili: async function bilibili(page) {
    await page.goto('https://live.bilibili.com/')
    const result = await page.evaluate(async () =>
      fetch('https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign', {
        credentials: 'include',
      }).then((r) => r.json())
    )
    return JSON.stringify(result)
  },
  v2ex: async function v2ex(page) {
    await page.goto('https://www.v2ex.com/mission/daily', {
      waitUntil: 'domcontentloaded',
    })
    const main = await page.waitForSelector('#Main')
    if (!main) {
      throw new Error('not found #Main')
    }
    try {
      const btn = await page.waitForSelector('input[value="领取 X 铜币"]', {
        timeout: 2 * 1e3,
      })
      if (btn) {
        await Promise.all([btn.click(), page.waitForNavigation()])
        return '签到成功'
      }
    } catch {}
    return '已签到'
  },
  acfun: async function acfun(page) {
    await page.goto('https://www.acfun.cn/member/')

    const result = await page.evaluate(async () =>
      fetch('https://www.acfun.cn/rest/pc-direct/user/signIn').then((r) =>
        r.json()
      )
    )
    return JSON.stringify(result)
  },
  music163: async function music163(page) {
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
    if (checkInText.trim() === '已签到') {
      return '已签到'
    }
    await checkInBtn.click()
    const result = await page
      .waitForResponse((res) => {
        return res.url
          .toString()
          .startsWith('https://music.163.com/weapi/point/dailyTask')
      })
      .then((r) => r.json())
    return result
  },
}
