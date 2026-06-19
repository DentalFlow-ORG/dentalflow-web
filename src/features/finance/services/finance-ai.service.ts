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

export function analyzeFinanceWithAi(params: {
  from?: string
  to?: string
}): Promise<AnalyzeResponse> {
  return apiRequest<AnalyzeResponse>('/ai-assistant/finance/analyze', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(params),
  })
}

export async function getLatestFinanceAnalysis(): Promise<LatestResponse | null> {
  try {
    return await apiRequest<LatestResponse>('/ai-assistant/finance/latest', {
      method: 'GET',
      accessToken: getAccessToken(),
    })
  } catch {
    return null
  }
}
