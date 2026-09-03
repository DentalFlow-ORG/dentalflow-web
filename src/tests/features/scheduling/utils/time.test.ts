import {
  BUSINESS_END_TIME,
  BUSINESS_START_TIME,
  formatAppointmentDate,
  formatAppointmentDateLong,
  formatWallTime,
  isoDateToString,
  toDateInputValue,
} from '@/features/scheduling/utils/time'

describe('BUSINESS_START_TIME / BUSINESS_END_TIME', () => {
  it('are the expected business-hours bounds', () => {
    expect(BUSINESS_START_TIME).toBe('08:00')
    expect(BUSINESS_END_TIME).toBe('18:00')
  })
})

describe('formatWallTime', () => {
  it('formats a valid time', () => {
    expect(formatWallTime('1970-01-01T14:00:00.000Z')).toBe('14:00')
  })

  it('returns the fallback for a null value', () => {
    expect(formatWallTime(null)).toBe('Hora não informada')
  })
})

describe('formatAppointmentDate', () => {
  it('formats a valid date', () => {
    expect(formatAppointmentDate('2026-06-15')).toBe('15/06/2026')
  })

  it('returns the fallback for a null value', () => {
    expect(formatAppointmentDate(null)).toBe('Data não informada')
  })
})

describe('formatAppointmentDateLong', () => {
  it('formats a valid date in long form', () => {
    const result = formatAppointmentDateLong('2026-06-15')
    expect(result.toLowerCase()).toContain('junho')
  })

  it('returns the fallback message for a null value', () => {
    expect(formatAppointmentDateLong(null)).toBe('Data não informada')
  })

  it('returns the fallback message for an unparsable value', () => {
    expect(formatAppointmentDateLong('not-a-date')).toBe('Data não informada')
  })
})

describe('isoDateToString', () => {
  it('extracts the date portion from an ISO datetime', () => {
    expect(isoDateToString('2026-06-15T00:00:00.000Z')).toBe('2026-06-15')
  })

  it('returns empty string for a null value', () => {
    expect(isoDateToString(null)).toBe('')
  })
})

describe('toDateInputValue', () => {
  it('formats a Date instance as YYYY-MM-DD', () => {
    expect(toDateInputValue(new Date(2026, 5, 15))).toBe('2026-06-15')
  })
})
