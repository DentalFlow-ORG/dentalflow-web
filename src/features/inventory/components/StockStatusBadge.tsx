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
  ACTIVE: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  LOW: 'border-amber-200 bg-amber-100 text-amber-800',
  EMPTY: 'border-red-200 bg-red-100 text-red-700',
  EXPIRING: 'border-orange-200 bg-orange-100 text-orange-800',
  EXPIRED: 'border-red-300 bg-red-100 text-red-800',
  INACTIVE: 'border-border bg-muted text-muted-foreground',
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
