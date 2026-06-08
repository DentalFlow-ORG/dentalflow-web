import type { StockProductStatus, StockSummary } from '../types/inventory.types'

export type AttentionChip = {
  status: StockProductStatus
  label: string
  count: number
  base: string
  active: string
}

export function buildAttentionChips(summary: StockSummary): AttentionChip[] {
  const all: AttentionChip[] = [
    {
      status: 'EMPTY',
      label: 'Sem estoque',
      count: summary.emptyStock,
      base: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50',
      active: 'border-red-600 bg-red-600 text-white hover:bg-red-700 dark:border-red-500 dark:bg-red-600/80',
    },
    {
      status: 'LOW',
      label: 'Baixo estoque',
      count: summary.lowStock,
      base: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50',
      active: 'border-amber-600 bg-amber-600 text-white hover:bg-amber-700 dark:border-amber-500 dark:bg-amber-600/80',
    },
    {
      status: 'EXPIRING',
      label: 'Vencendo',
      count: summary.expiring,
      base: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-800/50 dark:bg-orange-950/30 dark:text-orange-300 dark:hover:bg-orange-950/50',
      active: 'border-orange-600 bg-orange-600 text-white hover:bg-orange-700 dark:border-orange-500 dark:bg-orange-600/80',
    },
    {
      status: 'EXPIRED',
      label: 'Vencidos',
      count: summary.expired,
      base: 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50',
      active: 'border-red-700 bg-red-700 text-white hover:bg-red-800 dark:border-red-500 dark:bg-red-700/80',
    },
    {
      status: 'INACTIVE',
      label: 'Inativos',
      count: summary.inactive,
      base: 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/60',
      active: 'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
    },
  ]
  return all.filter((c) => c.count > 0)
}
