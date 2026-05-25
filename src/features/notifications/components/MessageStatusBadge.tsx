import { cn } from '@/lib/utils'
import type { NotificationStatus } from '../types/notifications.types'

const STATUS_CONFIG: Record<NotificationStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Aguardando',
    className: 'bg-gray-100 text-gray-600 dark:bg-secondary dark:text-muted-foreground',
  },
  SENT: {
    label: 'Enviado',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  DELIVERED: {
    label: 'Entregue',
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  },
  READ: {
    label: 'Lido',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  CONFIRMED: {
    label: 'Confirmado',
    className: 'bg-green-200 text-green-800 font-semibold dark:bg-green-900/60 dark:text-green-200',
  },
  FAILED: {
    label: 'Falha',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  OPTED_OUT: {
    label: 'Descadastrado',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
}

type MessageStatusBadgeProps = {
  status: NotificationStatus
  className?: string
}

export function MessageStatusBadge({ status, className }: MessageStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
