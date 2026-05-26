import { Activity, AlertTriangle, CheckCircle2, Lock, RefreshCw } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useStockAbnormalConsumption } from '../hooks/useStockAbnormalConsumption'
import type { AbnormalConsumptionItem, AnomalySeverity, AnomalyType } from '../types/inventory.types'

// ── Labels ────────────────────────────────────────────────────────────────────

const ANOMALY_LABEL: Record<AnomalyType, string> = {
  CONSUMPTION_SPIKE: 'Consumo aumentou',
  LOSS_SPIKE: 'Perdas incomuns',
  FREQUENT_ADJUSTMENTS: 'Muitos ajustes',
  NEW_UNUSUAL_CONSUMPTION: 'Novo consumo incomum',
}

const SEVERITY_LABEL: Record<AnomalySeverity, string> = {
  HIGH: 'Alta atenção',
  MEDIUM: 'Atenção média',
  LOW: 'Baixa atenção',
}

const SEVERITY_CLASS: Record<AnomalySeverity, string> = {
  HIGH: 'border-red-200 bg-red-100 text-red-700 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300',
  MEDIUM:
    'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300',
  LOW: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300',
}

// ── Severity badge ─────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: AnomalySeverity }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        SEVERITY_CLASS[severity],
      )}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  )
}

// ── Summary chip ──────────────────────────────────────────────────────────────

type ChipTone = 'neutral' | 'danger' | 'warning' | 'info'

const CHIP_TONE_CLASS: Record<ChipTone, string> = {
  neutral: 'border-border bg-muted/50 text-foreground',
  danger:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-300',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300',
  info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-blue-300',
}

function SummaryChip({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: ChipTone
}) {
  return (
    <div className={cn('rounded-lg border p-4', CHIP_TONE_CLASS[tone])}>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// ── Anomaly item row ───────────────────────────────────────────────────────────

function AnomalyItemRow({ item }: { item: AbnormalConsumptionItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-4 sm:flex-row sm:items-start sm:gap-4">
      {/* Severity badge — top-left on mobile, first col on desktop */}
      <div className="flex items-center gap-2 sm:w-36 sm:shrink-0 sm:pt-0.5">
        <SeverityBadge severity={item.severity} />
      </div>

      {/* Product identity and anomaly details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="font-medium text-foreground">{item.productName}</p>
          <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {ANOMALY_LABEL[item.anomalyType]}
          </span>
        </div>
        {item.categoryName && (
          <p className="mt-0.5 text-xs text-muted-foreground">{item.categoryName}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
        <p className="mt-0.5 text-xs text-muted-foreground/70 italic">{item.suggestedAction}</p>
      </div>

      {/* Metrics */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm sm:shrink-0 sm:flex-col sm:gap-y-1 sm:text-right">
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{item.recentQuantity}</span>
          <span className="mx-1 text-border">/</span>
          <span>{item.baselineQuantity} hist.</span>
        </p>
        {item.changePercent !== null && (
          <p className="font-medium text-foreground">+{item.changePercent}%</p>
        )}
        <p className="text-xs text-muted-foreground">
          {item.movementCount} mov. recente{item.movementCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

// ── Section states ─────────────────────────────────────────────────────────────

function PlanBlockedState() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Análise de consumo não disponível no seu plano
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Disponível nos planos Professional e Premium.
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/app/assinatura">Ver planos</Link>
      </Button>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <AlertTriangle className="h-6 w-6 text-amber-500" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
        Tentar novamente
      </Button>
    </div>
  )
}

function EmptyState({ recentDays }: { recentDays: number }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Nenhuma variação incomum detectada.
        </p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          O consumo dos últimos {recentDays} dias está dentro dos padrões históricos.
        </p>
      </div>
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Activity className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-base font-semibold text-foreground">Consumo fora do padrão</h2>
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Análise automática
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Produtos com variações incomuns de saída, perda ou ajustes no estoque.
        </p>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function StockAbnormalConsumptionSection() {
  const { data, isLoading, error, isPlanBlocked, refetch } = useStockAbnormalConsumption()

  if (isLoading) {
    return <LoadingCard message="Analisando padrões de consumo..." />
  }

  return (
    <PanelCard>
      <SectionHeader />

      {isPlanBlocked ? (
        <PlanBlockedState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data || data.summary.totalAnomalies === 0 ? (
        <div className="mt-4">
          <EmptyState recentDays={data?.summary.recentDays ?? 14} />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {/* Summary mini-grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryChip
              label="Total de anomalias"
              value={String(data.summary.totalAnomalies)}
            />
            <SummaryChip
              label="Alta atenção"
              value={String(data.summary.highSeverity)}
              tone={data.summary.highSeverity > 0 ? 'danger' : 'neutral'}
            />
            <SummaryChip
              label="Atenção média"
              value={String(data.summary.mediumSeverity)}
              tone={data.summary.mediumSeverity > 0 ? 'warning' : 'neutral'}
            />
            <SummaryChip
              label="Baixa atenção"
              value={String(data.summary.lowSeverity)}
              tone={data.summary.lowSeverity > 0 ? 'info' : 'neutral'}
            />
          </div>

          {/* Anomaly list */}
          <div className="space-y-2">
            {data.items.map((item, idx) => (
              <AnomalyItemRow key={`${item.productId}-${item.anomalyType}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </PanelCard>
  )
}
