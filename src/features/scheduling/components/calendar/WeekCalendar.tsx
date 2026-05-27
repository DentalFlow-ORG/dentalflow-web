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
import type {
  Appointment,
  Availability,
  AvailabilityException,
} from '../../types/scheduling.types'
import { STATUS_COLORS } from '../../constants/appointment-display'

type WeekCalendarProps = {
  appointments: Appointment[]
  weekStart: Date
  profileAvailability?: Availability[]
  profileExceptions?: AvailabilityException[]
  toolbarAction?: ReactNode
  onWeekChange: (weekStart: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
}

const DEFAULT_START_MINUTES = wallTimeToMinutes(BUSINESS_START_TIME)
const DEFAULT_END_MINUTES = wallTimeToMinutes(BUSINESS_END_TIME)
const SLOT_MINUTES = 30
const SLOT_HEIGHT_PX = 80
const PX_PER_MINUTE = SLOT_HEIGHT_PX / SLOT_MINUTES


type PositionedAppointment = Appointment & {
  colIndex: number
  colCount: number
}

type WorkingRange = {
  start: number
  end: number
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
    () =>
      buildTimeSlots(
        visibleAppointments,
        weekDates,
        profileAvailability,
        profileExceptions,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleAppointments, weekStart, profileAvailability, profileExceptions],
  )
  const firstSlotMinutes = slots[0]
  const gridBodyHeight = slots.length * SLOT_HEIGHT_PX

  // Pre-compute per-day positioned appointments
  const dayLayouts = useMemo(() => {
    return weekDates.map((date) => {
      const dateStr = toDateInputValue(date)
      const dayAppointments = visibleAppointments
        .filter((appt) => isoDateToString(appt.appointmentDate) === dateStr)
        .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
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
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={goToNextWeek} aria-label="Próxima semana">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm shadow-black/5">
        {/* Mobile scroll hint — only visible on small screens */}
        <div className="flex items-center justify-end gap-1.5 border-b border-border px-3 py-1.5 lg:hidden">
          <span className="text-[11px] text-muted-foreground">Arraste para ver sábado e domingo</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="relative overflow-x-auto">
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
                        title={`Horario especial: ${dayStatus.timeRange}`}
                      >
                        Especial: {dayStatus.timeRange}
                      </p>
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
                          >
                          </div>
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
                  <div
                    key={toDateInputValue(date)}
                    className="pointer-events-auto relative"
                  >
                    {dayAppts.map((appt) => {
                      const startMin = wallTimeToMinutes(appt.startTime ?? '')
                      const top = (startMin - firstSlotMinutes) * PX_PER_MINUTE
                      const height = Math.max((appt.durationMinutes ?? 30) * PX_PER_MINUTE, SLOT_HEIGHT_PX / 2)
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
  const isShort = (appointment.durationMinutes ?? 30) < 30

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
          {appointment.service?.name ?? appointment.profile?.displayName ?? 'Profissional'}
        </p>
      )}
    </button>
  )
}

function computeDayLayout(appointments: Appointment[]): PositionedAppointment[] {
  if (appointments.length === 0) return []

  return appointments.map((appt) => {
    const concurrent = appointments.filter((other) =>
      (appt.startTime ?? '') < (other.endTime ?? '') &&
        (other.startTime ?? '') < (appt.endTime ?? ''),
    )
    const colCount = concurrent.length
    const colIndex = concurrent.indexOf(appt)
    return { ...appt, colIndex, colCount }
  })
}

function getDayStatus(
  date: Date,
  profileAvailability?: Availability[],
  profileExceptions?: AvailabilityException[],
): {
  isWorking: boolean
  kind: 'working' | 'dayOff' | 'special'
  reason: string | null
  timeRange: string | null
} {
  const dateValue = toDateInputValue(date)
  const exception = profileExceptions?.find(
    (item) => isoDateToString(item.exceptionDate) === dateValue,
  )

  if (exception) {
    const specialStartTime = exception.isDayOff ? null : exception.startTime
    const specialEndTime = exception.isDayOff ? null : exception.endTime
    const hasSpecialHours = Boolean(specialStartTime && specialEndTime)

    return {
      isWorking: !exception.isDayOff,
      kind: hasSpecialHours ? 'special' : exception.isDayOff ? 'dayOff' : 'working',
      reason: exception.reason,
      timeRange: specialStartTime && specialEndTime
        ? `${formatWallTime(specialStartTime)} - ${formatWallTime(specialEndTime)}`
        : null,
    }
  }

  if (!profileAvailability || profileAvailability.length === 0) {
    return { isWorking: true, kind: 'working', reason: null, timeRange: null }
  }

  const dow = date.getDay()
  const isWorking = profileAvailability.some((a) => a.dayOfWeek === dow && a.isActive)

  return {
    isWorking,
    kind: isWorking ? 'working' : 'dayOff',
    reason: null,
    timeRange: null,
  }
}

function buildTimeSlots(
  visibleAppointments: Appointment[],
  weekDates: Date[],
  profileAvailability?: Availability[],
  profileExceptions?: AvailabilityException[],
): number[] {
  const activeSlots = profileAvailability?.filter((a) => a.isActive) ?? []
  const weekDateValues = new Set(weekDates.map(toDateInputValue))
  const specialExceptions =
    profileExceptions?.filter(
      (e) =>
        !e.isDayOff &&
        e.startTime &&
        e.endTime &&
        weekDateValues.has(isoDateToString(e.exceptionDate)),
    ) ?? []

  let minMinutes: number
  let maxMinutes: number

  if (activeSlots.length > 0) {
    minMinutes = Math.min(...activeSlots.map((s) => wallTimeToMinutes(s.startTime)))
    maxMinutes = Math.max(...activeSlots.map((s) => wallTimeToMinutes(s.endTime)))
  } else {
    minMinutes = DEFAULT_START_MINUTES
    maxMinutes = DEFAULT_END_MINUTES
  }

  for (const exception of specialExceptions) {
    if (!exception.startTime || !exception.endTime) continue

    const start = wallTimeToMinutes(exception.startTime)
    const end = wallTimeToMinutes(exception.endTime)
    if (start < minMinutes) minMinutes = Math.floor(start / SLOT_MINUTES) * SLOT_MINUTES
    if (end > maxMinutes) maxMinutes = Math.ceil(end / SLOT_MINUTES) * SLOT_MINUTES
  }

  for (const appt of visibleAppointments) {
    const start = wallTimeToMinutes(appt.startTime ?? '')
    const end = wallTimeToMinutes(appt.endTime ?? '')
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

function getDayWorkingRanges(
  date: Date,
  profileAvailability?: Availability[],
  profileExceptions?: AvailabilityException[],
): WorkingRange[] {
  const dateValue = toDateInputValue(date)
  const exception = profileExceptions?.find(
    (item) => isoDateToString(item.exceptionDate) === dateValue,
  )

  if (exception?.isDayOff) return []

  if (exception?.startTime && exception.endTime) {
    return [
      {
        start: wallTimeToMinutes(exception.startTime),
        end: wallTimeToMinutes(exception.endTime),
      },
    ]
  }

  const activeDaySlots =
    profileAvailability?.filter((slot) => slot.isActive && slot.dayOfWeek === date.getDay()) ??
    []

  if (activeDaySlots.length > 0) {
    return activeDaySlots.map((slot) => ({
      start: wallTimeToMinutes(slot.startTime),
      end: wallTimeToMinutes(slot.endTime),
    }))
  }

  if (profileAvailability && profileAvailability.length > 0) {
    return []
  }

  return [{ start: DEFAULT_START_MINUTES, end: DEFAULT_END_MINUTES }]
}

function isSlotInsideWorkingRanges(slot: number, workingRanges: WorkingRange[]) {
  return workingRanges.some((range) => slot >= range.start && slot <= range.end)
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
