import dotenv from 'dotenv'

dotenv.config()

export default {
  ACFUN_USERNAME: process.env.ACFUN_USERNAME ?? '',
  ACFUN_PASSWORD: process.env.ACFUN_PASSWORD ?? ''
}
