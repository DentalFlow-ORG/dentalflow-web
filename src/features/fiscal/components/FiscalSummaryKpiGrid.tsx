import { Ban, CheckCircle, Clock, DollarSign, FileText, FlaskConical, Hourglass, XCircle } from 'lucide-react'

import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'

import type { FiscalSummary } from '../types/fiscal.types'
import { formatCents } from '../utils/invoice-format'

type Props = {
  summary: FiscalSummary
}

export function FiscalSummaryKpiGrid({ summary }: Props) {
  const { counts, monthTotalCents } = summary

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <HomeKpiCard
        label="Rascunhos"
        value={String(counts.DRAFT ?? 0)}
        icon={FileText}
        tone="neutral"
      />
      <HomeKpiCard
        label="Prontas para emissão"
        value={String(counts.READY_TO_ISSUE ?? 0)}
        icon={Clock}
        tone={counts.READY_TO_ISSUE > 0 ? 'warning' : 'neutral'}
      />
      <HomeKpiCard
        label="Simuladas"
        value={String(counts.SIMULATED ?? 0)}
        icon={FlaskConical}
        tone={counts.SIMULATED > 0 ? 'success' : 'neutral'}
      />
      <HomeKpiCard
        label="Em processamento"
        value={String(counts.PROCESSING ?? 0)}
        icon={Hourglass}
        tone={counts.PROCESSING > 0 ? 'info' : 'neutral'}
      />
      <HomeKpiCard
        label="Emitidas"
        value={String(counts.ISSUED ?? 0)}
        icon={CheckCircle}
        tone={counts.ISSUED > 0 ? 'success' : 'neutral'}
      />
      <HomeKpiCard
        label="Falhas"
        value={String(counts.FAILED ?? 0)}
        icon={XCircle}
        tone={counts.FAILED > 0 ? 'danger' : 'neutral'}
      />
      <HomeKpiCard
        label="Canceladas"
        value={String(counts.CANCELED ?? 0)}
        icon={Ban}
        tone="neutral"
      />
      <HomeKpiCard
        label="Total do mês"
        value={formatCents(monthTotalCents)}
        icon={DollarSign}
        tone="primary"
      />
    </div>
  )
}
