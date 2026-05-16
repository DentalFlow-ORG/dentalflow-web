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

export function analyzeInventoryWithAi(): Promise<AiAnalysisResult> {
  return apiRequest<AiAnalysisResult>('/ai-assistant/inventory/analyze', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify({}),
  })
}

export async function getLatestInventoryAnalysis(): Promise<AiAnalysisResult | null> {
  try {
    const response = await apiRequest<{ data: AiAnalysisResult | null }>(
      '/ai-assistant/inventory/latest',
      { method: 'GET', accessToken: getAccessToken() },
    )
    return response.data
  } catch {
    return null
  }
}
