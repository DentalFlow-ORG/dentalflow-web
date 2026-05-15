import { MetricCard } from '@/components/common/MetricCard'

import type { FinanceSummary } from '../types/finance.types'
import { formatCurrency } from '../utils/finance-format'

export function KpiGrid({ summary }: { summary: FinanceSummary }) {
  const { kpis } = summary
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <MetricCard
        value={formatCurrency(kpis.totalIncome)}
        label="Entradas pagas"
        tone="success"
      />
      <MetricCard
        value={formatCurrency(kpis.totalExpenses)}
        label="Saídas pagas"
        tone="danger"
      />
      <MetricCard
        value={formatCurrency(kpis.netProfit)}
        label="Lucro líquido"
        tone={kpis.netProfit >= 0 ? 'success' : 'danger'}
      />
      <MetricCard
        value={`${kpis.profitMargin.toFixed(1)}%`}
        label="Margem de lucro"
        tone={kpis.profitMargin >= 0 ? 'success' : 'danger'}
      />
      <MetricCard
        value={formatCurrency(kpis.pendingReceivables)}
        label="Recebíveis pendentes"
        tone={kpis.pendingReceivables > 0 ? 'warning' : 'neutral'}
      />
      <MetricCard
        value={formatCurrency(kpis.fixedExpensesTotal)}
        label="Despesas fixas ativas"
      />
    </div>
  )
}
