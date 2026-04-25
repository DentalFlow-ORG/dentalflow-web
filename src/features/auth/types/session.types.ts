import type { AuthUser } from './auth.types'

export type StoredSession = {
  accessToken: string
  user: AuthUser
}
