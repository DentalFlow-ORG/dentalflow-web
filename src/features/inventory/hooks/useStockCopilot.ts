import { generateCopilotSummary, getLatestCopilotSummary } from '../services/stock-copilot.service'
import type { StockCopilotResult } from '../types/inventory.types'
import { type UsePersistedCopilotResult, usePersistedCopilot } from './usePersistedCopilot'

export type UseStockCopilotResult = UsePersistedCopilotResult<StockCopilotResult>

export function useStockCopilot(): UseStockCopilotResult {
  return usePersistedCopilot(getLatestCopilotSummary, generateCopilotSummary)
}
