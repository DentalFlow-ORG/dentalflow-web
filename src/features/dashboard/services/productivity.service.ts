import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { ProductivitySummary } from '../types/productivity.types'

function auth() {
  return { accessToken: getAccessToken() }
}

export function getProductivitySummary() {
  return apiRequest<ProductivitySummary>('/metrics/productivity', {
    method: 'GET',
    ...auth(),
  })
}
