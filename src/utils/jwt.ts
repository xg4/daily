import type { User } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { get, pick } from 'lodash'

export function jwtSign(user: User) {
  return jwt.sign(
    { user: pick(user, ['id', 'username']) },
    get(process.env, 'JWT_SECRET')!
  )
}

// export function jwtVerify(token: string) {
//   return new Promise((resolve, reject) =>
//     jwt.verify(token, get(process.env, 'JWT_SECRET')!, (err, decoded) => {
//       if (err) {
//         reject(err)
//         return
//       }
//       resolve(decoded)
//     })
//   )
// }
