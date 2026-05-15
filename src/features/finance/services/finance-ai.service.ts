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
}

export function analyzeFinanceWithAi(params: {
  from?: string
  to?: string
}): Promise<AiAnalysisResult> {
  return apiRequest<AiAnalysisResult>('/ai/finance', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(params),
  })
}
