import { createContext } from 'react'

import type {
  AuthUser,
  CompleteProfilePayload,
  LoginPayload,
  RegisterPayload,
} from '../types'

export type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  completeProfile: (payload: CompleteProfilePayload) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
