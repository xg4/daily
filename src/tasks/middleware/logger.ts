import type { Middleware } from '../../types'

export function logger(): Middleware {
  return async (ctx, next) => {
    const name = ctx.task.name
    const id = ctx.account.id
    const now = Date.now()
    console.log(`\t <-- ${name} ${id}`)
    await next()
    console.log(`\t --> ${name} ${id} +${(Date.now() - now) / 1e3}s`)
  }
}
