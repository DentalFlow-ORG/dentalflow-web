import { describe, expect, it } from 'vitest'

import {
  parseQuantityInput,
  quantityToInput,
  sanitizeQuantityInput,
} from '@/features/inventory/utils/quantity-input'

describe('sanitizeQuantityInput', () => {
  it.each([
    ['12', '12'],
    ['1,5', '1,5'],
    ['1.5', '1,5'],
    ['-3', '3'],
    ['1e5', '15'],
    ['2,12345', '2,123'],
    ['1,2,3', '1,23'],
    ['12345678', '1234567'],
    ['abc', ''],
  ])('turns %j into %j', (typed, expected) => {
    expect(sanitizeQuantityInput(typed)).toBe(expected)
  })
})

describe('parseQuantityInput', () => {
  it('returns null for an empty field instead of zero', () => {
    expect(parseQuantityInput('')).toBeNull()
    expect(parseQuantityInput('  ')).toBeNull()
  })

  it('parses zero and decimal comma values', () => {
    expect(parseQuantityInput('0')).toBe(0)
    expect(parseQuantityInput('2,5')).toBe(2.5)
  })

  it('rejects a lone separator and negative values', () => {
    expect(parseQuantityInput(',')).toBeNull()
    expect(parseQuantityInput('-1')).toBeNull()
  })
})

describe('quantityToInput', () => {
  it('uses the Brazilian decimal comma', () => {
    expect(quantityToInput(2.5)).toBe('2,5')
    expect(quantityToInput(3)).toBe('3')
  })
})
