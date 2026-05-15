import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { cn } from '@/lib/utils'

import type { FinanceSummary } from '../types/finance.types'
import { generateInsights } from '../utils/finance-insights'
import type { FinancialInsight, InsightTone } from '../utils/finance-insights'

function getToneConfig(tone: InsightTone) {
  switch (tone) {
    case 'positive':
      return { card: 'border-emerald-200 bg-emerald-50', icon: 'text-emerald-600', Icon: CheckCircle2 }
    case 'warning':
      return { card: 'border-amber-200 bg-amber-50', icon: 'text-amber-600', Icon: AlertTriangle }
    case 'danger':
      return { card: 'border-red-200 bg-red-50', icon: 'text-red-600', Icon: AlertCircle }
    case 'neutral':
      return { card: 'border-slate-200 bg-slate-50', icon: 'text-slate-400', Icon: Info }
  }
}

function InsightCard({ insight }: { insight: FinancialInsight }) {
  const { card, icon, Icon } = getToneConfig(insight.tone)
  return (
    <div className={cn('rounded-lg border p-4', card)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', icon)} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{insight.description}</p>
        </div>
      </div>
    </div>
  )
}

export function FinancialAnalysisPanel({
  summary,
  previousSummary,
}: {
  summary: FinanceSummary
  previousSummary?: FinanceSummary | null
}) {
  const insights = generateInsights(summary, previousSummary)

  // 5+ insights: 3-col grid (3+2 or 3+3). Fewer: 2-col to avoid sparse last rows.
  const gridClass =
    insights.length >= 5
      ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid gap-3 sm:grid-cols-2'

  return (
    <PanelCard>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">Análise do período</h2>
        <p className="mt-1 text-sm text-slate-500">
          Alertas e oportunidades do período selecionado.
        </p>
      </div>

      {insights.length === 1 ? (
        <InsightCard insight={insights[0]} />
      ) : (
        <div className={gridClass}>
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </PanelCard>
  )
}
