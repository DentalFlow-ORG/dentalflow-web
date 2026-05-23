import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { setupAuthRefresh } from '@/services/http'

import {
  completeProfile as completeProfileRequest,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refresh,
  register as registerRequest,
} from '../services/auth.service'
import { clearBillingStatusCache } from '@/features/billing/services/billing-status-cache'
import {
  clearSession,
  hasStoredSession,
  setSession,
  setTokens,
  updateStoredUser,
} from '../utils/session-storage'
import type {
  AuthUser,
  CompleteProfilePayload,
  LoginPayload,
  RegisterPayload,
} from '../types'
import { AuthContext, type AuthContextValue } from './auth-context'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    setupAuthRefresh({
      refreshTokens: () => refresh(),
      onTokenRefreshed: (accessToken) => {
        setTokens(accessToken)
      },
      onRefreshFailed: () => {
        clearSession()
        setUser(null)
        window.location.replace('/acessar')
      },
    })

    if (hasStoredSession()) {
      refresh()
        .then(({ accessToken }) => {
          setTokens(accessToken)
          return getCurrentUser()
        })
        .then((currentUser) => {
          setUser(currentUser)
          updateStoredUser(currentUser)
        })
        .catch(() => {
          clearSession()
          setUser(null)
        })
        .finally(() => {
          setIsBootstrapping(false)
        })
    } else {
      setIsBootstrapping(false)
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload)
    setSession(response.accessToken, response.user)
    setUser(response.user)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await registerRequest(payload)
    setSession(response.accessToken, response.user)
    setUser(response.user)
  }, [])

  const completeProfile = useCallback(async (payload: CompleteProfilePayload) => {
    const response = await completeProfileRequest(payload)
    setSession(response.accessToken, response.user)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearSession()
      clearBillingStatusCache()
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
      completeProfile,
      logout,
    }),
    [completeProfile, isBootstrapping, login, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
