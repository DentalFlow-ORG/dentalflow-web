import {
  AlertCircle,
  Clock,
  DollarSign,
  Package,
  PackageX,
  TrendingDown,
} from 'lucide-react'

import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'

import type { StockSummary } from '../types/inventory.types'
import { formatBRLCents } from '../utils/inventory-format'

export function InventoryKpiGrid({ summary }: { summary: StockSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <HomeKpiCard
        value={String(summary.totalActive)}
        label="Produtos ativos"
        description="Total em estoque"
        icon={Package}
        tone="neutral"
      />
      <HomeKpiCard
        value={String(summary.lowStock)}
        label="Baixo estoque"
        description="Abaixo do mínimo"
        icon={TrendingDown}
        tone={summary.lowStock > 0 ? 'warning' : 'neutral'}
      />
      <HomeKpiCard
        value={String(summary.emptyStock)}
        label="Sem estoque"
        description="Reposição urgente"
        icon={PackageX}
        tone={summary.emptyStock > 0 ? 'danger' : 'neutral'}
      />
      <HomeKpiCard
        value={String(summary.expiring)}
        label="Vencendo em breve"
        description="Próximos 30 dias"
        icon={Clock}
        tone={summary.expiring > 0 ? 'warning' : 'neutral'}
      />
      <HomeKpiCard
        value={String(summary.expired)}
        label="Vencidos"
        description="Retire do estoque"
        icon={AlertCircle}
        tone={summary.expired > 0 ? 'danger' : 'neutral'}
      />
      <HomeKpiCard
        value={formatBRLCents(summary.estimatedValue)}
        label="Valor estimado"
        description="Estoque ativo"
        icon={DollarSign}
        tone="success"
      />
    </div>
  )
}
