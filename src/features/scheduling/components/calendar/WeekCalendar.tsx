import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  addDays,
  formatWallTime,
  formatWeekDayHeader,
  formatWeekRangeLabel,
  getWeekDates,
  getWeekStart,
  isToday,
  isoDateToString,
  toDateInputValue,
  wallTimeToMinutes,
} from '../../utils/time'
import type { Appointment, AppointmentStatus } from '../../types/scheduling.types'
import { STATUS_CONFIG } from '../appointments/AppointmentStatusBadge'

type WeekCalendarProps = {
  appointments: Appointment[]
  weekStart: Date
  onWeekChange: (weekStart: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
}

const DEFAULT_START_MINUTES = 8 * 60
const DEFAULT_END_MINUTES = 18 * 60
const SLOT_MINUTES = 30

const STATUS_CELL_CLASS: Record<AppointmentStatus, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100',
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-100',
  COMPLETED: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
  CANCELED: 'border-red-200 bg-red-50 text-red-900 opacity-70 hover:bg-red-100',
  NO_SHOW: 'border-orange-200 bg-orange-50 text-orange-900 opacity-70 hover:bg-orange-100',
}

export function WeekCalendar({
  appointments,
  weekStart,
  onWeekChange,
  onAppointmentClick,
}: WeekCalendarProps) {
  const weekDates = getWeekDates(weekStart)
  const visibleAppointments = appointments.filter((appointment) =>
    weekDates.some(
      (date) => isoDateToString(appointment.appointmentDate) === toDateInputValue(date),
    ),
  )
  const slots = buildTimeSlots(visibleAppointments)

  function goToPrevWeek() {
    onWeekChange(addDays(weekStart, -7))
  }

  function goToNextWeek() {
    onWeekChange(addDays(weekStart, 7))
  }

  function goToToday() {
    onWeekChange(getWeekStart(new Date()))
  }

  function getAppointmentsForCell(date: Date, slotStart: number): Appointment[] {
    const dateStr = toDateInputValue(date)
    return visibleAppointments
      .filter((appointment) => {
        const appointmentStart = wallTimeToMinutes(appointment.startTime)
        return (
          isoDateToString(appointment.appointmentDate) === dateStr &&
          appointmentStart >= slotStart &&
          appointmentStart < slotStart + SLOT_MINUTES
        )
      })
      .sort((first, second) => first.startTime.localeCompare(second.startTime))
  }

  const weekLabel = formatWeekRangeLabel(weekDates[0], weekDates[6])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Semana
            </p>
            <p className="text-sm font-semibold text-slate-800">{weekLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={goToNextWeek}
            aria-label="Proxima semana"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-950/5">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[5.5rem_repeat(7,minmax(7.5rem,1fr))] border-b border-slate-200 bg-slate-50">
              <div className="sticky left-0 z-20 flex items-center gap-2 border-r border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                Hora
              </div>
              {weekDates.map((date) => {
                const { weekday, day } = formatWeekDayHeader(date)
                const today = isToday(date)

                return (
                  <div
                    key={toDateInputValue(date)}
                    className={cn(
                      'border-r border-slate-200 px-3 py-3 last:border-r-0',
                      today && 'bg-blue-50/70',
                    )}
                  >
                    <p
                      className={cn(
                        'text-xs font-semibold uppercase tracking-wide',
                        today ? 'text-primary' : 'text-slate-500',
                      )}
                    >
                      {weekday}
                    </p>
                    <p
                      className={cn(
                        'mt-0.5 text-sm font-bold',
                        today ? 'text-primary' : 'text-slate-950',
                      )}
                    >
                      {day}
                    </p>
                  </div>
                )
              })}
            </div>

            <div>
              {slots.map((slot) => (
                <div
                  key={slot}
                  className="grid min-h-20 grid-cols-[5.5rem_repeat(7,minmax(7.5rem,1fr))] border-b border-slate-100 last:border-b-0"
                >
                  <div className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-400">
                    {minutesToTime(slot)}
                  </div>
                  {weekDates.map((date) => {
                    const cellAppointments = getAppointmentsForCell(date, slot)
                    const today = isToday(date)

                    return (
                      <div
                        key={`${toDateInputValue(date)}-${slot}`}
                        className={cn(
                          'min-h-20 border-r border-slate-100 p-1.5 last:border-r-0',
                          today ? 'bg-blue-50/25' : 'bg-white',
                          cellAppointments.length === 0 && 'hover:bg-slate-50',
                        )}
                      >
                        {cellAppointments.length === 0 ? (
                          <span className="block h-full rounded-md border border-dashed border-transparent" />
                        ) : (
                          <div className="space-y-1.5">
                            {cellAppointments.map((appointment) => (
                              <SpreadsheetAppointment
                                key={appointment.id}
                                appointment={appointment}
                                onClick={onAppointmentClick}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpreadsheetAppointment({
  appointment,
  onClick,
}: {
  appointment: Appointment
  onClick: (appointment: Appointment) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(appointment)}
      className={cn(
        'group w-full rounded-md border px-2.5 py-2 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20',
        STATUS_CELL_CLASS[appointment.status],
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold">{appointment.patientName}</span>
        <span className="shrink-0 text-[10px] font-semibold opacity-70">
          {formatWallTime(appointment.startTime)}
        </span>
      </div>
      <p className="mt-1 truncate text-[11px] font-medium opacity-75">
        {appointment.service?.name ?? appointment.profile.displayName}
      </p>
      <span className="mt-1 inline-flex rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold opacity-80">
        {STATUS_CONFIG[appointment.status].label}
      </span>
    </button>
  )
}

function buildTimeSlots(appointments: Appointment[]) {
  const appointmentMinutes = appointments.flatMap((appointment) => [
    wallTimeToMinutes(appointment.startTime),
    wallTimeToMinutes(appointment.endTime),
  ])
  const minStart = Math.min(DEFAULT_START_MINUTES, ...appointmentMinutes)
  const maxEnd = Math.max(DEFAULT_END_MINUTES, ...appointmentMinutes)
  const start = Math.floor(minStart / SLOT_MINUTES) * SLOT_MINUTES
  const end = Math.ceil(maxEnd / SLOT_MINUTES) * SLOT_MINUTES

  return Array.from(
    { length: Math.max(1, (end - start) / SLOT_MINUTES) },
    (_, index) => start + index * SLOT_MINUTES,
  )
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}
