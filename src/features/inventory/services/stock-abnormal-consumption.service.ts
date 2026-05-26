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

export function checkAbnormalConsumptionCopilotCache(): Promise<
  AbnormalConsumptionCopilotResult | undefined
> {
  return apiRequest<AbnormalConsumptionCopilotResult | undefined>(
    '/stock/abnormal-consumption/copilot-summary',
    {
      method: 'POST',
      accessToken: getAccessToken(),
      body: JSON.stringify({ forceRefresh: false }),
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
