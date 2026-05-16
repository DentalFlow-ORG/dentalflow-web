import { cn } from '@/lib/utils'

import type { AppointmentPaymentStatus } from '../../types/scheduling.types'

type PaymentStatusConfig = {
  label: string
  className: string
  dotClass: string
}

const PAYMENT_STATUS_CONFIG: Record<AppointmentPaymentStatus, PaymentStatusConfig> = {
  PAYMENT_PENDING: {
    label: 'Pagamento pendente',
    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/25 dark:text-amber-300',
    dotClass: 'bg-amber-400 dark:bg-amber-400/80',
  },
  PAID: {
    label: 'Pago',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/25 dark:text-emerald-300',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400/80',
  },
  PARTIALLY_PAID: {
    label: 'Pago parcialmente',
    className: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-900/25 dark:text-blue-300',
    dotClass: 'bg-blue-400 dark:bg-blue-400/80',
  },
  REFUNDED: {
    label: 'Reembolsado',
    className: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700/50 dark:bg-purple-900/25 dark:text-purple-300',
    dotClass: 'bg-purple-400 dark:bg-purple-400/80',
  },
  CANCELED: {
    label: 'Cancelado',
    className: 'border-border bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground/50',
  },
}

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
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dotClass)} aria-hidden="true" />
      {config.label}
    </span>
  )
}

export { PAYMENT_STATUS_CONFIG }
