import type { AdminFinanceSubscription } from '@/features/admin/types/admin-finance.types'
import {
  formatCurrencyFromCents,
  formatDate,
  formatInterval,
  getSubscriptionAmount,
} from '@/features/admin/utils/admin-finance-format'

function makeSubscription(
  overrides: Partial<AdminFinanceSubscription> = {},
): AdminFinanceSubscription {
  return {
    id: 'sub-1',
    clinic: { id: 'c1', name: 'Clínica Demo', email: 'demo@clinica.com' },
    plan: { id: 'p1', name: 'Profissional', slug: 'pro', priceMonthly: 9900, priceYearly: 99000 },
    status: 'ACTIVE',
    trialEndsAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    endedAt: null,
    items: [],
    ...overrides,
  } as AdminFinanceSubscription
}

describe('formatCurrencyFromCents', () => {
  it('formats cents as BRL currency', () => {
    expect(formatCurrencyFromCents(9900)).toMatch(/R\$\s?99,00/)
  })

  it('formats a custom currency', () => {
    expect(formatCurrencyFromCents(100, 'USD')).toContain('1,00')
  })
})

describe('formatDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatDate('2026-06-15T12:00:00.000Z')).toBe('15/06/2026')
  })

  it('returns a dash for null', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('returns a dash for undefined', () => {
    expect(formatDate(undefined)).toBe('-')
  })
})

describe('formatInterval', () => {
  it('formats YEARLY', () => {
    expect(formatInterval('YEARLY')).toBe('Anual')
  })

  it('formats MONTHLY', () => {
    expect(formatInterval('MONTHLY')).toBe('Mensal')
  })

  it('returns a dash for null', () => {
    expect(formatInterval(null)).toBe('-')
  })

  it('returns a dash for undefined', () => {
    expect(formatInterval(undefined)).toBe('-')
  })
})

describe('getSubscriptionAmount', () => {
  it('uses the first item unitAmount when present', () => {
    const subscription = makeSubscription({
      items: [
        {
          id: 'item-1',
          stripePriceId: 'price_1',
          priceNickname: null,
          billingInterval: 'MONTHLY',
          unitAmount: 5000,
          unitAmountDecimal: null,
          currency: 'brl',
          quantity: 2,
        },
      ],
    })
    expect(getSubscriptionAmount(subscription)).toEqual({
      value: 10000,
      currency: 'brl',
      interval: 'MONTHLY',
    })
  })

  it('falls back to unitAmountDecimal when unitAmount is null', () => {
    const subscription = makeSubscription({
      items: [
        {
          id: 'item-1',
          stripePriceId: 'price_1',
          priceNickname: null,
          billingInterval: 'YEARLY',
          unitAmount: null,
          unitAmountDecimal: '2500',
          currency: 'brl',
          quantity: 1,
        },
      ],
    })
    expect(getSubscriptionAmount(subscription)).toEqual({
      value: 2500,
      currency: 'brl',
      interval: 'YEARLY',
    })
  })

  it('falls back to the plan price when there are no items', () => {
    const subscription = makeSubscription({ items: [] })
    expect(getSubscriptionAmount(subscription)).toEqual({
      value: subscription.plan.priceMonthly,
      currency: 'BRL',
      interval: 'MONTHLY',
    })
  })

  it('falls back to the plan price when the item amount is not finite', () => {
    const subscription = makeSubscription({
      items: [
        {
          id: 'item-1',
          stripePriceId: 'price_1',
          priceNickname: null,
          billingInterval: 'MONTHLY',
          unitAmount: null,
          unitAmountDecimal: 'not-a-number',
          currency: 'brl',
          quantity: 1,
        },
      ],
    })
    expect(getSubscriptionAmount(subscription)).toEqual({
      value: subscription.plan.priceMonthly,
      currency: 'BRL',
      interval: 'MONTHLY',
    })
  })
})
