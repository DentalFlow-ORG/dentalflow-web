import { AlertTriangle, CheckCircle2, Lock, Package, RefreshCw } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useStockPurchaseList } from '../hooks/useStockPurchaseList'
import type { PurchasePriority, PurchaseListItem } from '../types/inventory.types'
import { formatBRLCents } from '../utils/inventory-format'
import { StockCopilotCard } from './StockCopilotCard'

// ── Priority badge ────────────────────────────────────────────────────────────

const PRIORITY_LABEL: Record<PurchasePriority, string> = {
  CRITICAL: 'Crítico',
  HIGH: 'Alta prioridade',
  MEDIUM: 'Média prioridade',
}

const PRIORITY_CLASS: Record<PurchasePriority, string> = {
  CRITICAL:
    'border-red-200 bg-red-100 text-red-700 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300',
  HIGH:
    'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300',
  MEDIUM:
    'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300',
}

function PriorityBadge({ priority }: { priority: PurchasePriority }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        PRIORITY_CLASS[priority],
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  )
}

// ── Summary mini-grid ─────────────────────────────────────────────────────────

type SummaryChipProps = {
  label: string
  value: string
  tone?: 'neutral' | 'danger' | 'warning' | 'info'
}

const CHIP_TONE: Record<NonNullable<SummaryChipProps['tone']>, string> = {
  neutral: 'border-border bg-muted/50 text-foreground',
  danger:  'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300',
  info:    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-blue-300',
}

function SummaryChip({ label, value, tone = 'neutral' }: SummaryChipProps) {
  return (
    <div className={cn('rounded-lg border p-4', CHIP_TONE[tone])}>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// ── Item row ──────────────────────────────────────────────────────────────────

function formatSuggestedQty(qty: number, unit: string | null): string {
  return `Comprar ${qty} ${unit ?? 'un.'}`
}

function PurchaseItemRow({ item }: { item: PurchaseListItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-4 sm:flex-row sm:items-start sm:gap-4">
      {/* Priority badge — top-left on mobile, first col on desktop */}
      <div className="flex items-center gap-2 sm:w-36 sm:shrink-0 sm:pt-0.5">
        <PriorityBadge priority={item.priority} />
      </div>

      {/* Product identity */}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{item.productName}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {item.categoryName && <span>{item.categoryName}</span>}
          {item.categoryName && item.supplier && (
            <span aria-hidden="true" className="text-border">·</span>
          )}
          {item.supplier && <span>{item.supplier}</span>}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
      </div>

      {/* Quantity info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm sm:shrink-0 sm:flex-col sm:gap-y-1 sm:text-right">
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{item.currentQuantity}</span>
          <span className="mx-1 text-border">/</span>
          <span>{item.minQuantity} {item.unit ?? 'un.'} mín.</span>
        </p>
        <p className="font-medium text-foreground">
          {formatSuggestedQty(item.suggestedPurchaseQuantity, item.unit)}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.estimatedCostCents !== null
            ? formatBRLCents(item.estimatedCostCents)
            : 'Custo não informado'}
        </p>
      </div>
    </div>
  )
}

// ── Section states ────────────────────────────────────────────────────────────

function PlanBlockedState() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Lista de compra automática não disponível no seu plano
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Seu estoque está dentro dos níveis mínimos definidos.
        </p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          Quando algum produto ficar abaixo do mínimo, ele aparecerá aqui com prioridade e sugestão de compra.
        </p>
      </div>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Package className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-base font-semibold text-foreground">
            Lista de compra sugerida
          </h2>
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Automático
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Produtos priorizados com base no estoque mínimo definido.
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function StockPurchaseListSection() {
  const { data, isLoading, error, isPlanBlocked, refetch } = useStockPurchaseList()

  if (isLoading) {
    return <LoadingCard message="Carregando lista de compras..." />
  }

  return (
    <PanelCard>
      <SectionHeader />

      {/* Copilot — always visible so the latest analysis persists even when the purchase list is empty */}
      <div className="mt-4">
        <StockCopilotCard />
      </div>

      {isPlanBlocked ? (
        <PlanBlockedState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data || data.summary.totalItems === 0 ? (
        <div className="mt-4">
          <EmptyState />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {/* Summary mini-grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <SummaryChip
              label="Total de itens"
              value={String(data.summary.totalItems)}
            />
            <SummaryChip
              label="Críticos"
              value={String(data.summary.criticalItems)}
              tone={data.summary.criticalItems > 0 ? 'danger' : 'neutral'}
            />
            <SummaryChip
              label="Alta prioridade"
              value={String(data.summary.highPriorityItems)}
              tone={data.summary.highPriorityItems > 0 ? 'warning' : 'neutral'}
            />
            <SummaryChip
              label="Média prioridade"
              value={String(data.summary.mediumPriorityItems)}
              tone={data.summary.mediumPriorityItems > 0 ? 'info' : 'neutral'}
            />
            <SummaryChip
              label="Custo estimado"
              value={
                data.summary.totalEstimatedCostCents > 0
                  ? formatBRLCents(data.summary.totalEstimatedCostCents)
                  : '—'
              }
              tone="neutral"
            />
          </div>

          {/* Item list */}
          <div className="space-y-2">
            {data.items.map((item) => (
              <PurchaseItemRow key={item.productId} item={item} />
            ))}
          </div>
        </div>
      )}
    </PanelCard>
  )
}
