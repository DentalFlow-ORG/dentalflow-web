import { useCallback, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { StockSummary } from '../types/inventory.types'
import type { AiAnalysisResult, AiAnalysisSection } from '../services/inventory-ai.service'
import { analyzeInventoryWithAi } from '../services/inventory-ai.service'
import { ApiError } from '@/services/http'

type AnalysisState = 'idle' | 'loading' | 'success' | 'error'

function getToneConfig(tone: AiAnalysisSection['tone']) {
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
      return {
        card: 'border-border bg-muted',
        icon: 'text-muted-foreground',
        Icon: Info,
      }
  }
}

function InsightCard({ section }: { section: AiAnalysisSection }) {
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

export function InventoryAnalysisPanel({ summary }: { summary: StockSummary }) {
  const [state, setState] = useState<AnalysisState>('idle')
  const [result, setResult] = useState<AiAnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (state === 'loading') return
    setState('loading')
    setErrorMessage(null)
    try {
      const data = await analyzeInventoryWithAi()
      setResult(data)
      setState('success')
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível gerar a análise. Tente novamente.'
      setErrorMessage(msg)
      setState('error')
    }
  }, [state])

  const gridClass =
    (result?.sections.length ?? 0) >= 5
      ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid gap-3 sm:grid-cols-2'

  const hasCritical =
    summary.emptyStock > 0 || summary.expired > 0 || summary.lowStock > 0 || summary.expiring > 0

  return (
    <PanelCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">Análise do estoque</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasCritical
              ? 'Há itens que requerem atenção. Gere uma análise detalhada.'
              : 'Alertas e situação atual dos produtos da clínica.'}
          </p>
        </div>
        {state === 'success' && (
          <Button
            variant="outline"
            size="sm"
            disabled={state !== 'success'}
            className="shrink-0"
            onClick={handleGenerate}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </Button>
        )}
      </div>

      {state === 'idle' && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-8 text-center">
          <Sparkles className="h-8 w-8 text-primary/40" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Assistente de Estoque com IA
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Gere uma análise profissional com recomendações de reposição baseadas nos dados
              atuais do estoque.
            </p>
          </div>
          <Button onClick={handleGenerate} size="sm">
            <Sparkles className="h-3.5 w-3.5" />
            Gerar análise
          </Button>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Analisando estoque…</p>
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-800/50 dark:bg-red-950/20">
          <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">Não foi possível gerar a análise</p>
            <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerate}>
            Tentar novamente
          </Button>
        </div>
      )}

      {state === 'success' && result && (
        <>
          {result.sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não há dados suficientes para gerar uma análise confiável.
            </p>
          ) : result.sections.length === 1 ? (
            <InsightCard section={result.sections[0]} />
          ) : (
            <div className={gridClass}>
              {result.sections.map((section) => (
                <InsightCard key={section.title} section={section} />
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
            <p className="text-xs text-muted-foreground/60">
              Análise gerada em {formatTimestamp(result.generatedAt)}
            </p>
          </div>
        </>
      )}
    </PanelCard>
  )
}
