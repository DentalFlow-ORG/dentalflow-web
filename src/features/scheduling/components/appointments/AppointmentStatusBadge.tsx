import { cn } from '@/lib/utils'

import type { AppointmentStatus } from '../../types/scheduling.types'
import { STATUS_CONFIG } from './AppointmentStatusBadge.config'

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus
  className?: string
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
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
