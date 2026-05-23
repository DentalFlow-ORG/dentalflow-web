import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { AttentionResponse } from '../types/attention.types'

export function getPatientsAttention() {
  return apiRequest<AttentionResponse>('/patients/attention', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}
