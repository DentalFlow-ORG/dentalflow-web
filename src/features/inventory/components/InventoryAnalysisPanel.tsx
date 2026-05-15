import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { cn } from '@/lib/utils'

import type { StockSummary } from '../types/inventory.types'
import type { InventoryInsight, InventoryInsightTone } from '../utils/inventory-insights'
import { generateInventoryInsights } from '../utils/inventory-insights'

function getToneConfig(tone: InventoryInsightTone) {
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

function InsightCard({ insight }: { insight: InventoryInsight }) {
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

export function InventoryAnalysisPanel({ summary }: { summary: StockSummary }) {
  const insights = generateInventoryInsights(summary)

  const gridClass =
    insights.length >= 5
      ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid gap-3 sm:grid-cols-2'

  return (
    <PanelCard>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">Análise do estoque</h2>
        <p className="mt-1 text-sm text-slate-500">
          Alertas e situação atual dos produtos da clínica.
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
