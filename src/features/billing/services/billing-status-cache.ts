import type { CurrentBillingStatus } from '../types/billing.types'

const TTL_MS = 60_000 // 60 seconds

type CacheEntry = {
  value: CurrentBillingStatus
  expiresAt: number
}

let entry: CacheEntry | null = null

export function getCachedBillingStatus(): CurrentBillingStatus | null {
  if (!entry || Date.now() > entry.expiresAt) return null
  return entry.value
}

export function setCachedBillingStatus(status: CurrentBillingStatus): void {
  entry = { value: status, expiresAt: Date.now() + TTL_MS }
}

export function clearBillingStatusCache(): void {
  entry = null
}
