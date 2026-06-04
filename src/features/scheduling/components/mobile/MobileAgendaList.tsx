import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { brazilTodayIso } from '@/lib/brazil-timezone'

import type { Appointment } from '../../types/scheduling.types'
import {
  formatWeekDayHeader,
  getWeekDates,
  isoDateToString,
  toDateInputValue,
} from '../../utils/time'
import { MobileAppointmentCard } from './MobileAppointmentCard'

type MobileAgendaListProps = {
  appointments: Appointment[]
  weekStart: Date
  onAppointmentClick: (appointment: Appointment) => void
  isLoading?: boolean
  canCreate?: boolean
  onCreateAppointment?: () => void
}

export function MobileAgendaList({
  appointments,
  weekStart,
  onAppointmentClick,
  isLoading = false,
  canCreate = false,
  onCreateAppointment,
}: MobileAgendaListProps) {
  const todayStr = brazilTodayIso()

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart])
  const weekDateStrings = useMemo(() => weekDates.map(toDateInputValue), [weekDates])

  // Initialize to today if today is in the current week, else the first day of the week
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    weekDateStrings.includes(todayStr) ? todayStr : weekDateStrings[0],
  )

  // When the week changes (desktop navigation), reset selected day
  useEffect(() => {
    setSelectedDate((prev) =>
      weekDateStrings.includes(prev)
        ? prev
        : weekDateStrings.includes(todayStr)
          ? todayStr
          : weekDateStrings[0],
    )
  }, [weekDateStrings, todayStr])

  // Filter and sort appointments for the selected day
  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((appt) => isoDateToString(appt.appointmentDate) === selectedDate)
        .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    [appointments, selectedDate],
  )

  // Day header label
  const dayHeaderLabel = (() => {
    if (selectedDate === todayStr) return 'Hoje'
    const match = weekDates.find((d) => toDateInputValue(d) === selectedDate)
    if (match) {
      const { weekday, day } = formatWeekDayHeader(match)
      return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day}`
    }
    return selectedDate
  })()

  return (
    <div className="space-y-4">
      {/* Day strip */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card px-3 py-3 shadow-sm">
        <div className="flex gap-1.5">
          {weekDates.map((date) => {
            const dateStr = toDateInputValue(date)
            const { weekday, day } = formatWeekDayHeader(date)
            const numericDay = day.split(' ')[0]
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === todayStr
            const count = appointments.filter(
              (a) => isoDateToString(a.appointmentDate) === dateStr,
            ).length

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                aria-pressed={isSelected}
                aria-label={`${weekday} ${numericDay}${count > 0 ? `, ${count} consulta${count !== 1 ? 's' : ''}` : ''}`}
                className={cn(
                  'flex min-w-[3rem] flex-1 flex-col items-center rounded-lg px-2 py-2 transition',
                  isSelected
                    ? 'bg-primary text-white shadow-sm'
                    : isToday
                      ? 'border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                      : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide leading-none">
                  {weekday}
                </span>
                <span className="mt-1 text-base font-bold leading-none tabular-nums">
                  {numericDay}
                </span>
                {count > 0 && (
                  <span
                    className={cn(
                      'mt-1.5 h-1 w-1 rounded-full',
                      isSelected ? 'bg-white/70' : 'bg-primary',
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day content */}
      <div>
        <div className="mb-3 flex items-center justify-between px-0.5">
          <h2 className="text-sm font-semibold text-foreground">{dayHeaderLabel}</h2>
          <span className="text-xs text-muted-foreground">
            {dayAppointments.length === 0
              ? 'Nenhuma consulta'
              : `${dayAppointments.length} consulta${dayAppointments.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {isLoading ? (
          <div
            role="status"
            aria-label="Carregando consultas..."
            className="space-y-2"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl border border-border bg-muted"
              />
            ))}
          </div>
        ) : dayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma consulta agendada neste dia.
            </p>
            {canCreate && (
              <p className="mt-1 text-xs text-muted-foreground/70">
                Toque no botão abaixo para criar um agendamento.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {dayAppointments.map((appt) => (
              <MobileAppointmentCard
                key={appt.id}
                appointment={appt}
                onClick={onAppointmentClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create appointment action */}
      {canCreate && onCreateAppointment && (
        <Button
          type="button"
          className="w-full"
          onClick={onCreateAppointment}
          aria-label="Criar novo agendamento"
        >
          <Plus aria-hidden="true" />
          Novo agendamento
        </Button>
      )}
    </div>
  )
}
