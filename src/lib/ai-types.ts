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
