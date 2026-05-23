import { StatusBadge } from '@/components/common/StatusBadge'

import { BILLING_STATUS_LABELS } from '../hooks/useSubscriptionPage'
import type { NormalizedBillingStatus } from '../types/billing.types'

const STATUS_TONE: Record<NormalizedBillingStatus, 'success' | 'muted' | 'warning'> = {
  active: 'success',
  trialing: 'success',
  missing: 'muted',
  canceled: 'muted',
  paused: 'muted',
  past_due: 'warning',
  unpaid: 'warning',
  incomplete: 'warning',
}

type Props = {
  status: NormalizedBillingStatus
  cancelAtPeriodEnd?: boolean
}

export function BillingStatusBadge({ status, cancelAtPeriodEnd = false }: Props) {
  return (
    <StatusBadge tone={cancelAtPeriodEnd ? 'warning' : STATUS_TONE[status]}>
      {cancelAtPeriodEnd ? 'Cancelamento agendado' : BILLING_STATUS_LABELS[status]}
    </StatusBadge>
  )
}
