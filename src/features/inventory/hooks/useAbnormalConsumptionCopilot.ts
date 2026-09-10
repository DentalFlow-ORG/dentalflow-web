import {
  generateAbnormalConsumptionCopilotSummary,
  getLatestAbnormalConsumptionSummary,
} from '../services/stock-abnormal-consumption.service'
import type { AbnormalConsumptionCopilotResult } from '../types/inventory.types'
import { type UsePersistedCopilotResult, usePersistedCopilot } from './usePersistedCopilot'

export type UseAbnormalConsumptionCopilotResult =
  UsePersistedCopilotResult<AbnormalConsumptionCopilotResult>

export function useAbnormalConsumptionCopilot(): UseAbnormalConsumptionCopilotResult {
  return usePersistedCopilot(
    getLatestAbnormalConsumptionSummary,
    generateAbnormalConsumptionCopilotSummary,
  )
}
