import crypto from 'crypto'
import request from 'superagent'
import { URL } from 'url'

/**
 * 生成钉钉 🤖️ 签名
 * @param {string} value
 * @param {string} secret
 * @returns
 */
function sign(value: string, secret: string) {
  return crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest()
    .toString('base64')
}

interface AtData {
  /** 被@人的手机号(在content里添加@人的手机号) */
  atMobiles?: string[]
  /** @所有人时：true，否则为：false */
  isAtAll?: boolean
}

interface ActionCardData {
  /** 首屏会话透出的展示内容 */
  title: string
  /** markdown格式的消息 */
  text: string

  /** 0-按钮竖直排列，1-按钮横向排列 */
  btnOrientation?: string
  /** 0-正常发消息者头像，1-隐藏发消息者头像 */
  hideAvatar?: string

  /** 单个按钮的方案。(设置此项和singleURL后btns无效) */
  singleTitle?: string
  /** 点击singleTitle按钮触发的URL */
  singleURL?: string

  /** 按钮的信息：title-按钮方案，actionURL-点击按钮触发的URL */
  btns?: any[]
}

interface LinkData {
  /** 消息标题 */
  title: string
  /** 消息内容。如果太长只会部分展示 */
  text: string
  /** 点击消息跳转的URL */
  messageUrl: string
  /** 图片URL */
  picUrl?: string
}

interface MarkdownData {
  /** 首屏会话透出的展示内容 */
  title: string
  /** markdown格式的消息 */
  text: string
}

interface FeedCardData {
  /** 单条信息文本 */
  title: string
  /** 点击单条信息到跳转链接 */
  messageURL: string
  /** 单条信息后面图片的URL */
  picURL: string
}

export default class Bot {
  constructor(private webhook: string, private secret: string) {}

  private async send(content: any) {
    const url = new URL(this.webhook)
    const timestamp = Date.now()
    url.searchParams.set('timestamp', timestamp.toString())
    url.searchParams.set(
      'sign',
      sign(timestamp + '\n' + this.secret, this.secret)
    )
    const { body } = await request
      .post(url.toString())
      .retry(2)
      .send(content)
    if (body.errcode !== 0) {
      return Promise.reject(body.errmsg)
    }
    return body
  }

  /**
   * 发送纯文本消息，支持@群内成员
   * @param content 消息内容
   * @param at @用户
   */
  text(content: string, at: AtData = {}) {
    return this.send({
      msgtype: 'text',
      text: {
        content
      },
      at
    })
  }

  /**
   * 发送单个图文链接
   * @param data @interface LinkData
   */
  link(data: LinkData) {
    return this.send({
      msgtype: 'link',
      link: data
    })
  }

  /**
   *
   * @param title 首屏会话透出的展示内容
   * @param content markdown格式的消息
   * @param at @用户
   */
  markdown(data: MarkdownData, at: AtData = {}) {
    return this.send({
      msgtype: 'markdown',
      markdown: data,
      at
    })
  }

  /**
   * 发送actionCard(动作卡片)
   * 支持多个按钮，支持Markdown
   * @param data
   */
  actionCard(data: ActionCardData) {
    return this.send({
      msgtype: 'actionCard',
      actionCard: data
    })
  }

  /**
   * 发送feedCard，支持多图文链接
   * links可包含多个link，建议不要超过4个
   * @param links
   */
  feedCard(links: FeedCardData[]) {
    return this.send({
      msgtype: 'feedCard',
      feedCard: {
        links
      }
    })
  }
}
