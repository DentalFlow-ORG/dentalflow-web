import { Clock, DollarSign, Percent, Receipt, TrendingDown, TrendingUp } from 'lucide-react'

import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'

import type { FinanceSummary } from '../types/finance.types'
import { formatCurrency } from '../utils/finance-format'

type KpiGridProps = {
  summary: FinanceSummary
  previousSummary?: FinanceSummary | null
  onPendingReceivablesClick?: () => void
}

function kpiDelta(current: number, previous: number): string {
  if (current === 0 && previous === 0) return 'Sem variação vs. período anterior'
  if (previous === 0) return 'Novo valor vs. período anterior'
  const pct = ((current - previous) / Math.abs(previous)) * 100
  if (pct === 0) return 'Sem variação vs. período anterior'
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(pct))
  const sign = pct > 0 ? '+' : '-'
  return `${sign}${formatted}% vs. período anterior`
}

export function KpiGrid({ summary, previousSummary, onPendingReceivablesClick }: KpiGridProps) {
  const { kpis } = summary
  const prev = previousSummary?.kpis ?? null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <HomeKpiCard
        value={formatCurrency(kpis.totalIncome)}
        label="Entradas pagas"
        icon={TrendingUp}
        tone="success"
        description={prev ? kpiDelta(kpis.totalIncome, prev.totalIncome) : undefined}
      />
      <HomeKpiCard
        value={formatCurrency(kpis.totalExpenses)}
        label="Saídas pagas"
        icon={TrendingDown}
        tone="danger"
        description={prev ? kpiDelta(kpis.totalExpenses, prev.totalExpenses) : undefined}
      />
      <HomeKpiCard
        value={formatCurrency(kpis.netProfit)}
        label="Lucro líquido"
        icon={DollarSign}
        tone={kpis.netProfit >= 0 ? 'success' : 'danger'}
        description={prev ? kpiDelta(kpis.netProfit, prev.netProfit) : undefined}
      />
      <HomeKpiCard
        value={`${kpis.profitMargin.toFixed(1)}%`}
        label="Margem de lucro"
        icon={Percent}
        tone={kpis.profitMargin >= 0 ? 'success' : 'danger'}
        description={prev ? kpiDelta(kpis.profitMargin, prev.profitMargin) : undefined}
      />
      {onPendingReceivablesClick ? (
        <button
          type="button"
          aria-label="Filtrar recebíveis pendentes"
          onClick={onPendingReceivablesClick}
          className="w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-[inherit] hover:opacity-90 transition-opacity"
        >
          <HomeKpiCard
            value={formatCurrency(kpis.pendingReceivables)}
            label="Recebíveis pendentes"
            icon={Clock}
            tone={kpis.pendingReceivables > 0 ? 'warning' : 'neutral'}
            description={
              prev ? kpiDelta(kpis.pendingReceivables, prev.pendingReceivables) : undefined
            }
          />
        </button>
      ) : (
        <HomeKpiCard
          value={formatCurrency(kpis.pendingReceivables)}
          label="Recebíveis pendentes"
          icon={Clock}
          tone={kpis.pendingReceivables > 0 ? 'warning' : 'neutral'}
          description={
            prev ? kpiDelta(kpis.pendingReceivables, prev.pendingReceivables) : undefined
          }
        />
      )}
      <HomeKpiCard
        value={formatCurrency(kpis.fixedExpensesTotal)}
        label="Despesas fixas ativas"
        icon={Receipt}
        tone="neutral"
        description={prev ? kpiDelta(kpis.fixedExpensesTotal, prev.fixedExpensesTotal) : undefined}
      />
    </div>
  )
}
