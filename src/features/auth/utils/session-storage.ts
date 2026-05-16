import type { AuthUser } from '../types'

const LEGACY_ACCESS_TOKEN_KEY = 'dentalflow.accessToken'
const USER_KEY = 'dentalflow.user'

let accessToken: string | null = null
let currentUser: AuthUser | null = null

function removeLegacyPersistentSession() {
  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function getAccessToken() {
  return accessToken
}

export function getStoredUser() {
  removeLegacyPersistentSession()
  return currentUser
}

export function setSession(accessToken: string, user: AuthUser) {
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
  removeLegacyPersistentSession()
}
