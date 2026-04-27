import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
  register as registerRequest,
} from '../services/auth.service'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
  setTokens,
} from '../utils/session-storage'
import type { AuthUser, LoginPayload, RegisterPayload } from '../types'
import { AuthContext, type AuthContextValue } from './auth-context'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const accessToken = getAccessToken()

    if (!accessToken) {
      setIsBootstrapping(false)
      return
    }

    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        setSession(accessToken, getRefreshToken(), currentUser)
      })
      .catch(async () => {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          clearSession()
          setUser(null)
          return
        }

        try {
          const refreshedSession = await refreshSession()
          setTokens(refreshedSession.accessToken, refreshedSession.refreshToken)
          const currentUser = await getCurrentUser()

          setUser(currentUser)
          setSession(
            refreshedSession.accessToken,
            refreshedSession.refreshToken,
            currentUser,
          )
        } catch {
          clearSession()
          setUser(null)
        }
      })
      .finally(() => {
        setIsBootstrapping(false)
      })
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload)

    setSession(response.accessToken, response.refreshToken, response.user)
    setUser(response.user)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await registerRequest(payload)

    setSession(response.accessToken, response.refreshToken, response.user)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearSession()
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [isBootstrapping, login, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
