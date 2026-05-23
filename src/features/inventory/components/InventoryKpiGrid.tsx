import {
  AlertCircle,
  Clock,
  DollarSign,
  Package,
  PackageX,
  TrendingDown,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import type { StockSummary } from '../types/inventory.types'
import { formatBRLCents } from '../utils/inventory-format'

type KpiVariant = 'neutral' | 'positive' | 'warning' | 'caution' | 'danger' | 'critical'

type IconComponent = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>

const variantStyles: Record<KpiVariant, { activeCard: string; activeIcon: string; idleIcon: string }> = {
  neutral:  { activeCard: '',                                                                                                activeIcon: 'text-muted-foreground',   idleIcon: 'text-muted-foreground'  },
  positive: { activeCard: '',                                                                                                activeIcon: 'text-emerald-500 dark:text-emerald-400', idleIcon: 'text-emerald-500 dark:text-emerald-400' },
  warning:  { activeCard: 'border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-950/20',                 activeIcon: 'text-amber-500 dark:text-amber-400',   idleIcon: 'text-muted-foreground/30'  },
  caution:  { activeCard: 'border-orange-200 bg-orange-50/60 dark:border-orange-800/40 dark:bg-orange-950/20',             activeIcon: 'text-orange-500 dark:text-orange-400',  idleIcon: 'text-muted-foreground/30'  },
  danger:   { activeCard: 'border-red-200 bg-red-50/60 dark:border-red-800/40 dark:bg-red-950/20',                        activeIcon: 'text-red-500 dark:text-red-400',     idleIcon: 'text-muted-foreground/30'  },
  critical: { activeCard: 'border-red-300 bg-red-100/60 dark:border-red-700/50 dark:bg-red-950/30',                       activeIcon: 'text-red-600 dark:text-red-300',     idleIcon: 'text-muted-foreground/30'  },
}

function InventoryKpiCard({
  value,
  label,
  description,
  Icon,
  variant = 'neutral',
  active = false,
}: {
  value: string
  label: string
  description: string
  Icon: IconComponent
  variant?: KpiVariant
  active?: boolean
}) {
  const alwaysOn = variant === 'neutral' || variant === 'positive'
  const showColor = alwaysOn || active
  const { activeCard, activeIcon, idleIcon } = variantStyles[variant]

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-5 shadow-sm',
        active && !alwaysOn ? activeCard : '',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <Icon
          className={cn('mt-0.5 h-4 w-4 shrink-0', showColor ? activeIcon : idleIcon)}
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-sm font-medium leading-5 text-foreground">{label}</p>
      <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{description}</p>
    </div>
  )
}

export function InventoryKpiGrid({ summary }: { summary: StockSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <InventoryKpiCard
        value={String(summary.totalActive)}
        label="Produtos ativos"
        description="Total em estoque"
        Icon={Package}
        variant="neutral"
      />
      <InventoryKpiCard
        value={String(summary.lowStock)}
        label="Baixo estoque"
        description="Abaixo do mínimo"
        Icon={TrendingDown}
        variant="warning"
        active={summary.lowStock > 0}
      />
      <InventoryKpiCard
        value={String(summary.emptyStock)}
        label="Sem estoque"
        description="Reposição urgente"
        Icon={PackageX}
        variant="danger"
        active={summary.emptyStock > 0}
      />
      <InventoryKpiCard
        value={String(summary.expiring)}
        label="Vencendo em breve"
        description="Próximos 30 dias"
        Icon={Clock}
        variant="caution"
        active={summary.expiring > 0}
      />
      <InventoryKpiCard
        value={String(summary.expired)}
        label="Vencidos"
        description="Retire do estoque"
        Icon={AlertCircle}
        variant="critical"
        active={summary.expired > 0}
      />
      <InventoryKpiCard
        value={formatBRLCents(summary.estimatedValue)}
        label="Valor estimado"
        description="Estoque ativo"
        Icon={DollarSign}
        variant="positive"
      />
    </div>
  )
}
