import { acfun } from './acfun'
import { bilibili } from './bilibili'
import { douyu } from './douyu'
import { juejin } from './juejin'
import { music163 } from './music163'
import { v2ex } from './v2ex'

export const tasks = [
  { name: 'bilibili', handler: bilibili },
  { name: 'v2ex', handler: v2ex },
  { name: 'music163', handler: music163 },
  { name: 'acfun', handler: acfun },
  { name: 'juejin', handler: juejin },
  { name: 'douyu', handler: douyu },
]
