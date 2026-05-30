import type { AdminSubscriptionStatus } from '../types/admin-finance.types'

export const FINANCE_STATUS_LABEL: Record<AdminSubscriptionStatus, string> = {
  TRIALING: 'Trial',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Em atraso',
  CANCELED: 'Cancelada',
  UNPAID: 'Inadimplente',
  PAUSED: 'Pausada',
  INCOMPLETE: 'Incompleta',
}

export const FINANCE_STATUS_TONE: Record<AdminSubscriptionStatus, 'success' | 'warning' | 'muted'> = {
  ACTIVE: 'success',
  TRIALING: 'warning',
  PAST_DUE: 'warning',
  UNPAID: 'warning',
  CANCELED: 'muted',
  PAUSED: 'muted',
  INCOMPLETE: 'muted',
}

export const FINANCE_STATUS_OPTIONS = Object.keys(FINANCE_STATUS_LABEL) as AdminSubscriptionStatus[]
