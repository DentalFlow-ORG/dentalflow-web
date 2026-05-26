import { CheckCircle2, Loader2, Lock, Sparkles, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ClassifierState } from '../hooks/useExpenseClassifier'

// ── Confidence badge ───────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100)
  const cls =
    pct >= 85
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400'
      : pct >= 70
        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400'
        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
        cls,
      )}
    >
      {pct}%
    </span>
  )
}

// ── Source label ───────────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<string, string> = {
  RULE: 'Regra',
  AI: 'IA',
  CACHE: 'Cache',
  NO_MATCH: 'Sem match',
}

// ── Main component ─────────────────────────────────────────────────────────────

type Props = {
  transactionId: string
  state: ClassifierState
  onClassify: (transactionId: string) => void
  onApply: (transactionId: string, categoryId: string) => void
  onDismiss: (transactionId: string) => void
}

export function ExpenseClassifyAction({
  transactionId,
  state,
  onClassify,
  onApply,
  onDismiss,
}: Props) {
  const { result, isClassifying, isApplying, isPlanBlocked, isQuotaExceeded, error } = state

  // Plan blocked
  if (isPlanBlocked) {
    return (
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Classificação inteligente disponível nos planos Professional e Premium.</span>
      </div>
    )
  }

  // Quota exceeded
  if (isQuotaExceeded) {
    return (
      <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
        Você atingiu o limite de classificações inteligentes deste mês.
      </p>
    )
  }

  // Error (non-blocking)
  if (error && !result) {
    return (
      <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
        {error}
      </p>
    )
  }

  // Result
  if (result) {
    if (result.source === 'NO_MATCH' || !result.suggestedCategoryId) {
      return (
        <div className="mt-1 flex items-center gap-1.5">
          <p className="text-[11px] text-muted-foreground">
            Nenhuma categoria identificada.
          </p>
          <button
            type="button"
            onClick={() => onDismiss(transactionId)}
            className="text-[11px] text-muted-foreground underline hover:text-foreground"
          >
            Ignorar
          </button>
        </div>
      )
    }

    const categoryId = result.suggestedCategoryId

    return (
      <div className="mt-1.5 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span className="text-[11px] font-medium text-foreground">
            Sugestão:{' '}
            <span className="text-primary">{result.suggestedCategoryName}</span>
          </span>
          <ConfidenceBadge confidence={result.confidence} />
          <span className="text-[10px] text-muted-foreground/60">
            {SOURCE_LABEL[result.source] ?? result.source}
          </span>
        </div>
        {result.reason && (
          <p className="text-[10px] italic text-muted-foreground">{result.reason}</p>
        )}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="default"
            className="h-6 px-2 text-[11px]"
            disabled={isApplying}
            onClick={() => onApply(transactionId, categoryId)}
          >
            {isApplying ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : null}
            Aplicar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[11px]"
            disabled={isApplying}
            onClick={() => onDismiss(transactionId)}
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Ignorar
          </Button>
        </div>
      </div>
    )
  }

  // Idle trigger
  return (
    <button
      type="button"
      disabled={isClassifying}
      onClick={() => onClassify(transactionId)}
      className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
      aria-label="Sugerir categoria para este lançamento"
    >
      {isClassifying ? (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      ) : (
        <Sparkles className="h-3 w-3" aria-hidden="true" />
      )}
      {isClassifying ? 'Classificando…' : 'Sugerir categoria'}
    </button>
  )
}
