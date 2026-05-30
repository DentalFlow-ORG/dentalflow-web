import {
  BUSINESS_END_TIME,
  BUSINESS_START_TIME,
  formatWallTime,
  isoDateToString,
  toDateInputValue,
  wallTimeToMinutes,
} from './time'
import type { Appointment, Availability, AvailabilityException } from '../types/scheduling.types'

export const SLOT_MINUTES = 30
export const SLOT_HEIGHT_PX = 80
export const PX_PER_MINUTE = SLOT_HEIGHT_PX / SLOT_MINUTES
export const DEFAULT_START_MINUTES = wallTimeToMinutes(BUSINESS_START_TIME)
export const DEFAULT_END_MINUTES = wallTimeToMinutes(BUSINESS_END_TIME)

export type PositionedAppointment = Appointment & {
  colIndex: number
  colCount: number
}

export type WorkingRange = {
  start: number
  end: number
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function isSlotInsideWorkingRanges(slot: number, workingRanges: WorkingRange[]): boolean {
  return workingRanges.some((range) => slot >= range.start && slot <= range.end)
}

export function computeDayLayout(appointments: Appointment[]): PositionedAppointment[] {
  if (appointments.length === 0) return []

  return appointments.map((appt) => {
    const concurrent = appointments.filter(
      (other) =>
        (appt.startTime ?? '') < (other.endTime ?? '') &&
        (other.startTime ?? '') < (appt.endTime ?? ''),
    )
    const colCount = concurrent.length
    const colIndex = concurrent.indexOf(appt)
    return { ...appt, colIndex, colCount }
  })
}

export function getDayStatus(
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
      timeRange:
        specialStartTime && specialEndTime
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

export function getDayWorkingRanges(
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
    profileAvailability?.filter((slot) => slot.isActive && slot.dayOfWeek === date.getDay()) ?? []

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

export function buildTimeSlots(
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
