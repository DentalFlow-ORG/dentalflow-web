import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { Button } from '@/components/ui/button'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { cn } from '@/lib/utils'

import type { Appointment, Availability, AvailabilityException } from '../../types/scheduling.types'
import {
  addDays,
  formatWeekDayHeader,
  formatWeekRangeLabel,
  getBrazilWeekStart,
  getWeekDates,
  isToday,
  isoDateToString,
  toDateInputValue,
  wallTimeToMinutes,
} from '../../utils/time'
import {
  PX_PER_MINUTE,
  SLOT_HEIGHT_PX,
  buildTimeSlots,
  computeDayLayout,
  getDayStatus,
  getDayWorkingRanges,
  isSlotInsideWorkingRanges,
  minutesToTime,
} from '../../utils/week-calendar-layout'
import { CalendarAppointmentCard } from './CalendarAppointmentCard'

type WeekCalendarProps = {
  appointments: Appointment[]
  weekStart: Date
  profileAvailability?: Availability[]
  profileExceptions?: AvailabilityException[]
  toolbarAction?: ReactNode
  onWeekChange: (weekStart: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
}

export function WeekCalendar({
  appointments,
  weekStart,
  profileAvailability,
  profileExceptions,
  toolbarAction,
  onWeekChange,
  onAppointmentClick,
}: WeekCalendarProps) {
  const [calendarInputDate, setCalendarInputDate] = useState(() => toDateInputValue(weekStart))

  // Memoize weekDates so downstream memos can use it directly as a dependency
  // instead of using weekStart as an indirect proxy.
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart])

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appt) =>
        weekDates.some((d) => isoDateToString(appt.appointmentDate) === toDateInputValue(d)),
      ),
    [appointments, weekDates],
  )

  const slots = useMemo(
    () => buildTimeSlots(visibleAppointments, weekDates, profileAvailability, profileExceptions),
    [visibleAppointments, weekDates, profileAvailability, profileExceptions],
  )
  const firstSlotMinutes = slots[0]
  const gridBodyHeight = slots.length * SLOT_HEIGHT_PX

  // Pre-compute per-day positioned appointments.
  // computeDayLayout handles its own deterministic sort internally.
  const dayLayouts = useMemo(() => {
    return weekDates.map((date) => {
      const dateStr = toDateInputValue(date)
      const dayAppointments = visibleAppointments.filter(
        (appt) => isoDateToString(appt.appointmentDate) === dateStr,
      )
      return { date, appointments: computeDayLayout(dayAppointments) }
    })
  }, [visibleAppointments, weekDates])

  function goToPrevWeek() {
    const next = addDays(weekStart, -7)
    setCalendarInputDate(toDateInputValue(next))
    onWeekChange(next)
  }

  function goToNextWeek() {
    const next = addDays(weekStart, 7)
    setCalendarInputDate(toDateInputValue(next))
    onWeekChange(next)
  }

  function goToToday() {
    const todayStr = brazilTodayIso()
    setCalendarInputDate(todayStr)
    onWeekChange(getBrazilWeekStart(todayStr))
  }

  function goToDate(value: string) {
    if (!value) return
    setCalendarInputDate(value)
    onWeekChange(getBrazilWeekStart(value))
  }

  const weekLabel = formatWeekRangeLabel(weekDates[0], weekDates[6])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-3 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Semana
            </p>
            <p className="text-sm font-semibold text-foreground">{weekLabel}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {toolbarAction && <div className="flex shrink-0 justify-end">{toolbarAction}</div>}
          <div className="w-full sm:w-48">
            <DatePickerInput value={calendarInputDate} onValueChange={goToDate} className="h-9" />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={goToPrevWeek}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={goToNextWeek}
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm shadow-black/5">
        {/* Mobile scroll hint — only visible on small screens */}
        <div className="flex items-center justify-end gap-1.5 border-b border-border px-3 py-1.5 lg:hidden">
          <span className="text-[11px] text-muted-foreground">
            Arraste para ver sábado e domingo
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="app-scrollbar relative overflow-x-auto">
          {/* Right-side fade indicating more content */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-card/70 to-transparent lg:hidden" />
          <div className="min-w-245">
            {/* Day headers */}
            <div className="grid grid-cols-[5.5rem_repeat(7,minmax(7.5rem,1fr))] border-b border-border bg-muted">
              <div className="sticky left-0 z-20 flex items-center gap-2 border-r border-border bg-muted px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                Hora
              </div>
              {weekDates.map((date) => {
                const { weekday, day } = formatWeekDayHeader(date)
                const today = isToday(date)
                const dayStatus = getDayStatus(date, profileAvailability, profileExceptions)

                return (
                  <div
                    key={toDateInputValue(date)}
                    className={cn(
                      'border-r border-border px-3 py-3 last:border-r-0',
                      today && dayStatus.isWorking && 'bg-primary/5',
                      !dayStatus.isWorking && 'bg-muted/80',
                      dayStatus.kind === 'special' && 'bg-indigo-50/70',
                    )}
                  >
                    <p
                      className={cn(
                        'text-xs font-semibold uppercase tracking-wide',
                        today && dayStatus.isWorking
                          ? 'text-primary'
                          : dayStatus.kind === 'special'
                            ? 'text-indigo-600'
                            : !dayStatus.isWorking
                              ? 'text-muted-foreground'
                              : 'text-muted-foreground',
                      )}
                    >
                      {weekday}
                    </p>
                    <p
                      className={cn(
                        'mt-0.5 text-sm font-bold',
                        today && dayStatus.isWorking
                          ? 'text-primary'
                          : dayStatus.kind === 'special'
                            ? 'text-indigo-950'
                            : !dayStatus.isWorking
                              ? 'text-muted-foreground'
                              : 'text-foreground',
                      )}
                    >
                      {day}
                    </p>
                    {!dayStatus.isWorking && (
                      <p
                        className="mt-0.5 truncate text-[10px] font-medium text-muted-foreground"
                        title={dayStatus.reason ?? 'Folga'}
                      >
                        {dayStatus.reason ? `Folga: ${dayStatus.reason}` : 'Folga'}
                      </p>
                    )}
                    {dayStatus.kind === 'special' && dayStatus.timeRange && (
                      <p
                        className="mt-0.5 truncate text-[10px] font-semibold text-indigo-600"
                        title={`Horário especial: ${dayStatus.timeRange}`}
                      >
                        Especial: {dayStatus.timeRange}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Empty week state — shown instead of the time grid when there are no appointments */}
            {visibleAppointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground/30" aria-hidden="true" />
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhuma consulta agendada nesta semana.
                </p>
              </div>
            ) : null}

            {/* Time grid body */}
            {visibleAppointments.length > 0 && (
              <div className="relative" style={{ height: `${gridBodyHeight}px` }}>
                {/* Background: time labels + grid lines */}
                <div className="absolute inset-0 grid grid-cols-[5.5rem_repeat(7,minmax(7.5rem,1fr))]">
                  {/* Time label column */}
                  <div className="sticky left-0 z-10 border-r border-border bg-card">
                    {slots.map((slot) => (
                      <div
                        key={slot}
                        className="flex items-start border-b border-border/50 text-xs font-semibold text-muted-foreground last:border-b-0"
                        style={{ height: `${SLOT_HEIGHT_PX}px` }}
                      >
                        <span className="pl-3 pt-1.5">{minutesToTime(slot)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Day background columns */}
                  {weekDates.map((date) => {
                    const today = isToday(date)
                    const dayStatus = getDayStatus(date, profileAvailability, profileExceptions)
                    const workingRanges = getDayWorkingRanges(
                      date,
                      profileAvailability,
                      profileExceptions,
                    )

                    return (
                      <div
                        key={toDateInputValue(date)}
                        className={cn(
                          'relative border-r border-border/50 last:border-r-0',
                          today && dayStatus.isWorking
                            ? 'bg-primary/5'
                            : !dayStatus.isWorking
                              ? 'bg-muted/50'
                              : 'bg-card',
                        )}
                      >
                        {slots.map((slot) => {
                          const isRoutineSlot = isSlotInsideWorkingRanges(slot, workingRanges)

                          return (
                            <div
                              key={slot}
                              className={cn(
                                'border-b border-border/50 last:border-b-0',
                                isRoutineSlot
                                  ? 'bg-transparent'
                                  : 'bg-[repeating-linear-gradient(135deg,#f8fafc_0px,#f8fafc_8px,#eef2f7_8px,#eef2f7_12px)] dark:bg-[repeating-linear-gradient(135deg,#171717_0px,#171717_8px,#262626_8px,#262626_12px)] opacity-90',
                              )}
                              style={{ height: `${SLOT_HEIGHT_PX}px` }}
                              title={
                                isRoutineSlot
                                  ? undefined
                                  : 'Fora da rotina de atendimento deste dia'
                              }
                            />
                          )
                        })}
                      </div>
                    )
                  })}
                </div>

                {/* Appointments overlay */}
                <div className="pointer-events-none absolute inset-0 grid grid-cols-[5.5rem_repeat(7,minmax(7.5rem,1fr))]">
                  {/* Spacer for time column */}
                  <div />

                  {/* Per-day appointment columns */}
                  {dayLayouts.map(({ date, appointments: dayAppts }) => (
                    <div key={toDateInputValue(date)} className="pointer-events-auto relative">
                      {dayAppts.map((appt) => {
                        const startMin = wallTimeToMinutes(appt.startTime ?? '')
                        const top = (startMin - firstSlotMinutes) * PX_PER_MINUTE
                        const height = Math.max(
                          (appt.durationMinutes ?? 30) * PX_PER_MINUTE,
                          SLOT_HEIGHT_PX / 2,
                        )
                        const leftPct = (appt.colIndex / appt.colCount) * 100
                        const widthPct = 100 / appt.colCount

                        return (
                          <CalendarAppointmentCard
                            key={appt.id}
                            appointment={appt}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              left: `calc(${leftPct}% + 3px)`,
                              width: `calc(${widthPct}% - 6px)`,
                            }}
                            onClick={onAppointmentClick}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
