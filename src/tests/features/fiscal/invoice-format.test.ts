import { describe, expect, it } from 'vitest'

import {
  formatCents,
  formatInvoiceDate,
  fromMoneyInput,
  toMoneyInput,
} from '@/features/fiscal/utils/invoice-format'

describe('formatCents', () => {
  it('formats 25000 as a BRL currency string with "250"', () => {
    const result = formatCents(25000)
    expect(result).toContain('250')
    expect(result).toContain('R$')
  })

  it('formats 0 as a zero BRL value', () => {
    const result = formatCents(0)
    expect(result).toContain('0')
  })
})

describe('formatInvoiceDate', () => {
  it('returns "-" for null', () => {
    expect(formatInvoiceDate(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatInvoiceDate(undefined)).toBe('-')
  })

  it('formats "2026-06-07" as "07/06/2026"', () => {
    expect(formatInvoiceDate('2026-06-07')).toBe('07/06/2026')
  })
})

describe('toMoneyInput', () => {
  it('converts 25000 cents to "250,00"', () => {
    expect(toMoneyInput(25000)).toBe('250,00')
  })

  it('converts 0 to ""', () => {
    expect(toMoneyInput(0)).toBe('')
  })

  it('converts 9 cents to "0,09"', () => {
    expect(toMoneyInput(9)).toBe('0,09')
  })
})

describe('fromMoneyInput', () => {
  it('parses "250,00" to 25000', () => {
    expect(fromMoneyInput('250,00')).toBe(25000)
  })

  it('parses "0,09" to 9', () => {
    expect(fromMoneyInput('0,09')).toBe(9)
  })

  it('returns 0 for empty string', () => {
    expect(fromMoneyInput('')).toBe(0)
  })

  it('returns 0 for non-numeric string', () => {
    expect(fromMoneyInput('abc')).toBe(0)
  })
})
