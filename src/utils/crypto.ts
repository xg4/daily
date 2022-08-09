import bcrypt from 'bcryptjs'

export function isValidPassword(pwd: string, hash: string) {
  return bcrypt.compare(pwd, hash)
}

export function hashPassword(pwd: string) {
  return bcrypt.hash(pwd, 10)
}
