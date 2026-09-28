import { describe, expect, it } from 'vitest'

import {
  PASSWORD_MAX_LENGTH,
  getPasswordRequirements,
  meetsPasswordPolicy,
} from '@/lib/validators/password'

describe('meetsPasswordPolicy', () => {
  it('accepts a password with every required character class', () => {
    expect(meetsPasswordPolicy('Abcdef1!')).toBe(true)
  })

  it('rejects a password one character below the minimum', () => {
    expect(meetsPasswordPolicy('Abcde1!')).toBe(false)
  })

  it('accepts a password at the 72-character maximum and rejects one above it', () => {
    const atMax = `Aa1!${'x'.repeat(PASSWORD_MAX_LENGTH - 4)}`
    expect(atMax).toHaveLength(PASSWORD_MAX_LENGTH)
    expect(meetsPasswordPolicy(atMax)).toBe(true)
    expect(meetsPasswordPolicy(`${atMax}x`)).toBe(false)
  })

  it.each([
    ['no uppercase letter', 'abcdef1!'],
    ['no lowercase letter', 'ABCDEF1!'],
    ['no digit', 'Abcdefg!'],
    ['no special character', 'Abcdefg1'],
    ['empty', ''],
  ])('rejects a password with %s', (_case, password) => {
    expect(meetsPasswordPolicy(password)).toBe(false)
  })
})

describe('getPasswordRequirements', () => {
  it('reports which requirements a password meets', () => {
    const requirements = getPasswordRequirements('abcdefgh')
    expect(requirements.filter((requirement) => requirement.met).map((r) => r.label)).toEqual([
      'Mínimo de 8 caracteres',
      'Letra minúscula (a–z)',
    ])
  })
})
