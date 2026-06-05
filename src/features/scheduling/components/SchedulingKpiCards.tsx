import { useMemo } from 'react'
import { CalendarDays, CheckCircle2, Clock, DollarSign } from 'lucide-react'

import { brazilTodayIso } from '@/lib/brazil-timezone'
import { formatCurrencyBRL } from '@/lib/number-formatters'

import type { Appointment } from '../types/scheduling.types'
import { isoDateToString } from '../utils/time'

type SchedulingKpiCardsProps = {
  appointments: Appointment[]
}

export type KpiMetrics = {
  todayTotal: number
  confirmed: number
  pending: number
  expectedRevenueCents: number
}

export function computeKpiMetrics(appointments: Appointment[]): KpiMetrics {
  const todayStr = brazilTodayIso()
  const today = appointments.filter(
    (a) => isoDateToString(a.appointmentDate) === todayStr,
  )

  return {
    todayTotal: today.length,
    confirmed: today.filter((a) => a.status === 'CONFIRMED').length,
    pending: today.filter((a) => a.status === 'PENDING').length,
    expectedRevenueCents: today
      .filter((a) => a.status !== 'CANCELED')
      .reduce((sum, a) => sum + (a.estimatedAmountCents ?? 0), 0),
  }
}

export function SchedulingKpiCards({ appointments }: SchedulingKpiCardsProps) {
  const { todayTotal, confirmed, pending, expectedRevenueCents } = useMemo(
    () => computeKpiMetrics(appointments),
    [appointments],
  )

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard
        icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
        label="Consultas hoje"
        value={String(todayTotal)}
        iconBg="bg-muted"
        iconColor="text-muted-foreground"
        valueColor="text-foreground"
      />
      <KpiCard
        icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
        label="Confirmadas"
        value={String(confirmed)}
        iconBg="bg-emerald-100 dark:bg-emerald-900/40"
        iconColor="text-emerald-700 dark:text-emerald-400"
        valueColor="text-emerald-700 dark:text-emerald-400"
      />
      <KpiCard
        icon={<Clock className="h-4 w-4" aria-hidden="true" />}
        label="Pendentes"
        value={String(pending)}
        iconBg="bg-amber-100 dark:bg-amber-900/40"
        iconColor="text-amber-700 dark:text-amber-400"
        valueColor="text-amber-700 dark:text-amber-400"
      />
      <KpiCard
        icon={<DollarSign className="h-4 w-4" aria-hidden="true" />}
        label="Faturamento previsto"
        value={formatCurrencyBRL(expectedRevenueCents / 100)}
        iconBg="bg-muted"
        iconColor="text-muted-foreground"
        valueColor="text-foreground"
      />
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  iconBg,
  iconColor,
  valueColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  iconBg: string
  iconColor: string
  valueColor: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-sm shadow-black/5">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-semibold leading-none tabular-nums ${valueColor}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
