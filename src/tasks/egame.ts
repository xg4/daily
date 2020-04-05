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
  await page.click(
    '#__layout > div > div.user-wrap > div.user-center > div.nav > div.nav-bd > ul:nth-child(3) > li > a'
  )

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

  await page.click(
    'body > div.gui-common-dialog.show > div.dialog-task > div.content > div.cnt-top > div:nth-child(1) > button'
  )
  await page.click('div.btn-cnt > button')

  return '签到成功'
}
