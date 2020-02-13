import dotenv from 'dotenv'

dotenv.config()

export default {
  DINGTALK_WEBHOOK: process.env.DINGTALK_WEBHOOK ?? '',
  DINGTALK_SECRET: process.env.DINGTALK_SECRET ?? '',
  ACFUN_USERNAME: process.env.ACFUN_USERNAME ?? '',
  ACFUN_PASSWORD: process.env.ACFUN_PASSWORD ?? '',
  MUSIC163_USERNAME: process.env.MUSIC163_USERNAME ?? '',
  MUSIC163_PASSWORD: process.env.MUSIC163_PASSWORD ?? '',
  V2EX_COOKIE: process.env.V2EX_COOKIE ?? '',
  BILIBILI_COOKIE: process.env.BILIBILI_COOKIE ?? ''
}
