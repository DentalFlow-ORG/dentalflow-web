import { requireApiUrl } from '@/config/env'
import { apiRequest } from '@/services/http'

import type {
  AuthResponse,
  CompleteProfilePayload,
  LoginPayload,
  MessageResponse,
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
  return `${requireApiUrl()}/auth/google`
}

export function logout() {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}

export function forgotPassword(email: string) {
  return apiRequest<MessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    _skipRefresh: true,
  })
}

export function resetPassword(token: string, newPassword: string) {
  return apiRequest<MessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    _skipRefresh: true,
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
