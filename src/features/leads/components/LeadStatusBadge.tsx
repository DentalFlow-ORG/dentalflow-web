import { cn } from '@/lib/utils'
import type { LeadStatus } from '../types/leads.types'

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  NEW: {
    label: 'Novo',
    className: 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300',
  },
  CONTACTED: {
    label: 'Em contato',
    className: 'border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800/50 dark:bg-yellow-950/40 dark:text-yellow-300',
  },
  SCHEDULED: {
    label: 'Agendado',
    className: 'border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800/50 dark:bg-purple-950/40 dark:text-purple-300',
  },
  CONVERTED: {
    label: 'Convertido',
    className: 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  LOST: {
    label: 'Perdido',
    className: 'border-red-200 bg-red-100 text-red-700 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300',
  },
  ARCHIVED: {
    label: 'Arquivado',
    className: 'border-border bg-muted text-muted-foreground',
  },
}

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
