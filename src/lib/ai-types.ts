export type AiQuotaInfo = {
  allowed: boolean
  planKey: string | null
  used: number
  remaining: number
  limit: number
  nextResetAt: string
  lastGeneratedAt: string | null
  blockedReason: string | null
}

export type AiVisibility = 'FULL' | 'TEASER' | 'LOCKED' | 'INSUFFICIENT_DATA'

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
  periodStart?: string | null
  periodEnd?: string | null
}

export type AiDataReadiness = {
  ready: boolean
  reason?: string
}
