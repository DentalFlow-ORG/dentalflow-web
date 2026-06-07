import { Clock, DollarSign, Percent, Receipt, TrendingDown, TrendingUp } from 'lucide-react'

import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'

import type { FinanceSummary } from '../types/finance.types'
import { formatCurrency } from '../utils/finance-format'

export function KpiGrid({ summary }: { summary: FinanceSummary }) {
  const { kpis } = summary
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <HomeKpiCard
        value={formatCurrency(kpis.totalIncome)}
        label="Entradas pagas"
        icon={TrendingUp}
        tone="success"
      />
      <HomeKpiCard
        value={formatCurrency(kpis.totalExpenses)}
        label="Saídas pagas"
        icon={TrendingDown}
        tone="danger"
      />
      <HomeKpiCard
        value={formatCurrency(kpis.netProfit)}
        label="Lucro líquido"
        icon={DollarSign}
        tone={kpis.netProfit >= 0 ? 'success' : 'danger'}
      />
      <HomeKpiCard
        value={`${kpis.profitMargin.toFixed(1)}%`}
        label="Margem de lucro"
        icon={Percent}
        tone={kpis.profitMargin >= 0 ? 'success' : 'danger'}
      />
      <HomeKpiCard
        value={formatCurrency(kpis.pendingReceivables)}
        label="Recebíveis pendentes"
        icon={Clock}
        tone={kpis.pendingReceivables > 0 ? 'warning' : 'neutral'}
      />
      <HomeKpiCard
        value={formatCurrency(kpis.fixedExpensesTotal)}
        label="Despesas fixas ativas"
        icon={Receipt}
        tone="neutral"
      />
    </div>
  )
}
