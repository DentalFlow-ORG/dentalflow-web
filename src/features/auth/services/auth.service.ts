import { apiRequest } from '@/services/http'

import type {
  AuthResponse,
  CompleteProfilePayload,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
} from '../types'
import { getAccessToken } from '../utils/session-storage'

let pendingRefresh: Promise<RefreshResponse> | null = null

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    _skipRefresh: true,
  })
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    _skipRefresh: true,
  })
}

export function getCurrentUser() {
  return apiRequest<AuthResponse['user']>('/auth/me', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function completeProfile(payload: CompleteProfilePayload) {
  return apiRequest<AuthResponse>('/auth/complete-profile', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function getGoogleOAuthStartUrl() {
  return `${import.meta.env.VITE_API_URL}/auth/google`
}

export function logout() {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}

export function refresh() {
  if (!pendingRefresh) {
    pendingRefresh = apiRequest<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      _skipRefresh: true,
    }).finally(() => {
      pendingRefresh = null
    })
  }

  return pendingRefresh
}
