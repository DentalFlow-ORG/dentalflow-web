import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { ClinicProfile, UpdateClinicProfilePayload } from '../types/settings.types'

function auth() {
  return { accessToken: getAccessToken() }
}

export function getClinicProfile() {
  return apiRequest<ClinicProfile>('/clinic/profile', { method: 'GET', ...auth() })
}

export function updateClinicProfile(payload: UpdateClinicProfilePayload) {
  return apiRequest<ClinicProfile>('/clinic/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...auth(),
  })
}
