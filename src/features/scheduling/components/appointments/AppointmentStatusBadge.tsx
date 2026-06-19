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
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/25 dark:text-amber-300',
    dotClass: 'bg-amber-400 dark:bg-amber-400/80',
  },
  CONFIRMED: {
    label: 'Confirmado',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/25 dark:text-emerald-300',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400/80',
  },
  CANCELED: {
    label: 'Cancelado',
    className:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/25 dark:text-rose-400',
    dotClass: 'bg-rose-500 dark:bg-rose-400/80',
  },
  COMPLETED: {
    label: 'Concluído',
    className:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-900/25 dark:text-blue-300',
    dotClass: 'bg-blue-500 dark:bg-blue-400/80',
  },
  NO_SHOW: {
    label: 'Não compareceu',
    className:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-700/50 dark:bg-violet-900/25 dark:text-violet-300',
    dotClass: 'bg-violet-500 dark:bg-violet-400/80',
  },
}

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

export { STATUS_CONFIG }
