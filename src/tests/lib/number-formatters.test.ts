import {
  formatCurrencyBR,
  formatCurrencyBRL,
  formatCurrencyBRLCents,
} from '@/lib/number-formatters'

describe('formatCurrencyBRLCents', () => {
  it.each([
    [0, 'R$ 0,00'],
    [1, 'R$ 0,01'],
    [123456, 'R$ 1.234,56'],
    [-1250, '-R$ 12,50'],
  ])('formats %s cents without treating them as reais', (value, expected) => {
    expect(formatCurrencyBRLCents(value)).toBe(expected)
  })
})

describe('formatCurrencyBR', () => {
  it('formats a positive number as BRL currency', () => {
    expect(formatCurrencyBR(1234.5)).toBe('R$ 1.234,50')
  })

  it('returns null for null', () => {
    expect(formatCurrencyBR(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(formatCurrencyBR(undefined)).toBeNull()
  })

  it('formats zero', () => {
    expect(formatCurrencyBR(0)).toBe('R$ 0,00')
  })
})

describe('formatCurrencyBRL', () => {
  it('formats a valid number', () => {
    expect(formatCurrencyBRL(10)).toBe('R$ 10,00')
  })

  it('returns the default fallback for null', () => {
    expect(formatCurrencyBRL(null)).toBe('R$ 0,00')
  })

  it('returns a custom fallback for undefined', () => {
    expect(formatCurrencyBRL(undefined, '—')).toBe('—')
  })
})
