import {
  displayDateToIso,
  isoToDisplayDate,
  maskDateInput,
  parseIsoDateInput,
} from '@/lib/date-time-input'

describe('isoToDisplayDate', () => {
  it('converts a valid ISO date to dd/mm/yyyy', () => {
    expect(isoToDisplayDate('2026-01-15')).toBe('15/01/2026')
  })

  it('returns empty string for a malformed value', () => {
    expect(isoToDisplayDate('15/01/2026')).toBe('')
  })

  it('returns empty string for an empty value', () => {
    expect(isoToDisplayDate('')).toBe('')
  })
})

describe('displayDateToIso', () => {
  it('converts a valid dd/mm/yyyy date to ISO', () => {
    expect(displayDateToIso('15/01/2026')).toBe('2026-01-15')
  })

  it('returns null for a malformed value', () => {
    expect(displayDateToIso('2026-01-15')).toBeNull()
  })

  it('returns null when the year is below the minimum', () => {
    expect(displayDateToIso('15/01/1899')).toBeNull()
  })

  it('returns null when the year is above the maximum', () => {
    expect(displayDateToIso('15/01/2101')).toBeNull()
  })

  it('clamps an out-of-range day to the last day of the month', () => {
    // February 2026 has 28 days
    expect(displayDateToIso('30/02/2026')).toBe('2026-02-28')
  })

  it('pads single-digit values', () => {
    expect(displayDateToIso('05/03/2026')).toBe('2026-03-05')
  })
})

describe('maskDateInput', () => {
  it('returns empty string for empty input', () => {
    expect(maskDateInput('')).toBe('')
  })

  it('passes through partial day digits (<2)', () => {
    expect(maskDateInput('3')).toBe('3')
  })

  it('clamps a day above 31', () => {
    expect(maskDateInput('35')).toBe('31')
  })

  it('passes through partial month digits (<2)', () => {
    expect(maskDateInput('151')).toBe('15/1')
  })

  it('clamps a month above 12', () => {
    expect(maskDateInput('1513')).toBe('15/12')
  })

  it('clamps day to the max days of the entered month once month is complete', () => {
    // Feb (02) -> max day is capped using year 2000 default (leap year, 29 days)
    expect(maskDateInput('3002')).toBe('29/02')
  })

  it('passes through partial year digits (<4)', () => {
    expect(maskDateInput('15012')).toBe('15/01/2')
  })

  it('clamps a full date with a low year to MIN_YEAR', () => {
    expect(maskDateInput('15011899')).toBe('15/01/1900')
  })

  it('clamps a full date with a high year to MAX_YEAR', () => {
    expect(maskDateInput('15012101')).toBe('15/01/2100')
  })

  it('formats a fully valid date', () => {
    expect(maskDateInput('15012026')).toBe('15/01/2026')
  })

  it('truncates input beyond 8 digits', () => {
    expect(maskDateInput('150120269999')).toBe('15/01/2026')
  })

  it('recomputes the max day using the completed year (non-leap year Feb)', () => {
    // Year 2027 is not a leap year, so Feb max day is 28
    expect(maskDateInput('29022027')).toBe('28/02/2027')
  })
})

describe('parseIsoDateInput', () => {
  it('parses a valid ISO date into a local Date', () => {
    const date = parseIsoDateInput('2026-01-15')
    expect(date).not.toBeNull()
    expect(date?.getFullYear()).toBe(2026)
    expect(date?.getMonth()).toBe(0)
    expect(date?.getDate()).toBe(15)
  })

  it('returns null for a malformed value', () => {
    expect(parseIsoDateInput('15/01/2026')).toBeNull()
  })
})
