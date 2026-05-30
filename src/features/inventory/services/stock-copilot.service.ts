import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { StockCopilotResult } from '../types/inventory.types'

/**
 * Fetches the cached copilot summary without triggering an AI call.
 * Returns undefined (HTTP 204) when no same-day cache exists.
 * Throws ApiError for plan/quota errors (403, 429).
 */
export function checkCopilotCache(): Promise<StockCopilotResult | undefined> {
  return apiRequest<StockCopilotResult | undefined>('/stock/purchase-list/copilot-summary', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify({ forceRefresh: false }),
  })
}

/**
 * Triggers a fresh AI call (always consumes quota).
 * Returns the generated result on success.
 * Throws ApiError for plan/quota/provider errors.
 */
export function generateCopilotSummary(): Promise<StockCopilotResult> {
  return apiRequest<StockCopilotResult>('/stock/purchase-list/copilot-summary', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify({ forceRefresh: true }),
  })
}
