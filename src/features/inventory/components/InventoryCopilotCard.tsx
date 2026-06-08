import { AlertCircle, Loader2, Lock, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { formatInventoryTimestamp } from '../utils/inventory-format'

// ── Shared result shape ───────────────────────────────────────────────────────

type CopilotResultData = {
  summary: string
  highlights: string[]
  recommendedActions: string[]
  generatedAt: string
  source: 'AI' | 'CACHE'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CopilotResult({
  result,
  isGenerating,
  onRefresh,
}: {
  result: CopilotResultData
  isGenerating: boolean
  onRefresh: () => void
}) {
  return (
    <div className="mt-4 space-y-4">
      {/* Summary */}
      <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>

      {/* Highlights */}
      {result.highlights.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Pontos de atenção
          </p>
          <ul className="space-y-1.5">
            {result.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50"
                  aria-hidden="true"
                />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended actions */}
      {result.recommendedActions.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Ações recomendadas
          </p>
          <ol className="space-y-1.5">
            {result.recommendedActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 shrink-0 text-[10px] font-bold tabular-nums text-primary">
                  {i + 1}.
                </span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/70">
          <span>Última análise gerada em {formatInventoryTimestamp(result.generatedAt)}</span>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[10px] font-medium',
              result.source === 'CACHE'
                ? 'border-border bg-muted text-muted-foreground'
                : 'border-primary/20 bg-primary/5 text-primary',
            )}
          >
            {result.source === 'CACHE' ? 'Cache' : 'IA'}
          </span>
        </div>
        <Button variant="ghost" size="sm" disabled={isGenerating} onClick={onRefresh}>
          <RefreshCw className={cn('h-3.5 w-3.5', isGenerating && 'animate-spin')} />
          Gerar nova análise
        </Button>
      </div>
    </div>
  )
}

// ── Shared card ───────────────────────────────────────────────────────────────

export type InventoryCopilotCardProps = {
  title: string
  description: string
  planBlockedMessage: string
  result: CopilotResultData | null
  isLoadingInitial: boolean
  isGenerating: boolean
  error: string | null
  isPlanBlocked: boolean
  isQuotaExceeded: boolean
  quotaMessage: string | null
  onGenerate: () => void
}

export function InventoryCopilotCard({
  title,
  description,
  planBlockedMessage,
  result,
  isLoadingInitial,
  isGenerating,
  error,
  isPlanBlocked,
  isQuotaExceeded,
  quotaMessage,
  onGenerate,
}: InventoryCopilotCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Plan blocked */}
      {isPlanBlocked && !isLoadingInitial && (
        <div className="mt-4 flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="max-w-xs text-xs text-muted-foreground">{planBlockedMessage}</p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/assinatura">Ver planos</Link>
          </Button>
        </div>
      )}

      {/* Initial loading */}
      {isLoadingInitial && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Verificando resumo...</span>
        </div>
      )}

      {!isPlanBlocked && !isLoadingInitial && (
        <>
          {/* Quota exceeded */}
          {isQuotaExceeded && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/20">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {quotaMessage ??
                  'Limite mensal de análises de IA atingido. Tente novamente no próximo mês.'}
              </p>
            </div>
          )}

          {/* Error state (non-quota) */}
          {error && !isQuotaExceeded && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/20">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400"
                aria-hidden="true"
              />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Generating first result */}
          {!result && isGenerating && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Gerando resumo com IA...</span>
            </div>
          )}

          {/* Idle — no result yet */}
          {!result && !isGenerating && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Nenhuma análise gerada ainda.</p>
              <Button size="sm" disabled={isQuotaExceeded} onClick={onGenerate}>
                <Sparkles className="h-3.5 w-3.5" />
                Gerar nova análise
              </Button>
            </div>
          )}

          {/* Result (with optional refresh loading overlay) */}
          {result && (
            <CopilotResult result={result} isGenerating={isGenerating} onRefresh={onGenerate} />
          )}
        </>
      )}
    </div>
  )
}
