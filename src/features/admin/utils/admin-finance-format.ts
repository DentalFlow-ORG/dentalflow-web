import type { AdminFinanceSubscription } from '../types/admin-finance.types'

export function formatCurrencyFromCents(value: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value / 100)
}

export function formatDate(value?: string | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatInterval(value?: 'MONTHLY' | 'YEARLY' | null) {
  if (value === 'YEARLY') return 'Anual'
  if (value === 'MONTHLY') return 'Mensal'
  return '-'
}

export function getSubscriptionAmount(subscription: AdminFinanceSubscription) {
  const item = subscription.items[0]
  const value = item?.unitAmount ?? Number(item?.unitAmountDecimal ?? 0)

  if (item && Number.isFinite(value)) {
    return {
      value: value * item.quantity,
      currency: item.currency,
      interval: item.billingInterval,
    }
  }

  return {
    value: subscription.plan.priceMonthly,
    currency: 'BRL',
    interval: 'MONTHLY' as const,
  }
}
