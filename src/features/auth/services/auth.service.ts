import { apiRequest } from '@/services/http'

import type { AuthResponse, LoginPayload, RegisterPayload } from '../types'
import { getAccessToken, getRefreshToken } from '../utils/session-storage'

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
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
    body: JSON.stringify({ refreshToken: getRefreshToken() }),
  })
}
