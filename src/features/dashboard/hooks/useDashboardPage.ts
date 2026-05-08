import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { getFinanceSummary } from '@/features/finance/services/finance.service'
import type { FinanceSummary } from '@/features/finance/types/finance.types'
import { listAppointments } from '@/features/scheduling/services/scheduling.service'
import type { Appointment } from '@/features/scheduling/types/scheduling.types'

function todayIso(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useDashboardPage() {
  const { user } = useAuth()
  const today = todayIso()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerAppointment, setDrawerAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    const calls: [Promise<Appointment[]>, Promise<FinanceSummary | null>] = [
      listAppointments(today),
      user?.role === 'OWNER'
        ? getFinanceSummary({ from: today, to: today, groupBy: 'day' })
        : Promise.resolve(null),
    ]

    Promise.all(calls)
      .then(([appts, summary]) => {
        setAppointments(appts)
        setFinanceSummary(summary)
      })
      .catch(() => {
        setError('Não foi possível carregar os dados do dia. Tente recarregar a página.')
      })
      .finally(() => setIsLoading(false))
  }, [today, user?.role]) // eslint-disable-line react-hooks/exhaustive-deps

  const statusCounts = useMemo(() => {
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length
    const pending = appointments.filter((a) => a.status === 'PENDING').length
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length
    const canceledOrNoShow = appointments.filter(
      (a) => a.status === 'CANCELED' || a.status === 'NO_SHOW',
    ).length
    return { total: appointments.length, confirmed, pending, completed, canceledOrNoShow }
  }, [appointments])

  // Next appointments still to happen (PENDING or CONFIRMED), sorted by startTime.
  // Limited to 6 for the dashboard panel.
  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED')
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, 6),
    [appointments],
  )

  const activeDentists = useMemo(() => {
    const names = appointments.map((a) => a.profile.displayName)
    return [...new Set(names)]
  }, [appointments])

  const financeTodaySummary = useMemo(() => {
    if (!financeSummary) return null
    const received = financeSummary.kpis.totalIncome
    const pending = financeSummary.kpis.pendingReceivables
    return {
      received,
      pendingReceivables: pending,
      expectedTotal: received + pending,
    }
  }, [financeSummary])

  return {
    user,
    today,
    appointments,
    statusCounts,
    upcomingAppointments,
    activeDentists,
    financeTodaySummary,
    isLoading,
    error,
    drawerAppointment,
    setDrawerAppointment,
  }
}
