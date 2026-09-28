import { describe, expect, it } from 'vitest'

import {
  MONEY_INPUT_MAX_CENTS,
  centsToMoneyInput,
  formatMoneyInputFromDigits,
  parseMoneyInputToCents,
} from '@/lib/money-input'

describe('formatMoneyInputFromDigits', () => {
  it('returns "0,09" for "9"', () => {
    expect(formatMoneyInputFromDigits('9')).toBe('0,09')
  })

  it('returns "0,90" for "90"', () => {
    expect(formatMoneyInputFromDigits('90')).toBe('0,90')
  })

  it('returns "9,00" for "900"', () => {
    expect(formatMoneyInputFromDigits('900')).toBe('9,00')
  })

  it('returns "90,00" for "9000"', () => {
    expect(formatMoneyInputFromDigits('9000')).toBe('90,00')
  })

  it('returns "1.234,56" for "123456"', () => {
    expect(formatMoneyInputFromDigits('123456')).toBe('1.234,56')
  })

  it('strips non-digits from paste "R$ 1.234,56"', () => {
    expect(formatMoneyInputFromDigits('R$ 1.234,56')).toBe('1.234,56')
  })

  it('returns "" for empty string', () => {
    expect(formatMoneyInputFromDigits('')).toBe('')
  })

  it('returns "" for "abc"', () => {
    expect(formatMoneyInputFromDigits('abc')).toBe('')
  })

  it('returns "" for "0"', () => {
    expect(formatMoneyInputFromDigits('0')).toBe('')
  })

  it('accepts the default maximum of R$ 9.999.999,99', () => {
    expect(formatMoneyInputFromDigits(String(MONEY_INPUT_MAX_CENTS))).toBe('9.999.999,99')
  })

  it('ignores a digit typed after the default maximum', () => {
    expect(formatMoneyInputFromDigits('9.999.999,990')).toBe('9.999.999,99')
  })

  it('drops trailing digits until the value fits the maximum', () => {
    expect(formatMoneyInputFromDigits('1000000000')).toBe('1.000.000,00')
  })

  it('ignores leading zeros when applying the maximum', () => {
    expect(formatMoneyInputFromDigits('000123456')).toBe('1.234,56')
  })

  it('honours a caller-provided maximum', () => {
    expect(formatMoneyInputFromDigits('9999999999', 9_999_999_999)).toBe('99.999.999,99')
    expect(formatMoneyInputFromDigits('12345', 10_000)).toBe('12,34')
  })
})

describe('parseMoneyInputToCents', () => {
  it('parses "0,09" to 9', () => {
    expect(parseMoneyInputToCents('0,09')).toBe(9)
  })

  it('parses "0,90" to 90', () => {
    expect(parseMoneyInputToCents('0,90')).toBe(90)
  })

  it('parses "90,00" to 9000', () => {
    expect(parseMoneyInputToCents('90,00')).toBe(9000)
  })

  it('parses "1.234,56" to 123456', () => {
    expect(parseMoneyInputToCents('1.234,56')).toBe(123456)
  })

  it('returns 0 for empty string', () => {
    expect(parseMoneyInputToCents('')).toBe(0)
  })

  it('returns 0 for "abc"', () => {
    expect(parseMoneyInputToCents('abc')).toBe(0)
  })
})

describe('centsToMoneyInput', () => {
  it('formats 9 as "0,09"', () => {
    expect(centsToMoneyInput(9)).toBe('0,09')
  })

  it('formats 9000 as "90,00"', () => {
    expect(centsToMoneyInput(9000)).toBe('90,00')
  })

  it('formats 25000 as "250,00"', () => {
    expect(centsToMoneyInput(25000)).toBe('250,00')
  })

  it('formats 123456 as "1.234,56"', () => {
    expect(centsToMoneyInput(123456)).toBe('1.234,56')
  })

  it('returns "" for 0', () => {
    expect(centsToMoneyInput(0)).toBe('')
  })

  it('returns "" for null', () => {
    expect(centsToMoneyInput(null)).toBe('')
  })

  it('returns "" for undefined', () => {
    expect(centsToMoneyInput(undefined)).toBe('')
  })
})
