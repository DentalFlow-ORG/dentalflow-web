import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { StockCopilotResult } from '../types/inventory.types'

/**
 * Returns the most-recently persisted stock copilot analysis from the DB,
 * without checking the current purchase-list state.
 * Returns undefined (HTTP 204) when no analysis has been generated yet.
 * Throws ApiError on plan errors (403).
 */
export function getLatestCopilotSummary(): Promise<StockCopilotResult | undefined> {
  return apiRequest<StockCopilotResult | undefined>(
    '/stock/purchase-list/copilot-summary/latest',
    {
      method: 'GET',
      accessToken: getAccessToken(),
    },
  )
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
