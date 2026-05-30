import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { MonthlyFinanceDiagnosis } from '../types/finance.types'

export function generateMonthlyDiagnosis(
  month: string,
  forceRefresh = false,
): Promise<MonthlyFinanceDiagnosis> {
  return apiRequest<MonthlyFinanceDiagnosis>('/finance/ai/monthly-diagnosis', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify({ month, forceRefresh }),
  })
}
