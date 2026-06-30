import {
  intervalAvailableForPlan,
  normalizeBillingInterval,
} from '@/features/billing/hooks/useSubscriptionPage'
import { makeBillingPlan } from '@/test-utils/factories/billing.factory'
import { describe, expect, it } from 'vitest'

// ─── normalizeBillingInterval ─────────────────────────────────────────────────

describe('normalizeBillingInterval', () => {
  it('maps MONTHLY to "monthly"', () => {
    expect(normalizeBillingInterval('MONTHLY')).toBe('monthly')
  })

  it('maps YEARLY to "annual"', () => {
    expect(normalizeBillingInterval('YEARLY')).toBe('annual')
  })
})

// ─── intervalAvailableForPlan ─────────────────────────────────────────────────

describe('intervalAvailableForPlan', () => {
  it('returns true for MONTHLY when plan has a monthly price', () => {
    expect(intervalAvailableForPlan(makeBillingPlan({ hasMonthlyPrice: true }), 'MONTHLY')).toBe(
      true,
    )
  })

  it('returns false for MONTHLY when plan lacks a monthly price', () => {
    expect(intervalAvailableForPlan(makeBillingPlan({ hasMonthlyPrice: false }), 'MONTHLY')).toBe(
      false,
    )
  })

  it('returns true for YEARLY when plan has a yearly price', () => {
    expect(intervalAvailableForPlan(makeBillingPlan({ hasYearlyPrice: true }), 'YEARLY')).toBe(true)
  })

  it('returns false for YEARLY when plan lacks a yearly price', () => {
    expect(intervalAvailableForPlan(makeBillingPlan({ hasYearlyPrice: false }), 'YEARLY')).toBe(
      false,
    )
  })
})
