import dotenv from 'dotenv'

dotenv.config()

export default {
  ACFUN_USERNAME: process.env.ACFUN_USERNAME ?? '',
  ACFUN_PASSWORD: process.env.ACFUN_PASSWORD ?? '',
  MUSIC163_USERNAME: process.env.MUSIC163_USERNAME ?? '',
  MUSIC163_PASSWORD: process.env.MUSIC163_PASSWORD ?? '',
  V2EX_COOKIE: process.env.V2EX_COOKIE ?? ''
}
