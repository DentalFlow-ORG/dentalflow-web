import { getAccessToken } from '@/features/auth/utils/session-storage'
import type { AiAnalysisResult, AiDataReadiness, AiQuotaInfo, AiVisibility } from '@/lib/ai-types'
import { apiRequest } from '@/services/http'

export type { AiAnalysisResult, AiQuotaInfo, AiVisibility }
export type { AiDataReadiness as DataReadiness }

type AnalyzeResponse = { data: AiAnalysisResult; quota: AiQuotaInfo }
type LatestResponse = {
  data: AiAnalysisResult | null
  quota: AiQuotaInfo
  dataReadiness: AiDataReadiness
  visibility: AiVisibility
}

export function analyzeInventoryWithAi(): Promise<AnalyzeResponse> {
  return apiRequest<AnalyzeResponse>('/ai-assistant/inventory/analyze', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify({}),
  })
}

export async function getLatestInventoryAnalysis(): Promise<LatestResponse | null> {
  try {
    return await apiRequest<LatestResponse>('/ai-assistant/inventory/latest', {
      method: 'GET',
      accessToken: getAccessToken(),
    })
  } catch {
    return null
  }
}
