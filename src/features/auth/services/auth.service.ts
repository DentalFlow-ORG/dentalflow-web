import { apiRequest } from '@/services/http'

import type { AuthResponse, LoginPayload, RefreshResponse, RegisterPayload } from '../types'
import { getAccessToken } from '../utils/session-storage'

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCurrentUser() {
  return apiRequest<AuthResponse['user']>('/auth/me', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function logout() {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}

export function refresh(refreshToken: string) {
  return apiRequest<RefreshResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
    _skipRefresh: true,
  })
}
