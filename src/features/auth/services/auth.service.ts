import { apiRequest } from '@/services/http'

import type { AuthResponse, LoginPayload, RegisterPayload } from '../types'
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
  const accessToken = getAccessToken()

  return apiRequest<AuthResponse['user']>('/auth/me', {
    method: 'GET',
    accessToken: accessToken ?? undefined,
  })
}

export function logout() {
  const accessToken = getAccessToken()

  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    accessToken: accessToken ?? undefined,
  })
}
