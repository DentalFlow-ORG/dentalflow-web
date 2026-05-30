import { StatusBadge } from '@/components/common/StatusBadge'

import { BILLING_STATUS_LABELS, BILLING_STATUS_TONE } from '../constants/billing-display'
import type { NormalizedBillingStatus } from '../types/billing.types'

type Props = {
  status: NormalizedBillingStatus
  cancelAtPeriodEnd?: boolean
}

export function BillingStatusBadge({ status, cancelAtPeriodEnd = false }: Props) {
  return (
    <StatusBadge tone={cancelAtPeriodEnd ? 'warning' : BILLING_STATUS_TONE[status]}>
      {cancelAtPeriodEnd ? 'Cancelamento agendado' : BILLING_STATUS_LABELS[status]}
    </StatusBadge>
  )
}
