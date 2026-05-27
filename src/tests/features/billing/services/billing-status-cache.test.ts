import {
  clearBillingStatusCache,
  getCachedBillingStatus,
  setCachedBillingStatus,
} from '@/features/billing/services/billing-status-cache'

import type { CurrentBillingStatus } from '@/features/billing/types/billing.types'

const TTL_MS = 60_000

function makeStatus(overrides: Partial<CurrentBillingStatus> = {}): CurrentBillingStatus {
  return {
    hasSubscription: true,
    status: 'active',
    planKey: 'professional',
    planName: 'Professional',
    billingInterval: 'monthly',
    stripeCustomerId: 'cus_123',
    stripeSubscriptionId: 'sub_123',
    trialEndsAt: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    accessAllowed: true,
    requiresPlanSelection: false,
    requiresPayment: false,
    message: '',
    ...overrides,
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  clearBillingStatusCache()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('billing-status-cache', () => {
  it('returns null when no value has been set', () => {
    expect(getCachedBillingStatus()).toBeNull()
  })

  it('returns the cached value within the TTL', () => {
    const status = makeStatus()
    setCachedBillingStatus(status)
    expect(getCachedBillingStatus()).toBe(status)
  })

  it('returns null after the TTL expires', () => {
    setCachedBillingStatus(makeStatus())
    vi.advanceTimersByTime(TTL_MS + 1)
    expect(getCachedBillingStatus()).toBeNull()
  })

  it('still returns a value 1 ms before the TTL expires', () => {
    const status = makeStatus()
    setCachedBillingStatus(status)
    vi.advanceTimersByTime(TTL_MS - 1)
    expect(getCachedBillingStatus()).toBe(status)
  })

  it('clearBillingStatusCache makes subsequent reads return null', () => {
    setCachedBillingStatus(makeStatus())
    clearBillingStatusCache()
    expect(getCachedBillingStatus()).toBeNull()
  })

  it('a second setCachedBillingStatus call replaces the previous value', () => {
    const first = makeStatus({ planKey: 'starter' })
    const second = makeStatus({ planKey: 'premium' })
    setCachedBillingStatus(first)
    setCachedBillingStatus(second)
    expect(getCachedBillingStatus()).toBe(second)
  })

  it('does not mutate the stored object — returns same reference', () => {
    const status = makeStatus()
    setCachedBillingStatus(status)
    const retrieved = getCachedBillingStatus()
    expect(retrieved).toBe(status)
  })
})
