import type { AiQuotaInfo } from '@/lib/ai-types'
import { cn } from '@/lib/utils'

export function AiUsageBadge({ quota }: { quota: AiQuotaInfo | null }) {
  if (!quota || !quota.allowed) return null

  const isFull = quota.remaining === 0
  const isLow = quota.remaining === 1 && quota.limit > 1

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums',
        isFull
          ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400'
          : isLow
            ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400'
            : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300',
      )}
      title={quota.blockedReason ?? undefined}
    >
      {quota.used}/{quota.limit} análise{quota.limit !== 1 ? 's' : ''} este mês
    </span>
  )
}
