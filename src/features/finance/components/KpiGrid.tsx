import { MetricCard } from '@/components/common/MetricCard'

import type { FinanceSummary } from '../types/finance.types'
import { formatCurrency } from '../utils/finance-format'

export function KpiGrid({ summary }: { summary: FinanceSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <MetricCard value={formatCurrency(summary.kpis.totalIncome)} label="Entradas pagas" />
      <MetricCard value={formatCurrency(summary.kpis.totalExpenses)} label="Saídas pagas" />
      <MetricCard
        value={formatCurrency(summary.kpis.netProfit)}
        label="Lucro líquido"
        className={summary.kpis.netProfit >= 0 ? 'border-emerald-200' : 'border-red-200'}
      />
      <MetricCard
        value={`${summary.kpis.profitMargin.toFixed(1)}%`}
        label="Margem de lucro"
      />
      <MetricCard
        value={formatCurrency(summary.kpis.pendingReceivables)}
        label="Recebíveis pendentes"
      />
      <MetricCard
        value={formatCurrency(summary.kpis.fixedExpensesTotal)}
        label="Despesas fixas ativas"
      />
    </div>
  )
}
