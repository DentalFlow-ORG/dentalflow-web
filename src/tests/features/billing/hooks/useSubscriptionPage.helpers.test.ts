import { describe, it, expect } from 'vitest'
import {
  getPlanFeatures,
  intervalAvailableForPlan,
  normalizeBillingInterval,
} from '@/features/billing/hooks/useSubscriptionPage'
import { makeBillingPlan } from '@/test-utils/factories/billing.factory'

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
    expect(intervalAvailableForPlan(makeBillingPlan({ hasMonthlyPrice: true }), 'MONTHLY')).toBe(true)
  })

  it('returns false for MONTHLY when plan lacks a monthly price', () => {
    expect(intervalAvailableForPlan(makeBillingPlan({ hasMonthlyPrice: false }), 'MONTHLY')).toBe(false)
  })

  it('returns true for YEARLY when plan has a yearly price', () => {
    expect(intervalAvailableForPlan(makeBillingPlan({ hasYearlyPrice: true }), 'YEARLY')).toBe(true)
  })

  it('returns false for YEARLY when plan lacks a yearly price', () => {
    expect(intervalAvailableForPlan(makeBillingPlan({ hasYearlyPrice: false }), 'YEARLY')).toBe(false)
  })
})

// ─── getPlanFeatures ──────────────────────────────────────────────────────────
// Uses slug 'unknown' so getPlanFeatureSummaries returns [] and assertions
// target only the capacity/flag strings that getPlanFeatures appends itself.

describe('getPlanFeatures', () => {
  it('includes a capped profile count string when maxProfiles is set', () => {
    const plan = makeBillingPlan({ slug: 'unknown', maxProfiles: 3 })
    expect(getPlanFeatures(plan)).toContain('Até 3 perfis')
  })

  it('includes "Perfis ilimitados" when maxProfiles is null', () => {
    const plan = makeBillingPlan({ slug: 'unknown', maxProfiles: null })
    expect(getPlanFeatures(plan)).toContain('Perfis ilimitados')
  })

  it('includes a leads limit string when maxLeadsPerMonth is set', () => {
    const plan = makeBillingPlan({ slug: 'unknown', maxLeadsPerMonth: 50 })
    expect(getPlanFeatures(plan)).toContain('Até 50 leads por mês')
  })

  it('omits the leads string when maxLeadsPerMonth is null', () => {
    const plan = makeBillingPlan({ slug: 'unknown', maxLeadsPerMonth: null })
    expect(getPlanFeatures(plan).some((f) => f.includes('leads por mês'))).toBe(false)
  })

  it('includes "Agendamentos online" when hasAppointments is true', () => {
    const plan = makeBillingPlan({ slug: 'unknown', hasAppointments: true })
    expect(getPlanFeatures(plan)).toContain('Agendamentos online')
  })

  it('omits "Agendamentos online" when hasAppointments is false', () => {
    const plan = makeBillingPlan({ slug: 'unknown', hasAppointments: false })
    expect(getPlanFeatures(plan)).not.toContain('Agendamentos online')
  })

  it('includes "Suporte prioritário" when hasPrioritySupport is true', () => {
    const plan = makeBillingPlan({ slug: 'unknown', hasPrioritySupport: true })
    expect(getPlanFeatures(plan)).toContain('Suporte prioritário')
  })

  it('returns a deduplicated list with no repeated feature strings', () => {
    const plan = makeBillingPlan({ slug: 'professional', maxProfiles: null })
    const result = getPlanFeatures(plan)
    expect(result.length).toBe(new Set(result).size)
  })
})
