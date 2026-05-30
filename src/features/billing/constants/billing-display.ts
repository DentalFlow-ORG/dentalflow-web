import type { NormalizedBillingStatus } from '../types/billing.types'

export const BILLING_STATUS_LABELS: Record<NormalizedBillingStatus, string> = {
  missing: 'Sem assinatura',
  trialing: 'Em teste',
  active: 'Ativa',
  past_due: 'Pagamento pendente',
  canceled: 'Cancelada',
  unpaid: 'Não paga',
  paused: 'Pausada',
  incomplete: 'Incompleta',
}

export const BILLING_STATUS_TONE: Record<NormalizedBillingStatus, 'success' | 'muted' | 'warning'> = {
  active: 'success',
  trialing: 'success',
  missing: 'muted',
  canceled: 'muted',
  paused: 'muted',
  past_due: 'warning',
  unpaid: 'warning',
  incomplete: 'warning',
}
