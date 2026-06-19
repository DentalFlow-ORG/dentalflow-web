import type { StockProductStatus } from '../types/inventory.types'

const STATUS_LABEL: Record<StockProductStatus, string> = {
  ACTIVE: 'Em estoque',
  LOW: 'Baixo estoque',
  EMPTY: 'Sem estoque',
  EXPIRING: 'Vencendo',
  EXPIRED: 'Vencido',
  INACTIVE: 'Inativo',
}

const STATUS_CLASS: Record<StockProductStatus, string> = {
  ACTIVE:
    'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300',
  LOW: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300',
  EMPTY:
    'border-red-200 bg-red-100 text-red-700 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300',
  EXPIRING:
    'border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800/50 dark:bg-orange-950/40 dark:text-orange-300',
  EXPIRED:
    'border-red-300 bg-red-100 text-red-800 dark:border-red-700/50 dark:bg-red-950/50 dark:text-red-200',
  INACTIVE:
    'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300',
}

export function StockStatusBadge({ status }: { status: StockProductStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
