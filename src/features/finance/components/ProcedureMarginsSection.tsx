import { useState } from 'react'
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  XCircle,
} from 'lucide-react'

import { MetricCard } from '@/components/common/MetricCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ProcedureMarginsState } from '../hooks/useProcedureMargins'
import type { ProcedureMarginsQuery } from '../services/finance-analytics.service'
import type { ProcedureMarginItem, ProcedureMarginStatus } from '../types/finance.types'
import { formatCurrency } from '../utils/finance-format'

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function centsToDisplay(cents: number): string {
  return formatCurrency(cents / 100)
}

const STATUS_CONFIG: Record<
  ProcedureMarginStatus,
  { label: string; tone: 'success' | 'warning' | 'muted'; icon: typeof CheckCircle2 }
> = {
  HEALTHY: { label: 'Saudável', tone: 'success', icon: CheckCircle2 },
  ATTENTION: { label: 'Atenção', tone: 'warning', icon: AlertTriangle },
  INSUFFICIENT_DATA: { label: 'Dados insuficientes', tone: 'muted', icon: HelpCircle },
}

function ServiceRow({ item }: { item: ProcedureMarginItem }) {
  const { label, tone, icon: Icon } = STATUS_CONFIG[item.status]
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{item.serviceName}</span>
        <StatusBadge tone={tone} className={cn('shrink-0 gap-1 text-[11px]')}>
          <Icon className="h-3 w-3" aria-hidden="true" />
          {label}
        </StatusBadge>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
        <span>
          Agendamentos:{' '}
          <strong className="text-foreground">{item.totalAppointments}</strong>
        </span>
        <span>
          Concluídos:{' '}
          <strong className="text-foreground">{item.completedAppointments}</strong>
        </span>
        <span>
          Cancel./NS:{' '}
          <strong className="text-foreground">{item.canceledOrNoShowCount}</strong>
        </span>
        <span>
          Receita bruta:{' '}
          <strong className="text-foreground">{centsToDisplay(item.grossRevenueCents)}</strong>
        </span>
        <span>
          Média/conclusão:{' '}
          <strong className="text-foreground">
            {item.completedAppointments > 0 ? centsToDisplay(item.avgRevenueCents) : '—'}
          </strong>
        </span>
        <span>
          Custo direto:{' '}
          <em className="not-italic text-muted-foreground/60">Não configurado</em>
        </span>
      </div>
    </div>
  )
}

type Props = {
  state: ProcedureMarginsState
  onLoad: (query: ProcedureMarginsQuery) => void
}

export function ProcedureMarginsSection({ state, onLoad }: Props) {
  const { data, isLoading, isPlanBlocked, error } = state
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const handleLoad = () => onLoad({ month: selectedMonth })
  const handleRefresh = () => onLoad({ month: selectedMonth })

  return (
    <PanelCard>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">
              Margem por procedimento
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Volume, receita e desempenho por tipo de serviço no período.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Selecionar mês para análise de margens"
          />
          {!data && (
            <Button size="sm" onClick={handleLoad} disabled={isLoading || isPlanBlocked}>
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <BarChart2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isLoading ? 'Carregando…' : 'Carregar análise'}
            </Button>
          )}
        </div>
      </div>

      {/* Plan blocked */}
      {isPlanBlocked && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
          Análise por procedimento disponível nos planos Professional e Premium.
        </div>
      )}

      {/* Error */}
      {error && !data && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Não foi possível carregar os dados</p>
            <p className="mt-0.5 text-xs opacity-80">{error}</p>
            <button
              type="button"
              onClick={handleLoad}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && !data && (
        <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          <span>Calculando margens por procedimento…</span>
        </div>
      )}

      {/* Idle prompt */}
      {!data && !isLoading && !isPlanBlocked && !error && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <BarChart2 className="h-8 w-8 text-primary/40" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Análise não carregada
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione um mês e clique em "Carregar análise" para ver o desempenho por procedimento.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Limitation banner */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{data.limitation}</span>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCard
              label="Agendamentos"
              value={String(data.totals.totalAppointments)}
              tone="neutral"
            />
            <MetricCard
              label="Concluídos"
              value={String(data.totals.completedAppointments)}
              tone="success"
            />
            <MetricCard
              label="Receita bruta"
              value={centsToDisplay(data.totals.grossRevenueCents)}
              tone="success"
            />
          </div>

          {/* Service list */}
          {data.items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum procedimento identificado no período selecionado.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {data.items.map((item) => (
                <ServiceRow key={item.serviceId} item={item} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Período: {data.period.from} a {data.period.to}
            </p>
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={handleRefresh}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Atualizar
            </Button>
          </div>
        </div>
      )}
    </PanelCard>
  )
}
