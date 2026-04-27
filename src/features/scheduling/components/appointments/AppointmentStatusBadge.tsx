import { cn } from '@/lib/utils'

import type { AppointmentStatus } from '../../types/scheduling.types'

type StatusConfig = {
  label: string
  className: string
}

const STATUS_CONFIG: Record<AppointmentStatus, StatusConfig> = {
  PENDING: {
    label: 'Pendente',
    className: 'border-amber-200 bg-amber-100 text-amber-800',
  },
  CONFIRMED: {
    label: 'Confirmado',
    className: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  },
  CANCELED: {
    label: 'Cancelado',
    className: 'border-red-200 bg-red-100 text-red-800',
  },
  COMPLETED: {
    label: 'Concluído',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  NO_SHOW: {
    label: 'Não compareceu',
    className: 'border-orange-200 bg-orange-100 text-orange-800',
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
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
