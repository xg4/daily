import cookie from 'cookie'
import puppeteer from 'puppeteer'
import CONFIG from '../config'

export default async function egame(page: puppeteer.Page) {
  // await page.goto('https://egame.qq.com/')
  const jar = cookie.parse(CONFIG.EGAME_COOKIE)
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: '.qq.com'
  }))
  await page.setCookie(...cookies)

  await page.goto('https://egame.qq.com/usercenter/userinfo')

  // 任务中心
  await page.click('.icon-task')
  await page.waitForSelector('.task-detail')

  const hideBtnArr = await page.$$('.task-detail .icon-down')
  for (const btn of hideBtnArr) {
    await btn.click()
  }

  try {
    const btnArr = await page.$$('.task-detail .btn-primary')
    for (const btn of btnArr) {
      await btn.click()
      try {
        const maskBtn = await page.waitForSelector('.get-gift .gui-mask')
        await maskBtn.click()
      } catch {
        // mask
      }
    }
  } catch (err) {
    console.log(err.message)
  }

  const giftArr = await page.$$('.progress-gift i')
  for (const btn of giftArr) {
    await btn.click()
  }

  await page.reload()

  // 签到
  await page.click('.sign-enter')
  await page.click('.btn-cnt > button')

  return '签到成功'
}
