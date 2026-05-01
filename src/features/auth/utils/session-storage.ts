import type { AuthUser } from '../types'

const ACCESS_TOKEN_KEY = 'dentalflow.accessToken'
const REFRESH_TOKEN_KEY = 'dentalflow.refreshToken'
const USER_KEY = 'dentalflow.user'

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
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

export function setSession(accessToken: string, refreshToken: string | null, user: AuthUser) {
  setTokens(accessToken, refreshToken)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function setTokens(accessToken: string, refreshToken: string | null) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export function updateStoredUser(user: AuthUser) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}
