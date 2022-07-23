import cookie from 'cookie'

export function parseCookies(value: string) {
  const jar = cookie.parse(value)
  return Object.entries(jar).map(([name, value]) => ({
    name,
    value,
  }))
}
