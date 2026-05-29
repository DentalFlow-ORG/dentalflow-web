import type { LeadSummary } from '../types/leads.types'

interface LeadFunnelPanelProps {
  summary: LeadSummary | null
}

const STAGES = [
  { key: 'new' as const, label: 'Novos', barColor: 'bg-blue-500' },
  { key: 'contacted' as const, label: 'Em contato', barColor: 'bg-yellow-500' },
  { key: 'scheduled' as const, label: 'Agendados', barColor: 'bg-purple-500' },
  { key: 'converted' as const, label: 'Convertidos', barColor: 'bg-emerald-500' },
]

export function LeadFunnelPanel({ summary }: LeadFunnelPanelProps) {
  if (!summary) return null

  const total =
    summary.new + summary.contacted + summary.scheduled + summary.converted + summary.lost

  if (total === 0) return null

  const conversionRate = (summary.converted / total) * 100
  const lostRate = (summary.lost / total) * 100

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      {/* KPI row */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-2">
        <div>
          <p className="text-xs text-muted-foreground">Pipeline total</p>
          <p className="text-lg font-semibold text-foreground">{total}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Taxa de conversão</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {conversionRate.toFixed(1).replace('.', ',')}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Taxa de perda</p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            {lostRate.toFixed(1).replace('.', ',')}%
          </p>
        </div>
      </div>

      {/* Stage bars */}
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        {STAGES.map(({ key, label, barColor }) => {
          const count = summary[key]
          const pct = count === 0 ? 0 : Math.max(4, Math.round((count / total) * 100))
          return (
            <div key={key}>
              <div className="flex items-center justify-between gap-1 text-xs">
                <span className="truncate text-muted-foreground">{label}</span>
                <span className="shrink-0 font-medium text-foreground">{count}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${pct}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
