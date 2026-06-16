import type { AuthUser } from '../types'

const LEGACY_ACCESS_TOKEN_KEY = 'dentalflow.accessToken'
const USER_KEY = 'dentalflow.user'
const ACTIVE_SESSION_KEY = 'dentalflow.activeSession'

let accessToken: string | null = null
let currentUser: AuthUser | null = null

function removeLegacyPersistentSession() {
  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function hasStoredSession(): boolean {
  return window.localStorage.getItem(ACTIVE_SESSION_KEY) === '1'
}

export function getAccessToken() {
  return accessToken
}

export function setSession(accessToken: string, user: AuthUser) {
  window.localStorage.setItem(ACTIVE_SESSION_KEY, '1')
  setTokens(accessToken)
  updateStoredUser(user)
}

export function setTokens(newAccessToken: string) {
  accessToken = newAccessToken
  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
}

export function updateStoredUser(user: AuthUser) {
  currentUser = user
  window.localStorage.removeItem(USER_KEY)
}

export function clearSession() {
  accessToken = null
  currentUser = null
  window.localStorage.removeItem(ACTIVE_SESSION_KEY)
  removeLegacyPersistentSession()
}
