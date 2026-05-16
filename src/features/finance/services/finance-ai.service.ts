import { getAccessToken } from '@/features/auth/utils/session-storage'
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

export function analyzeFinanceWithAi(params: {
  from?: string
  to?: string
}): Promise<AiAnalysisResult> {
  return apiRequest<AiAnalysisResult>('/ai-assistant/finance/analyze', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(params),
  })
}

export async function getLatestFinanceAnalysis(): Promise<AiAnalysisResult | null> {
  try {
    const response = await apiRequest<{ data: AiAnalysisResult | null }>(
      '/ai-assistant/finance/latest',
      { method: 'GET', accessToken: getAccessToken() },
    )
    return response.data
  } catch {
    return null
  }
}
