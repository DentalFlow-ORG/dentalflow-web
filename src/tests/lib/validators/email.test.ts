import { describe, expect, it } from 'vitest'

import { EMAIL_MAX_LENGTH, isValidEmail, normalizeEmail } from '@/lib/validators/email'

describe('normalizeEmail', () => {
  it('trims and lowercases the address', () => {
    expect(normalizeEmail('  Ana.Martins@Clinica.COM.br ')).toBe('ana.martins@clinica.com.br')
  })
})

describe('isValidEmail', () => {
  it('accepts a regular address', () => {
    expect(isValidEmail('nome@exemplo.com')).toBe(true)
  })

  it('ignores surrounding whitespace', () => {
    expect(isValidEmail('  nome@exemplo.com  ')).toBe(true)
  })

  it.each(['', '   ', 'nome', 'nome@', 'nome@exemplo', '@exemplo.com', 'nome @exemplo.com'])(
    'rejects %j',
    (value) => {
      expect(isValidEmail(value)).toBe(false)
    },
  )

  it('accepts an address at the 254-character limit and rejects one above it', () => {
    const domain = '@exemplo.com'
    const atLimit = `${'a'.repeat(EMAIL_MAX_LENGTH - domain.length)}${domain}`

    expect(atLimit).toHaveLength(EMAIL_MAX_LENGTH)
    expect(isValidEmail(atLimit)).toBe(true)
    expect(isValidEmail(`a${atLimit}`)).toBe(false)
  })
})
