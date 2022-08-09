import type { AccountWithProject, Middleware } from '../../types'

export function logger(account: AccountWithProject): Middleware {
  return async (_, next) => {
    const name = account.project.name
    const id = account.id
    const now = Date.now()
    console.log(`\t <-- ${name} ${id}`)
    await next()
    console.log(`\t --> ${name} ${id} +${(Date.now() - now) / 1e3}s`)
  }
}
