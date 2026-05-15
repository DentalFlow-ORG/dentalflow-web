import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { cn } from '@/lib/utils'

import type { FinanceSummary } from '../types/finance.types'
import { generateInsights } from '../utils/finance-insights'
import type { InsightTone } from '../utils/finance-insights'

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

export function FinancialAnalysisPanel({ summary }: { summary: FinanceSummary }) {
  const insights = generateInsights(summary)

  return (
    <PanelCard>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">Análise do período</h2>
        <p className="mt-1 text-sm text-slate-500">
          Alertas e oportunidades com base nas receitas, despesas e resultado do período selecionado.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => {
          const { card, icon, Icon } = getToneConfig(insight.tone)
          return (
            <div key={insight.id} className={cn('rounded-lg border p-4', card)}>
              <div className="flex items-start gap-3">
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', icon)} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{insight.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </PanelCard>
  )
}
