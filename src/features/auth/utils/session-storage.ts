import type { AuthUser } from '../types'

const ACCESS_TOKEN_KEY = 'dentalflow.accessToken'
const USER_KEY = 'dentalflow.user'

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredUser() {
  const user = window.localStorage.getItem(USER_KEY)

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user) as AuthUser
  } catch {
    clearSession()
    return null
  }
}

export function setSession(accessToken: string, user: AuthUser) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function setTokens(accessToken: string) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export function updateStoredUser(user: AuthUser) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}
