import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { GetAbnormalConsumptionResponse } from '../types/inventory.types'

export function getAbnormalConsumption(): Promise<GetAbnormalConsumptionResponse> {
  return apiRequest<GetAbnormalConsumptionResponse>('/stock/abnormal-consumption', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}
