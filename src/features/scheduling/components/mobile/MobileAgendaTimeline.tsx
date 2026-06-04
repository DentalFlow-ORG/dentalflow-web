import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { brazilTodayIso } from '@/lib/brazil-timezone'

import type { Appointment } from '../../types/scheduling.types'
import {
  formatWeekDayHeader,
  formatWallTime,
  getWeekDates,
  isoDateToString,
  toDateInputValue,
} from '../../utils/time'
import {
  STATUS_LABELS,
  STATUS_ACCENT_COLORS,
} from '../../constants/appointment-display'
import { AppointmentStatusBadge } from '../appointments/AppointmentStatusBadge'

type MobileAgendaTimelineProps = {
  appointments: Appointment[]
  weekStart: Date
  onAppointmentClick: (appointment: Appointment) => void
  isLoading?: boolean
  canCreate?: boolean
  onCreateAppointment?: () => void
}

export function MobileAgendaTimeline({
  appointments,
  weekStart,
  onAppointmentClick,
  isLoading = false,
  canCreate = false,
  onCreateAppointment,
}: MobileAgendaTimelineProps) {
  const todayStr = brazilTodayIso()

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart])
  const weekDateStrings = useMemo(() => weekDates.map(toDateInputValue), [weekDates])

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    weekDateStrings.includes(todayStr) ? todayStr : weekDateStrings[0],
  )

  useEffect(() => {
    setSelectedDate((prev) =>
      weekDateStrings.includes(prev)
        ? prev
        : weekDateStrings.includes(todayStr)
          ? todayStr
          : weekDateStrings[0],
    )
  }, [weekDateStrings, todayStr])

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((appt) => isoDateToString(appt.appointmentDate) === selectedDate)
        .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    [appointments, selectedDate],
  )

  const isToday = selectedDate === todayStr

  const dayHeaderLabel = (() => {
    if (isToday) return 'Hoje'
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
            const isDayToday = dateStr === todayStr
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
                    : isDayToday
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

      {/* Timeline content */}
      <div>
        <div className="mb-3 flex items-center justify-between px-0.5">
          <h2
            className={cn(
              'text-sm font-semibold',
              isToday ? 'text-primary' : 'text-foreground',
            )}
          >
            {dayHeaderLabel}
          </h2>
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
            className="space-y-3"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-10 w-14 animate-pulse rounded bg-muted" />
                <div className="h-16 flex-1 animate-pulse rounded-xl border border-border bg-muted" />
              </div>
            ))}
          </div>
        ) : dayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <CalendarDays
              className="mb-2 h-8 w-8 text-muted-foreground/40"
              aria-hidden="true"
            />
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
          /*
           * Timeline layout:
           *   [w-14 time] [w-4 dot centered at left-16] [flex-1 card]
           * The vertical guide line is absolute at left-16 (= 56+8 = 64px),
           * which is the center of the dot column.
           */
          <div className="relative space-y-3">
            <div
              className="pointer-events-none absolute left-16 top-4 bottom-4 w-px bg-border"
              aria-hidden="true"
            />

            {dayAppointments.map((appt) => {
              const startTime = formatWallTime(appt.startTime)
              const endTime = formatWallTime(appt.endTime)
              const serviceName = appt.service?.name ?? null
              const professionalName = appt.profile?.displayName ?? null
              const statusLabel = STATUS_LABELS[appt.status]

              const ariaLabel = [
                appt.patientName,
                endTime
                  ? `${startTime} – ${endTime}`
                  : startTime,
                serviceName,
                serviceName && professionalName ? professionalName : null,
                statusLabel,
              ]
                .filter(Boolean)
                .join(', ')

              return (
                <div key={appt.id} className="flex items-start">
                  {/* Time column: 56px (w-14) */}
                  <div className="w-14 shrink-0 pt-3 pr-2 text-right">
                    <span className="block text-[11px] font-bold tabular-nums text-foreground leading-none">
                      {startTime}
                    </span>
                    {endTime && (
                      <span className="mt-0.5 block text-[10px] tabular-nums text-muted-foreground/70 leading-none">
                        {endTime}
                      </span>
                    )}
                  </div>

                  {/* Dot column: 16px (w-4), center at left-16 = 64px */}
                  <div className="w-4 shrink-0 flex justify-center pt-3.5 z-10">
                    <div
                      className={cn(
                        'h-2.5 w-2.5 shrink-0 rounded-full border-2 border-background',
                        STATUS_ACCENT_COLORS[appt.status],
                      )}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Card */}
                  <div className="flex-1 min-w-0 pl-2">
                    <button
                      type="button"
                      onClick={() => onAppointmentClick(appt)}
                      aria-label={ariaLabel}
                      className={cn(
                        'w-full text-left rounded-xl border border-border bg-card overflow-hidden',
                        'shadow-sm transition hover:shadow-md active:scale-[0.99]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        appt.status === 'CANCELED' && 'opacity-60',
                      )}
                    >
                      <div className="flex items-stretch">
                        {/* Status accent left strip */}
                        <div
                          className={cn('w-1.5 shrink-0', STATUS_ACCENT_COLORS[appt.status])}
                          aria-hidden="true"
                        />
                        {/* Content */}
                        <div className="flex-1 min-w-0 px-3 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 truncate text-sm font-semibold text-foreground leading-tight">
                              {appt.patientName}
                            </p>
                            <AppointmentStatusBadge
                              status={appt.status}
                              className="ml-1 shrink-0"
                            />
                          </div>
                          {serviceName && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {serviceName}
                            </p>
                          )}
                          {professionalName && (
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                              {professionalName}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create CTA */}
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
