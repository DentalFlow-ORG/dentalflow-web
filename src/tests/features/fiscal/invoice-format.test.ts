import { describe, expect, it } from 'vitest'

import { formatCents, formatInvoiceDate } from '@/features/fiscal/utils/invoice-format'

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
