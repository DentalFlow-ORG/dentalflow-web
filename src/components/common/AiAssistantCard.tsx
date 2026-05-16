import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/services/http'

export type AiSection = {
  title: string
  content: string
  tone: 'positive' | 'warning' | 'danger' | 'neutral'
}

export type AiAnalysisResult = {
  sections: AiSection[]
  disclaimer: string
  generatedAt: string
  model: string
  /** YYYY-MM-DD — only present for FINANCE analyses */
  periodStart?: string | null
  /** YYYY-MM-DD — only present for FINANCE analyses */
  periodEnd?: string | null
}

type AiAssistantCardProps = {
  type: 'finance' | 'inventory'
  title: string
  description: string
  /** Called when the user clicks "Gerar análise" or "Atualizar". Must return AiAnalysisResult. */
  onGenerate: () => Promise<AiAnalysisResult>
  /** When this key changes and no result exists → goes to idle. With result → shows stale banner. */
  invalidationKey?: string
  /** If set, the button is disabled and shows this reason as tooltip */
  disabledReason?: string
  /** Saved analysis loaded from GET /latest — seeds state to 'success' on mount. */
  initialResult?: AiAnalysisResult | null
  /** True while GET /latest is in flight — shows a loading indicator instead of idle state. */
  isLoadingInitial?: boolean
  /**
   * When false the card operates in read-only mode:
   *  - "Gerar análise" and "Atualizar análise" buttons are hidden.
   *  - Only "Copiar" is shown when a result exists.
   *  - When no result exists, shows an informative message instead of an action button.
   * Defaults to false — callers must opt-in explicitly for OWNER.
   */
  canGenerate?: boolean
}

type State = 'idle' | 'loading' | 'success' | 'error'

function getToneConfig(tone: AiSection['tone']) {
  switch (tone) {
    case 'positive':
      return {
        card: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/30',
        icon: 'text-emerald-600 dark:text-emerald-400',
        Icon: CheckCircle2,
      }
    case 'warning':
      return {
        card: 'border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30',
        icon: 'text-amber-600 dark:text-amber-400',
        Icon: AlertTriangle,
      }
    case 'danger':
      return {
        card: 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30',
        icon: 'text-red-600 dark:text-red-400',
        Icon: AlertCircle,
      }
    case 'neutral':
    default:
      return {
        card: 'border-border bg-muted',
        icon: 'text-muted-foreground',
        Icon: Info,
      }
  }
}

