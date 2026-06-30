import { cn } from '@/lib/utils'

import type { AppointmentPaymentStatus } from '../../types/scheduling.types'
import { PAYMENT_STATUS_CONFIG } from './AppointmentPaymentBadge.config'

type AppointmentPaymentBadgeProps = {
  status: AppointmentPaymentStatus
  className?: string
}

export function AppointmentPaymentBadge({ status, className }: AppointmentPaymentBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        config.className,
        className,
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dotClass)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  )
}
