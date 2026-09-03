import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatShortDate,
} from '@/features/finance/utils/finance-format'

describe('formatCurrency', () => {
  it('formats a numeric value', () => {
    expect(formatCurrency(1234.5)).toBe('R$ 1.234,50')
  })

  it('formats a string value', () => {
    expect(formatCurrency('1000')).toBe('R$ 1.000,00')
  })
})

describe('formatCompactCurrency', () => {
  it('formats a large value in compact notation', () => {
    expect(formatCompactCurrency(1500)).toContain('mil')
  })
})

describe('formatDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatDate('2026-06-15')).toBe('15/06/2026')
  })
})

describe('formatShortDate', () => {
  it('returns the first 5 characters (dd/mm) of a valid date', () => {
    expect(formatShortDate('2026-06-15')).toBe('15/06')
  })

  it('returns a fallback message when the date is invalid/empty', () => {
    expect(formatShortDate('')).toBe('Data não informada')
  })
})
