import { cn } from '@/lib/utils'

import type { AppointmentStatus } from '../../types/scheduling.types'

type StatusConfig = {
  label: string
  className: string
  dotClass: string
}

const STATUS_CONFIG: Record<AppointmentStatus, StatusConfig> = {
  PENDING: {
    label: 'Pendente',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-400',
  },
  CONFIRMED: {
    label: 'Confirmado',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  CANCELED: {
    label: 'Cancelado',
    className: 'border-red-200 bg-red-50 text-red-700',
    dotClass: 'bg-red-500',
  },
  COMPLETED: {
    label: 'Concluído',
    className: 'border-slate-200 bg-slate-100 text-slate-600',
    dotClass: 'bg-slate-400',
  },
  NO_SHOW: {
    label: 'Não compareceu',
    className: 'border-orange-200 bg-orange-50 text-orange-700',
    dotClass: 'bg-orange-400',
  },
}

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus
  className?: string
}

export function AppointmentStatusBadge({
  status,
  className,
}: AppointmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        config.className,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dotClass)} aria-hidden="true" />
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
