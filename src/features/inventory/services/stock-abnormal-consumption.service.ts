import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  AbnormalConsumptionCopilotResult,
  GetAbnormalConsumptionResponse,
} from '../types/inventory.types'

export function getAbnormalConsumption(): Promise<GetAbnormalConsumptionResponse> {
  return apiRequest<GetAbnormalConsumptionResponse>('/stock/abnormal-consumption', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

/**
 * Returns the most-recently persisted abnormal-consumption copilot analysis
 * from the DB, without checking the current anomaly-list state.
 * Returns undefined (HTTP 204) when no analysis has been generated yet.
 * Throws ApiError on plan errors (403).
 */
export function getLatestAbnormalConsumptionSummary(): Promise<
  AbnormalConsumptionCopilotResult | undefined
> {
  return apiRequest<AbnormalConsumptionCopilotResult | undefined>(
    '/stock/abnormal-consumption/copilot-summary/latest',
    {
      method: 'GET',
      accessToken: getAccessToken(),
    },
  )
}

export function generateAbnormalConsumptionCopilotSummary(): Promise<AbnormalConsumptionCopilotResult> {
  return apiRequest<AbnormalConsumptionCopilotResult>(
    '/stock/abnormal-consumption/copilot-summary',
    {
      method: 'POST',
      accessToken: getAccessToken(),
      body: JSON.stringify({ forceRefresh: true }),
    },
  )
}
