import type { Task } from '../types'
import { acfun } from './acfun'
import { bilibili } from './bilibili'
import { douyu } from './douyu'
import { juejin, juejinLottery, juejinLucky } from './juejin'
import { music163 } from './music163'
import { v2ex } from './v2ex'

export const tasks: Task[] = [
  {
    name: 'acfun',
    description: '每日签到',
    domain: '.acfun.cn',
    handler: acfun,
  },
  {
    name: 'bilibili',
    domain: '.bilibili.com',
    handler: bilibili,
  },
  {
    name: 'douyu',
    domain: '.douyu.com',
    handler: douyu,
  },
  {
    name: 'v2ex',
    domain: '.v2ex.com',
    handler: v2ex,
  },
  {
    name: 'juejin',
    description: '每日签到',
    domain: '.juejin.cn',
    handler: juejin,
  },
  {
    name: 'juejin-lucky',
    description: '沾喜气',
    domain: '.juejin.cn',
    handler: juejinLucky,
  },
  {
    name: 'juejin-lottery',
    description: '抽奖',
    domain: '.juejin.cn',
    handler: juejinLottery,
  },
  {
    name: 'music163',
    domain: '.music.163.com',
    handler: music163,
  },
]
