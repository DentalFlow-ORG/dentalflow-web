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
