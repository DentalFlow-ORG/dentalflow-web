import { brazilTodayIso } from '@/lib/brazil-timezone'

import type { Appointment } from '../types/scheduling.types'
import { isoDateToString } from '../utils/time'

export type KpiMetrics = {
  todayTotal: number
  confirmed: number
  pending: number
  expectedRevenueCents: number
}

export function computeKpiMetrics(appointments: Appointment[]): KpiMetrics {
  const todayStr = brazilTodayIso()
  const today = appointments.filter((a) => isoDateToString(a.appointmentDate) === todayStr)

  return {
    todayTotal: today.length,
    confirmed: today.filter((a) => a.status === 'CONFIRMED').length,
    pending: today.filter((a) => a.status === 'PENDING').length,
    expectedRevenueCents: today
      .filter((a) => a.status !== 'CANCELED')
      .reduce((sum, a) => sum + (a.estimatedAmountCents ?? 0), 0),
  }
}
