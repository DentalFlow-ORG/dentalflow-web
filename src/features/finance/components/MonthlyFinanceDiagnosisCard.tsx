import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Loader2,
  Lock,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { MetricCard } from '@/components/common/MetricCard'
import { MonthPickerInput } from '@/components/common/MonthPickerInput'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { brazilCurrentIsoMonth } from '@/lib/brazil-timezone'
import { cn } from '@/lib/utils'

import type { DiagnosisState } from '../hooks/useMonthlyFinanceDiagnosis'
import type { DiagnosisFinancialHealth, MonthlyFinanceDiagnosis } from '../types/finance.types'
import { formatCurrency } from '../utils/finance-format'

// ── Helpers ───────────────────────────────────────────────────────────────────

function centsToDisplay(cents: number): string {
  return formatCurrency(cents / 100)
}

function formatMonthLabel(month: string): string {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, mon - 1, 1))
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function formatGeneratedAt(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function currentMonth(): string {
  return brazilCurrentIsoMonth()
}

// ── Health badge ──────────────────────────────────────────────────────────────

const HEALTH_CONFIG: Record<
  DiagnosisFinancialHealth,
  { label: string; tone: 'success' | 'warning' | 'muted'; icon: typeof TrendingUp }
> = {
  HEALTHY: { label: 'Situação saudável', tone: 'success', icon: TrendingUp },
  WARNING: { label: 'Atenção necessária', tone: 'warning', icon: AlertTriangle },
  CRITICAL: { label: 'Situação crítica', tone: 'warning', icon: TrendingDown },
}

function HealthBadge({ health }: { health: DiagnosisFinancialHealth }) {
  const { label, tone, icon: Icon } = HEALTH_CONFIG[health]
  return (
    <StatusBadge tone={tone} className="gap-1.5">
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </StatusBadge>
  )
}

// ── List section ──────────────────────────────────────────────────────────────

function DiagnosisSection({
  title,
  items,
  icon: Icon,
  iconClass,
  dotClass,
}: {
  title: string
  items: string[]
  icon: typeof CheckCircle2
  iconClass: string
  dotClass: string
}) {
  if (items.length === 0) return null
  return (
    <div>
      <div className={cn('mb-2 flex items-center gap-1.5 text-sm font-semibold', iconClass)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span
              className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', dotClass)}
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Diagnosis result display ──────────────────────────────────────────────────

function DiagnosisResult({
  diagnosis,
  onRefresh,
  isRefreshing,
}: {
  diagnosis: MonthlyFinanceDiagnosis
  onRefresh: () => void
  isRefreshing: boolean
}) {
  const { financeSnapshot: s } = diagnosis
  const profitTone = s.profitCents >= 0 ? (s.profitCents > 0 ? 'success' : 'neutral') : 'danger'

  return (
    <div className="space-y-6">
      {/* Summary + health */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-prose text-sm leading-relaxed text-foreground">{diagnosis.summary}</p>
        <HealthBadge health={diagnosis.financialHealth} />
      </div>

      {/* Mini metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Receita" value={centsToDisplay(s.revenueCents)} tone="success" />
        <MetricCard label="Despesas" value={centsToDisplay(s.expenseCents)} tone="danger" />
        <MetricCard label="Resultado" value={centsToDisplay(s.profitCents)} tone={profitTone} />
        <MetricCard
          label="Margem"
          value={s.profitMarginPercent !== null ? `${s.profitMarginPercent.toFixed(1)}%` : '—'}
          tone={
            s.profitMarginPercent === null
              ? 'neutral'
              : s.profitMarginPercent >= 20
                ? 'success'
                : s.profitMarginPercent >= 0
                  ? 'warning'
                  : 'danger'
          }
        />
      </div>

      {/* Highlights, Risks, Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <DiagnosisSection
          title="Pontos positivos"
          items={diagnosis.highlights}
          icon={CheckCircle2}
          iconClass="text-emerald-600 dark:text-emerald-400"
          dotClass="bg-emerald-500"
        />
        <DiagnosisSection
          title="Pontos de atenção"
          items={diagnosis.risks}
          icon={AlertTriangle}
          iconClass="text-amber-600 dark:text-amber-400"
          dotClass="bg-amber-500"
        />
        <DiagnosisSection
          title="Ações recomendadas"
          items={diagnosis.recommendedActions}
          icon={ChevronRight}
          iconClass="text-blue-600 dark:text-blue-400"
          dotClass="bg-blue-500"
        />
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Gerado em {formatGeneratedAt(diagnosis.generatedAt)}</span>
          {diagnosis.cached && (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px]">
              Cache
            </span>
          )}
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px]">
            {diagnosis.source === 'AI' ? 'IA' : 'Cache'}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={isRefreshing}
          onClick={onRefresh}
          className="shrink-0"
        >
          {isRefreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Atualizar diagnóstico
        </Button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  state: DiagnosisState
  onGenerate: (month: string, forceRefresh?: boolean) => void
}

export function MonthlyFinanceDiagnosisCard({ state, onGenerate }: Props) {
  const { diagnosis, isGenerating, isPlanBlocked, isQuotaExceeded, error } = state
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const handleGenerate = () => onGenerate(selectedMonth, false)
  const handleRefresh = () => onGenerate(selectedMonth, true)

  return (
    <PanelCard>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">
              Diagnóstico financeiro mensal
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Entenda a saúde financeira da clínica, riscos do mês e ações prioritárias para proteger
            o caixa.
          </p>
        </div>

        {/* Month selector + generate button */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <MonthPickerInput
            value={selectedMonth}
            onValueChange={setSelectedMonth}
            className="w-full sm:w-40"
          />
          {!diagnosis && (
            <Button size="sm" onClick={handleGenerate} disabled={isGenerating || isPlanBlocked}>
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isGenerating ? 'Gerando…' : 'Gerar diagnóstico'}
            </Button>
          )}
        </div>
      </div>

      {/* Plan blocked */}
      {isPlanBlocked && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
          Diagnóstico financeiro mensal disponível nos planos Professional e Premium.
        </div>
      )}

      {/* Quota exceeded */}
      {isQuotaExceeded && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Você atingiu o limite de diagnósticos financeiros deste mês.
        </div>
      )}

      {/* Error */}
      {error && !diagnosis && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Não foi possível gerar o diagnóstico</p>
            <p className="mt-0.5 text-xs opacity-80">{error}</p>
            <button
              type="button"
              onClick={handleGenerate}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isGenerating && !diagnosis && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 py-6 text-sm text-muted-foreground"
        >
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          <span>Analisando dados financeiros de {formatMonthLabel(selectedMonth)}…</span>
        </div>
      )}

      {/* Low data from snapshot */}
      {diagnosis?.financeSnapshot.alerts.some((a) => a.type === 'LOW_DATA') &&
        diagnosis.highlights.length === 0 &&
        diagnosis.risks.length === 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-400">
            <Lightbulb className="h-4 w-4 shrink-0" aria-hidden="true" />
            Ainda não há dados financeiros suficientes para gerar um diagnóstico confiável deste
            mês.
          </div>
        )}

      {/* Idle prompt */}
      {!diagnosis && !isGenerating && !isPlanBlocked && !isQuotaExceeded && !error && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <Sparkles className="h-8 w-8 text-primary/40" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Diagnóstico não gerado para {formatMonthLabel(selectedMonth)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique em "Gerar diagnóstico" para obter uma análise do período.
            </p>
          </div>
        </div>
      )}

      {/* Diagnosis result */}
      {diagnosis && (
        <DiagnosisResult
          diagnosis={diagnosis}
          onRefresh={handleRefresh}
          isRefreshing={isGenerating}
        />
      )}
    </PanelCard>
  )
}
