import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { ProcedureMarginsResponse } from '../types/finance.types'

export type ProcedureMarginsQuery = {
  month?: string
  startDate?: string
  endDate?: string
  profileId?: string
}

export function fetchProcedureMargins(
  query: ProcedureMarginsQuery = {},
): Promise<ProcedureMarginsResponse> {
  const params = new URLSearchParams()
  if (query.month) params.set('month', query.month)
  if (query.startDate) params.set('startDate', query.startDate)
  if (query.endDate) params.set('endDate', query.endDate)
  if (query.profileId) params.set('profileId', query.profileId)
  const qs = params.toString()
  return apiRequest<ProcedureMarginsResponse>(
    `/finance/analytics/procedure-margins${qs ? `?${qs}` : ''}`,
    {
      method: 'GET',
      accessToken: getAccessToken(),
    },
  )
}
