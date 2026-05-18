import { getAccessToken } from '@/features/auth/utils/session-storage'
import type { AiQuotaInfo } from '@/lib/ai-types'
import { apiRequest } from '@/services/http'

export type AiAnalysisSection = {
  title: string
  content: string
  tone: 'positive' | 'warning' | 'danger' | 'neutral'
}

export type AiAnalysisResult = {
  sections: AiAnalysisSection[]
  disclaimer: string
  generatedAt: string
  model: string
  /** YYYY-MM-DD — present only for FINANCE analyses loaded from GET /latest */
  periodStart?: string | null
  /** YYYY-MM-DD — present only for FINANCE analyses loaded from GET /latest */
  periodEnd?: string | null
}

export type { AiQuotaInfo }

export type DataReadiness = {
  ready: boolean
  reason?: string
}

export type AiVisibility = 'FULL' | 'TEASER' | 'LOCKED' | 'INSUFFICIENT_DATA'

type AnalyzeResponse = { data: AiAnalysisResult; quota: AiQuotaInfo }
type LatestResponse = {
  data: AiAnalysisResult | null
  quota: AiQuotaInfo
  dataReadiness: DataReadiness
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
