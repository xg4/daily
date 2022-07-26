import dayjs from 'dayjs'
import { pad } from 'lodash'
import type { Handler } from '../types'

export function logger(name = 'App'): Handler {
  return async (_, next) => {
    name = pad(name, 20, ' ')
    const now = Date.now()
    console.log(`[${name}] ---------> ${dayjs().format('MM-DD HH:mm:ss')}`)
    await next()
    console.log(`[${name}] <--------- +${(Date.now() - now) / 1e3}s`)
  }
}
