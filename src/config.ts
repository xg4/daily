import dotenv from 'dotenv'

dotenv.config()

export default {
  DINGTALK_WEBHOOK: process.env.DINGTALK_WEBHOOK ?? '',
  DINGTALK_SECRET: process.env.DINGTALK_SECRET ?? '',
  ACFUN_COOKIE: process.env.ACFUN_COOKIE ?? '',
  MUSIC163_COOKIE: process.env.MUSIC163_COOKIE ?? '',
  V2EX_COOKIE: process.env.V2EX_COOKIE ?? '',
  BILIBILI_COOKIE: process.env.BILIBILI_COOKIE ?? '',
  DOUYU_COOKIE: process.env.DOUYU_COOKIE ?? '',
  EGAME_COOKIE: process.env.EGAME_COOKIE ?? ''
}
