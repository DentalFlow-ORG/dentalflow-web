import { getPlanCtaState } from '@/features/billing/utils/billing-cta-utils'
import { makeBillingPlan, makeBillingStatus } from '@/test-utils/factories/billing.factory'
import { describe, expect, it } from 'vitest'

type CtaArgs = Parameters<typeof getPlanCtaState>[0]

// Base args: active sub on a different (lower-order) plan, all gates open.
// The default resolves to the change_plan/upgrade branch.
function makeArgs(overrides: Partial<CtaArgs> = {}): CtaArgs {
  return {
    plan: makeBillingPlan({ slug: 'premium', displayOrder: 2 }),
    selectedInterval: 'YEARLY',
    currentSubscription: makeBillingStatus({
      hasSubscription: true,
      accessAllowed: true,
      stripeSubscriptionId: 'sub_123',
      planKey: 'professional',
      billingInterval: 'monthly',
    }),
    isCurrentPlan: false,
    canManageBilling: true,
    isAvailable: true,
    isActionPending: false,
    currentPlanDisplayOrder: 1,
    ...overrides,
  }
}

// ─── No subscription ──────────────────────────────────────────────────────────

describe('no subscription', () => {
  it('returns start_trial primary and checkout secondary when currentSubscription is null', () => {
    const result = getPlanCtaState(makeArgs({ currentSubscription: null }))
    expect(result.primary.actionType).toBe('start_trial')
    expect(result.secondary?.actionType).toBe('checkout')
  })

  it('returns start_trial primary and checkout secondary when hasSubscription is false', () => {
    const result = getPlanCtaState(
      makeArgs({ currentSubscription: makeBillingStatus({ hasSubscription: false }) }),
    )
    expect(result.primary.actionType).toBe('start_trial')
    expect(result.secondary?.actionType).toBe('checkout')
  })

  it('disables start_trial primary when plan is not trial eligible', () => {
    const plan = makeBillingPlan({ slug: 'premium', displayOrder: 2, trialEligible: false })
    const result = getPlanCtaState(makeArgs({ currentSubscription: null, plan }))
    expect(result.primary.actionType).toBe('start_trial')
    expect(result.primary.disabled).toBe(true)
    expect(result.secondary?.disabled).toBe(false)
  })

  it('shows promo helper text on checkout secondary when promotionReady is true', () => {
    const plan = makeBillingPlan({
      slug: 'premium',
      displayOrder: 2,
      campaign: {
        enabled: true,
        promotionalPriceMonthly: null,
        compareAtPriceMonthly: null,
        promotionReady: true,
        couponConfigured: false,
      },
    })
    const result = getPlanCtaState(makeArgs({ currentSubscription: null, plan }))
    expect(result.secondary?.helperText).toBe('Garanta a oferta de lançamento')
  })

  it('shows standard helper text on checkout secondary when promotionReady is false', () => {
    const result = getPlanCtaState(makeArgs({ currentSubscription: null }))
    expect(result.secondary?.helperText).toBe('Continuar para o checkout seguro')
  })
})

// ─── Current plan ─────────────────────────────────────────────────────────────

describe('current plan', () => {
  it('returns current_plan actionType and is always disabled for active current plan', () => {
    const result = getPlanCtaState(makeArgs({ isCurrentPlan: true }))
    expect(result.primary.actionType).toBe('current_plan')
    expect(result.primary.disabled).toBe(true)
    expect(result.secondary).toBeUndefined()
  })

  it('shows trialing label when isCurrentPlan and subscription status is trialing', () => {
    const sub = makeBillingStatus({ status: 'trialing' })
    const result = getPlanCtaState(makeArgs({ isCurrentPlan: true, currentSubscription: sub }))
    expect(result.primary.actionType).toBe('current_plan')
    expect(result.primary.label).toBe('Teste grátis ativo')
  })

  it('shows non-trial label when isCurrentPlan and subscription status is active', () => {
    const result = getPlanCtaState(makeArgs({ isCurrentPlan: true }))
    expect(result.primary.label).toBe('Plano atual')
  })
})

// ─── Access denied / reactivation ────────────────────────────────────────────

