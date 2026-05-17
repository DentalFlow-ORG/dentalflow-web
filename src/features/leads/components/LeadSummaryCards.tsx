import type { LeadSummary } from '../types/leads.types'

interface LeadSummaryCardsProps {
  summary: LeadSummary | null
  isLoading: boolean
}

const CARDS = [
  {
    key: 'new' as const,
    label: 'Novos',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30',
  },
  {
    key: 'contacted' as const,
    label: 'Em contato',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900/30',
  },
  {
    key: 'scheduled' as const,
    label: 'Agendados',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/30',
  },
  {
    key: 'converted' as const,
    label: 'Convertidos',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30',
  },
  {
    key: 'lost' as const,
    label: 'Perdidos',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30',
  },
]

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border p-4 animate-pulse">
      <div className="h-3 w-16 rounded bg-muted" />
      <div className="mt-2 h-7 w-10 rounded bg-muted" />
    </div>
  )
}

export function LeadSummaryCards({ summary, isLoading }: LeadSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map(({ key, label, color, bg }) => (
        <div key={key} className={`rounded-lg border p-4 ${bg}`}>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>{summary?.[key] ?? 0}</p>
        </div>
      ))}
    </div>
  )
}
