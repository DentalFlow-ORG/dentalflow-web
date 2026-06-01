import { useMemo, useState } from 'react'
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
import { MonthPickerInput } from '@/components/common/MonthPickerInput'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { brazilCurrentIsoMonth } from '@/lib/brazil-timezone'
import { cn } from '@/lib/utils'

import type { ProcedureMarginsState } from '../hooks/useProcedureMargins'
import type { ProcedureMarginsQuery } from '../services/finance-analytics.service'
import type { ProcedureMarginItem, ProcedureMarginStatus } from '../types/finance.types'
import { formatCompactCurrency, formatCurrency } from '../utils/finance-format'
import { Ranking } from './Ranking'

type SortKey = 'revenue' | 'volume' | 'margin' | 'name'

function currentMonth(): string {
  return brazilCurrentIsoMonth()
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

function InsightCard({ label, name, detail }: { label: string; name: string; detail: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

function MarginsRanking({ items }: { items: ProcedureMarginItem[] }) {
  const sorted = [...items]
    .sort((a, b) => (b.marginPercent ?? -Infinity) - (a.marginPercent ?? -Infinity))
    .slice(0, 5)

  const withMargin = items.filter((i) => i.marginPercent != null)
  if (withMargin.length === 0) return null

  const maxAbsMargin = Math.max(...withMargin.map((i) => Math.abs(i.marginPercent!)))

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Margem estimada (%)</h3>
      <div className="mt-3 space-y-3">
        {sorted.map((item) => {
          const mp = item.marginPercent
          const barWidth =
            mp != null && maxAbsMargin > 0
              ? Math.max(2, Math.round((Math.abs(mp) / maxAbsMargin) * 100))
              : 2
          const isPositive = mp != null && mp >= 0
          const isNegative = mp != null && mp < 0
          return (
            <div key={item.serviceId} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-foreground">{item.serviceName}</span>
                <span
                  className={cn(
                    'shrink-0 text-xs font-medium',
                    isPositive
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : isNegative
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-muted-foreground',
                  )}
                >
                  {mp != null ? `${mp.toFixed(2).replace('.', ',')}%` : '—'}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full',
                    isPositive ? 'bg-emerald-500' : isNegative ? 'bg-red-500' : 'bg-muted-foreground/30',
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
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
          {item.estimatedDirectCostCents != null ? (
            <strong className="text-foreground">{centsToDisplay(item.estimatedDirectCostCents)}</strong>
          ) : (
            <em className="not-italic text-muted-foreground/60">Não configurado</em>
          )}
        </span>
        {item.estimatedProfitCents != null && (
          <span>
            Lucro estimado:{' '}
            <strong className={item.estimatedProfitCents >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}>
              {centsToDisplay(item.estimatedProfitCents)}
            </strong>
          </span>
        )}
        {item.marginPercent != null && (
          <span>
            Margem (est.):{' '}
            <strong className={item.marginPercent >= 30 ? 'text-emerald-700 dark:text-emerald-300' : item.marginPercent >= 15 ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300'}>
              {item.marginPercent.toFixed(2).replace('.', ',')}%
            </strong>
          </span>
        )}
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
  const [sortKey, setSortKey] = useState<SortKey>('revenue')

  const handleLoad = () => onLoad({ month: selectedMonth })
  const handleRefresh = () => onLoad({ month: selectedMonth })

  const sortedItems = useMemo(() => {
    if (!data) return []
    const copy = [...data.items]
    switch (sortKey) {
      case 'revenue':
        return copy.sort((a, b) => b.grossRevenueCents - a.grossRevenueCents)
      case 'volume':
        return copy.sort((a, b) => b.totalAppointments - a.totalAppointments)
      case 'margin':
        return copy.sort((a, b) => (b.marginPercent ?? -Infinity) - (a.marginPercent ?? -Infinity))
      case 'name':
        return copy.sort((a, b) => a.serviceName.localeCompare(b.serviceName, 'pt-BR'))
      default:
        return copy
    }
  }, [data, sortKey])

  const topByRevenue = useMemo(
    () =>
      data?.items.length
        ? data.items.reduce((best, cur) => (cur.grossRevenueCents > best.grossRevenueCents ? cur : best))
        : null,
    [data],
  )

  const topByVolume = useMemo(
    () =>
      data?.items.length
        ? data.items.reduce((best, cur) => (cur.totalAppointments > best.totalAppointments ? cur : best))
        : null,
    [data],
  )

  const topByMargin = useMemo(() => {
    if (!data?.costDataAvailable) return null
    const withMargin = data.items.filter((i) => i.marginPercent != null)
    if (!withMargin.length) return null
    return withMargin.reduce((best, cur) => (cur.marginPercent! > best.marginPercent! ? cur : best))
  }, [data])

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
          <MonthPickerInput
            value={selectedMonth}
            onValueChange={setSelectedMonth}
            className="w-40"
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
          {data.items.length > 0 && data.limitation && !data.costDataAvailable && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-400">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{data.limitation}</span>
            </div>
          )}
          {data.costDataAvailable && !data.limitation && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/20 dark:text-blue-400">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Custo direto configurado. Margens calculadas com base no custo de materiais por procedimento, sem incluir mão de obra.</span>
            </div>
          )}

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
            {data.costDataAvailable && data.totals.estimatedDirectCostCents != null && (
              <MetricCard
                label="Custo total est."
                value={centsToDisplay(data.totals.estimatedDirectCostCents)}
                tone="warning"
              />
            )}
            {data.costDataAvailable && data.totals.estimatedProfitCents != null && (
              <MetricCard
                label="Lucro estimado"
                value={centsToDisplay(data.totals.estimatedProfitCents)}
                tone={data.totals.estimatedProfitCents >= 0 ? 'success' : 'danger'}
              />
            )}
            {data.costDataAvailable && data.totals.marginPercent != null && (
              <MetricCard
                label="Margem (est.)"
                value={`${data.totals.marginPercent.toFixed(2).replace('.', ',')}%`}
                tone={data.totals.marginPercent >= 30 ? 'success' : data.totals.marginPercent >= 15 ? 'warning' : 'danger'}
              />
            )}
          </div>

          {/* Executive insight cards */}
          {data.items.length > 0 && topByRevenue && topByVolume && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InsightCard
                label="Maior receita"
                name={topByRevenue.serviceName}
                detail={formatCompactCurrency(topByRevenue.grossRevenueCents / 100)}
              />
              <InsightCard
                label="Mais realizado"
                name={topByVolume.serviceName}
                detail={`${topByVolume.totalAppointments} realizações`}
              />
              {topByMargin && (
                <InsightCard
                  label="Maior margem (est.)"
                  name={topByMargin.serviceName}
                  detail={`${topByMargin.marginPercent!.toFixed(2).replace('.', ',')}%`}
                />
              )}
            </div>
          )}

          {/* Rankings panel */}
          {data.items.length > 1 && (
            <div
              className={cn(
                'grid gap-6',
                data.costDataAvailable ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1',
              )}
            >
              <Ranking
                title="Receita por procedimento"
                items={[...data.items]
                  .sort((a, b) => b.grossRevenueCents - a.grossRevenueCents)
                  .map((i) => ({
                    label: i.serviceName,
                    amount: i.grossRevenueCents / 100,
                    color: '#10B981',
                  }))}
              />
              {data.costDataAvailable && <MarginsRanking items={data.items} />}
            </div>
          )}

          {/* Service list */}
          {data.items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum procedimento identificado no período selecionado.
            </p>
          ) : (
            <div className="space-y-3">
              {data.items.length > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <label
                    htmlFor="procedure-sort"
                    className="text-xs text-muted-foreground"
                  >
                    Ordenar por
                  </label>
                  <select
                    id="procedure-sort"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Ordenar procedimentos"
                  >
                    <option value="revenue">Receita (maior primeiro)</option>
                    <option value="volume">Realizações (maior primeiro)</option>
                    <option value="margin" disabled={!data.costDataAvailable}>
                      Margem (maior primeiro)
                    </option>
                    <option value="name">Nome (A → Z)</option>
                  </select>
                </div>
              )}
              <div className="divide-y divide-border" data-testid="service-list">
                {sortedItems.map((item) => (
                  <ServiceRow key={item.serviceId} item={item} />
                ))}
              </div>
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
