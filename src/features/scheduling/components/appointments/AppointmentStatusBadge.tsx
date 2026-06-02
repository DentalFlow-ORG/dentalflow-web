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
    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/25 dark:text-amber-300',
    dotClass: 'bg-amber-400 dark:bg-amber-400/80',
  },
  CONFIRMED: {
    label: 'Confirmado',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/25 dark:text-emerald-300',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400/80',
  },
  CANCELED: {
    label: 'Cancelado',
    className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-900/25 dark:text-red-400',
    dotClass: 'bg-red-500 dark:bg-red-400/80',
  },
  COMPLETED: {
    label: 'Concluído',
    className: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300',
    dotClass: 'bg-slate-400 dark:bg-slate-500',
  },
  NO_SHOW: {
    label: 'Não compareceu',
    className: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700/50 dark:bg-orange-900/25 dark:text-orange-300',
    dotClass: 'bg-orange-400 dark:bg-orange-400/80',
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