function SectionCard({ section }: { section: AiSection }) {
  const { card, icon, Icon } = getToneConfig(section.tone)
  return (
    <div className={cn('rounded-lg border p-4', card)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', icon)} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{section.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{section.content}</p>
        </div>
      </div>
    </div>
  )
}

function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatDate(ymd: string) {
  try {
    const [y, m, d] = ymd.split('-')
    return `${d}/${m}/${y}`
  } catch {
    return ymd
  }
}

export function AiAssistantCard({
  title,
  description,
  onGenerate,
  invalidationKey,
  disabledReason,
  initialResult,
  isLoadingInitial = false,
  canGenerate = false,
}: AiAssistantCardProps) {
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<AiAnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isStalePeriod, setIsStalePeriod] = useState(false)

  // ─── Seed from persisted analysis on initial load ──────────────────────────
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (!isLoadingInitial && !hasInitialized.current) {
      hasInitialized.current = true
      // loose != null is false for both null and undefined
      if (initialResult != null) {
        setResult(initialResult)
        setState('success')
        // Check if the saved analysis is for a different period
        if (
          invalidationKey !== undefined &&
          initialResult.periodStart != null &&
          `${initialResult.periodStart}|${initialResult.periodEnd}` !== invalidationKey
        ) {
          setIsStalePeriod(true)
        }
      }
    }
  }, [isLoadingInitial, initialResult, invalidationKey])

  // ─── Invalidation key change ───────────────────────────────────────────────
  const prevKey = useRef(invalidationKey)
  useEffect(() => {
    if (invalidationKey !== undefined && prevKey.current !== invalidationKey) {
      prevKey.current = invalidationKey
      if (result === null) {
        // No result: go back to idle (original behavior)
        setState('idle')
        setErrorMessage(null)
      } else {
        // Has result: mark stale instead of clearing — user decides when to refresh
        setIsStalePeriod(true)
      }
    }
  }, [invalidationKey, result])

  const handleGenerate = useCallback(async () => {
    if (state === 'loading' || disabledReason) return
    setState('loading')
    setErrorMessage(null)
    setIsStalePeriod(false)
    try {
      const data = await onGenerate()
      setResult(data)
      setState('success')
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível gerar a análise. Tente novamente.'
      setErrorMessage(msg)
      // Keep previous result if it exists — don't clear on error
      setState('error')
    }
  }, [state, disabledReason, onGenerate])

  const handleCopy = useCallback(async () => {
    if (!result) return
    const text = result.sections
      .map((s) => `${s.title}\n${s.content}`)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available in some environments — ignore silently
    }
  }, [result])

  const gridClass =
    (result?.sections.length ?? 0) >= 5
      ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid gap-3 sm:grid-cols-2'

  const isLoading = state === 'loading'
  const isSuccess = state === 'success' && result !== null

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {isSuccess && (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              title="Copiar análise"
              onClick={handleCopy}
            >
              <ClipboardCopy className="h-3.5 w-3.5" />
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
            {canGenerate && (
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={handleGenerate}
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                Atualizar análise
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── States that require isLoadingInitial=false ── */}

      {/* Loading initial saved analysis from DB */}
      {isLoadingInitial && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Carregando análise salva…</p>
        </div>
      )}

      {!isLoadingInitial && (
        <>
          {/* Idle state */}
          {state === 'idle' && (
            canGenerate ? (
              <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-8 text-center">
                <Sparkles className="h-8 w-8 text-primary/40" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground">Assistente IA</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gere uma análise profissional baseada nos dados reais do sistema.
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  size="sm"
                  disabled={!!disabledReason}
                  title={disabledReason}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Gerar análise
                </Button>
                {disabledReason && (
                  <p className="text-xs text-muted-foreground">{disabledReason}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-6 text-center">
                <Sparkles className="h-6 w-6 text-primary/30" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma análise disponível. O responsável da clínica pode gerar a análise a qualquer momento.
                </p>
              </div>
            )
          )}

          {/* Loading state (no previous result) */}
          {state === 'loading' && !result && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Analisando dados…</p>
            </div>
          )}

          {/* Loading overlay on existing result (refresh in progress) */}
          {state === 'loading' && result && (
            <div className="relative">
              <div className="pointer-events-none opacity-50">
                <div className={gridClass}>
                  {result.sections.map((section) => (
                    <SectionCard key={section.title} section={section} />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-lg bg-card/90 px-4 py-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Atualizando…</span>
                </div>
              </div>
            </div>
          )}

          {/* Error state (no previous result) */}
          {state === 'error' && !result && (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-800/50 dark:bg-red-950/20">
              <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Não foi possível gerar a análise
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Error banner on existing result (refresh failed) */}
          {state === 'error' && result && (
            <>
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800/50 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Não foi possível atualizar a análise agora. A última análise salva continua sendo exibida.
                </p>
              </div>
              <div className={gridClass}>
                {result.sections.map((section) => (
                  <SectionCard key={section.title} section={section} />
                ))}
              </div>
            </>
          )}

          {/* Success state */}
          {isSuccess && (
            <>
              {/* Stale period banner */}
              {isStalePeriod && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 dark:border-blue-800/50 dark:bg-blue-950/20">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {result.periodStart && result.periodEnd
                      ? `Esta análise foi gerada para o período ${formatDate(result.periodStart)} – ${formatDate(result.periodEnd)}.${canGenerate ? ' Clique em "Atualizar análise" para gerar para o período atual.' : ' O responsável da clínica pode atualizá-la a qualquer momento.'}`
                      : canGenerate
                        ? 'Esta análise pode estar desatualizada. Clique em "Atualizar análise" para gerar novamente.'
                        : 'Esta análise pode estar desatualizada. O responsável da clínica pode atualizá-la a qualquer momento.'}
                  </p>
                </div>
              )}

              {result.sections.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-6 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Ainda não há dados suficientes para gerar uma análise confiável.
                  </p>
                </div>
              ) : result.sections.length === 1 ? (
                <SectionCard section={result.sections[0]} />
              ) : (
                <div className={gridClass}>
                  {result.sections.map((section) => (
                    <SectionCard key={section.title} section={section} />
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-1.5 border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
                <p className="text-xs text-muted-foreground/60">
                  Última análise gerada em {formatTimestamp(result.generatedAt)}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
