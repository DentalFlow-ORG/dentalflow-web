import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { Button } from '@/components/ui/button'
import { parseIsoDateInput } from '@/lib/date-time-input'
import { cn } from '@/lib/utils'

import {
  addDays,
  BUSINESS_END_TIME,
  BUSINESS_START_TIME,
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
import type { Appointment, AppointmentStatus, Availability } from '../../types/scheduling.types'

type WeekCalendarProps = {
  appointments: Appointment[]
  weekStart: Date
  profileAvailability?: Availability[]
  toolbarAction?: ReactNode
  onWeekChange: (weekStart: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
}

const DEFAULT_START_MINUTES = wallTimeToMinutes(BUSINESS_START_TIME)
const DEFAULT_END_MINUTES = wallTimeToMinutes(BUSINESS_END_TIME)
const SLOT_MINUTES = 30
const SLOT_HEIGHT_PX = 80
const PX_PER_MINUTE = SLOT_HEIGHT_PX / SLOT_MINUTES

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: 'border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200',
  CONFIRMED: 'border-emerald-300 bg-emerald-100 text-emerald-950 hover:bg-emerald-200',
  COMPLETED: 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200',
  CANCELED: 'border-red-300 bg-red-100 text-red-900 opacity-70 hover:bg-red-200',
  NO_SHOW: 'border-orange-300 bg-orange-100 text-orange-900 opacity-70 hover:bg-orange-200',
}

type PositionedAppointment = Appointment & {
  colIndex: number
  colCount: number
}

export function WeekCalendar({
  appointments,
  weekStart,
  profileAvailability,
  toolbarAction,
  onWeekChange,
  onAppointmentClick,
}: WeekCalendarProps) {
  const [calendarInputDate, setCalendarInputDate] = useState(() =>
    toDateInputValue(weekStart),
  )
  const weekDates = getWeekDates(weekStart)

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appt) =>
        weekDates.some((d) => isoDateToString(appt.appointmentDate) === toDateInputValue(d)),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, weekStart],
  )

  const slots = useMemo(
    () => buildTimeSlots(visibleAppointments, profileAvailability),
    [visibleAppointments, profileAvailability],
  )
  const firstSlotMinutes = slots[0]
  const gridBodyHeight = slots.length * SLOT_HEIGHT_PX

  // Pre-compute per-day positioned appointments
  const dayLayouts = useMemo(() => {
    return weekDates.map((date) => {
      const dateStr = toDateInputValue(date)
      const dayAppointments = visibleAppointments
        .filter((appt) => isoDateToString(appt.appointmentDate) === dateStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
      return { date, appointments: computeDayLayout(dayAppointments) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleAppointments, weekStart])

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
    const today = new Date()
    setCalendarInputDate(toDateInputValue(today))
    onWeekChange(getWeekStart(today))
  }

  function goToDate(value: string) {
    const date = parseIsoDateInput(value)
    if (!date) return
    setCalendarInputDate(value)
    onWeekChange(getWeekStart(date))
  }

  const weekLabel = formatWeekRangeLabel(weekDates[0], weekDates[6])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {toolbarAction && (
            <div className="flex shrink-0 justify-end">{toolbarAction}</div>
          )}
          <div className="w-full sm:w-48">
            <DatePickerInput value={calendarInputDate} onValueChange={goToDate} className="h-9" />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={goToPrevWeek} aria-label="Semana anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={goToNextWeek} aria-label="Proxima semana">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-950/5">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            {/* Day headers */}
            <div className="grid grid-cols-[5.5rem_repeat(7,minmax(7.5rem,1fr))] border-b border-slate-200 bg-slate-50">
              <div className="sticky left-0 z-20 flex items-center gap-2 border-r border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                Hora
              </div>
              {weekDates.map((date) => {
                const { weekday, day } = formatWeekDayHeader(date)
                const today = isToday(date)
                const working = isWorkingDay(date, profileAvailability)

                return (
                  <div
                    key={toDateInputValue(date)}
                    className={cn(
                      'border-r border-slate-200 px-3 py-3 last:border-r-0',
                      today && working && 'bg-blue-50/70',
                      !working && 'bg-slate-100/60',
                    )}
                  >
                    <p
                      className={cn(
                        'text-xs font-semibold uppercase tracking-wide',
                        today && working ? 'text-primary' : !working ? 'text-slate-400' : 'text-slate-500',
                      )}
                    >
                      {weekday}
                    </p>
                    <p
                      className={cn(
                        'mt-0.5 text-sm font-bold',
                        today && working ? 'text-primary' : !working ? 'text-slate-400' : 'text-slate-950',
                      )}
                    >
                      {day}
                    </p>
                    {!working && (
                      <p className="mt-0.5 text-[10px] font-medium text-slate-400">Folga</p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Time grid body */}
            <div className="relative" style={{ height: `${gridBodyHeight}px` }}>
              {/* Background: time labels + grid lines */}
              <div className="absolute inset-0 grid grid-cols-[5.5rem_repeat(7,minmax(7.5rem,1fr))]">
                {/* Time label column */}
                <div className="sticky left-0 z-10 border-r border-slate-200 bg-white">
                  {slots.map((slot) => (
                    <div
                      key={slot}
                      className="flex items-start border-b border-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400 last:border-b-0"
                      style={{ height: `${SLOT_HEIGHT_PX}px` }}
                    >
                      {minutesToTime(slot)}
                    </div>
                  ))}
                </div>

                {/* Day background columns */}
                {weekDates.map((date) => {
                  const today = isToday(date)
                  const working = isWorkingDay(date, profileAvailability)
                  return (
                    <div
                      key={toDateInputValue(date)}
                      className={cn(
                        'border-r border-slate-100 last:border-r-0',
                        today && working ? 'bg-blue-50/25' : !working ? 'bg-slate-50/70' : 'bg-white',
                      )}
                    >
                      {slots.map((slot) => (
                        <div
                          key={slot}
                          className="border-b border-slate-100 last:border-b-0"
                          style={{ height: `${SLOT_HEIGHT_PX}px` }}
                        />
                      ))}
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
                  <div
                    key={toDateInputValue(date)}
                    className="pointer-events-auto relative"
                  >
                    {dayAppts.map((appt) => {
                      const startMin = wallTimeToMinutes(appt.startTime)
                      const top = (startMin - firstSlotMinutes) * PX_PER_MINUTE
                      const height = Math.max(appt.durationMinutes * PX_PER_MINUTE, SLOT_HEIGHT_PX / 2)
                      const leftPct = (appt.colIndex / appt.colCount) * 100
                      const widthPct = 100 / appt.colCount

                      return (
                        <AppointmentCard
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
          </div>
        </div>
      </div>
    </div>
  )
}

function AppointmentCard({
  appointment,
  style,
  onClick,
}: {
  appointment: Appointment
  style: CSSProperties
  onClick: (appointment: Appointment) => void
}) {
  const isShort = appointment.durationMinutes < 30

  return (
    <button
      type="button"
      onClick={() => onClick(appointment)}
      style={style}
      className={cn(
        'absolute overflow-hidden rounded-md border px-2 py-1 text-left shadow-sm transition hover:shadow-md hover:z-10 focus:outline-none focus:ring-2 focus:ring-primary/20',
        STATUS_COLORS[appointment.status],
      )}
    >
      <div className="flex items-baseline justify-between gap-1">
        <span className="truncate text-xs font-bold leading-tight">
          {appointment.patientName}
        </span>
        <span className="shrink-0 text-[10px] font-semibold opacity-70">
          {formatWallTime(appointment.startTime)}
        </span>
      </div>
      {!isShort && (
        <p className="mt-0.5 truncate text-[11px] font-medium opacity-75">
          {appointment.service?.name ?? appointment.profile.displayName}
        </p>
      )}
    </button>
  )
}

function computeDayLayout(appointments: Appointment[]): PositionedAppointment[] {
  if (appointments.length === 0) return []

  return appointments.map((appt) => {
    const concurrent = appointments.filter((other) =>
      appt.startTime < other.endTime && other.startTime < appt.endTime,
    )
    const colCount = concurrent.length
    const colIndex = concurrent.indexOf(appt)
    return { ...appt, colIndex, colCount }
  })
}

function isWorkingDay(date: Date, profileAvailability?: Availability[]): boolean {
  if (!profileAvailability || profileAvailability.length === 0) return true
  const dow = date.getDay()
  return profileAvailability.some((a) => a.dayOfWeek === dow && a.isActive)
}

function buildTimeSlots(
  visibleAppointments: Appointment[],
  profileAvailability?: Availability[],
): number[] {
  const activeSlots = profileAvailability?.filter((a) => a.isActive) ?? []

  let minMinutes: number
  let maxMinutes: number

  if (activeSlots.length > 0) {
    minMinutes = Math.min(...activeSlots.map((s) => wallTimeToMinutes(s.startTime)))
    maxMinutes = Math.max(...activeSlots.map((s) => wallTimeToMinutes(s.endTime)))
  } else {
    minMinutes = DEFAULT_START_MINUTES
    maxMinutes = DEFAULT_END_MINUTES
  }

  for (const appt of visibleAppointments) {
    const start = wallTimeToMinutes(appt.startTime)
    const end = wallTimeToMinutes(appt.endTime)
    if (start < minMinutes) minMinutes = Math.floor(start / SLOT_MINUTES) * SLOT_MINUTES
    if (end > maxMinutes) maxMinutes = Math.ceil(end / SLOT_MINUTES) * SLOT_MINUTES
  }

  const start = Math.floor(minMinutes / SLOT_MINUTES) * SLOT_MINUTES
  const end = Math.ceil(maxMinutes / SLOT_MINUTES) * SLOT_MINUTES

  return Array.from(
    { length: Math.max(1, (end - start) / SLOT_MINUTES + 1) },
    (_, i) => start + i * SLOT_MINUTES,
  )
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