describe('access denied', () => {
  it('returns reactivate actionType for a canceled subscription', () => {
    const sub = makeBillingStatus({ accessAllowed: false, status: 'canceled' })
    const result = getPlanCtaState(makeArgs({ currentSubscription: sub }))
    expect(result.primary.actionType).toBe('reactivate')
    expect(result.primary.label).toBe('Reativar assinatura')
  })

  it('returns reactivate actionType for a non-canceled access-denied subscription', () => {
    const sub = makeBillingStatus({ accessAllowed: false, status: 'past_due' })
    const result = getPlanCtaState(makeArgs({ currentSubscription: sub }))
    expect(result.primary.actionType).toBe('reactivate')
    expect(result.primary.label).toBe('Assinar novamente')
  })
})

// ─── Access allowed, missing Stripe subscription ──────────────────────────────

describe('access allowed without Stripe subscription', () => {
  it('returns checkout actionType when access is allowed but stripeSubscriptionId is null', () => {
    const sub = makeBillingStatus({ accessAllowed: true, stripeSubscriptionId: null })
    const result = getPlanCtaState(makeArgs({ currentSubscription: sub }))
    expect(result.primary.actionType).toBe('checkout')
  })
})

// ─── Active subscription — plan / interval changes ───────────────────────────

describe('active subscription plan change', () => {
  it('returns change_plan with upgrade label when plan displayOrder exceeds current', () => {
    const plan = makeBillingPlan({ slug: 'premium', displayOrder: 2 })
    const sub = makeBillingStatus({ planKey: 'professional', billingInterval: 'monthly' })
    const result = getPlanCtaState(
      makeArgs({ plan, currentSubscription: sub, currentPlanDisplayOrder: 1 }),
    )
    expect(result.primary.actionType).toBe('change_plan')
    expect(result.primary.label).toBe('Fazer upgrade')
  })

  it('returns change_plan with generic label for a downgrade or lateral switch', () => {
    const plan = makeBillingPlan({ slug: 'starter', displayOrder: 0 })
    const sub = makeBillingStatus({ planKey: 'professional', billingInterval: 'monthly' })
    const result = getPlanCtaState(
      makeArgs({ plan, currentSubscription: sub, currentPlanDisplayOrder: 1 }),
    )
    expect(result.primary.actionType).toBe('change_plan')
    expect(result.primary.label).toBe('Trocar para este plano')
  })

  it('returns change_plan with "Mudar para anual" when switching to YEARLY on the same plan', () => {
    const plan = makeBillingPlan({ slug: 'professional', displayOrder: 1 })
    const sub = makeBillingStatus({ planKey: 'professional', billingInterval: 'monthly' })
    const result = getPlanCtaState(
      makeArgs({
        plan,
        currentSubscription: sub,
        selectedInterval: 'YEARLY',
        currentPlanDisplayOrder: 1,
      }),
    )
    expect(result.primary.actionType).toBe('change_plan')
    expect(result.primary.label).toBe('Mudar para anual')
  })

  it('returns change_plan with "Mudar para mensal" when switching to MONTHLY on the same plan', () => {
    const plan = makeBillingPlan({ slug: 'professional', displayOrder: 1 })
    const sub = makeBillingStatus({ planKey: 'professional', billingInterval: 'annual' })
    const result = getPlanCtaState(
      makeArgs({
        plan,
        currentSubscription: sub,
        selectedInterval: 'MONTHLY',
        currentPlanDisplayOrder: 1,
      }),
    )
    expect(result.primary.actionType).toBe('change_plan')
    expect(result.primary.label).toBe('Mudar para mensal')
  })
})

// ─── disabledBase propagation ─────────────────────────────────────────────────

describe('disabled state propagation', () => {
  it('disables primary and secondary CTAs when canManageBilling is false', () => {
    const result = getPlanCtaState(makeArgs({ currentSubscription: null, canManageBilling: false }))
    expect(result.primary.disabled).toBe(true)
    expect(result.secondary?.disabled).toBe(true)
  })

  it('disables primary and secondary CTAs when an action is already pending', () => {
    const result = getPlanCtaState(makeArgs({ currentSubscription: null, isActionPending: true }))
    expect(result.primary.disabled).toBe(true)
    expect(result.secondary?.disabled).toBe(true)
  })

  it('disables primary and secondary CTAs when the plan is not available', () => {
    const result = getPlanCtaState(makeArgs({ currentSubscription: null, isAvailable: false }))
    expect(result.primary.disabled).toBe(true)
    expect(result.secondary?.disabled).toBe(true)
  })
})
