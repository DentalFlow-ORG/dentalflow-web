import { MetricCard } from '@/components/common/MetricCard'

import type { StockSummary } from '../types/inventory.types'
import { formatBRLCents } from '../utils/inventory-format'

export function InventoryKpiGrid({ summary }: { summary: StockSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard value={String(summary.totalActive)} label="Produtos ativos" />
      <MetricCard
        value={String(summary.lowStock)}
        label="Baixo estoque"
        className={summary.lowStock > 0 ? 'border-amber-200' : undefined}
      />
      <MetricCard
        value={String(summary.emptyStock)}
        label="Sem estoque"
        className={summary.emptyStock > 0 ? 'border-red-200' : undefined}
      />
      <MetricCard
        value={String(summary.expiring)}
        label="Vencendo em breve"
        className={summary.expiring > 0 ? 'border-orange-200' : undefined}
      />
      <MetricCard
        value={String(summary.expired)}
        label="Vencidos"
        className={summary.expired > 0 ? 'border-red-200' : undefined}
      />
      <MetricCard value={formatBRLCents(summary.estimatedValue)} label="Valor estimado" />
    </div>
  )
}
