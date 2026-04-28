import type { AuthUser } from './auth.types'

export type StoredSession = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
