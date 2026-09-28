import { describe, expect, it } from 'vitest'

import {
  validateClinicName,
  validateResponsibleName,
} from '@/features/auth/utils/registration-validation'

describe('validateClinicName', () => {
  it.each(['Odonto Saúde', "Clínica D'Ávila 2", 'Sorriso-Vida Ltda.'])('accepts %j', (name) => {
    expect(validateClinicName(name)).toBeNull()
  })

  it('requires at least 2 characters after trimming', () => {
    expect(validateClinicName('  A  ')).toBe('Informe o nome da clínica.')
    expect(validateClinicName('AB')).toBeNull()
  })

  it('accepts 100 characters and rejects 101', () => {
    expect(validateClinicName('a'.repeat(100))).toBeNull()
    expect(validateClinicName('a'.repeat(101))).toBe(
      'O nome da clínica deve ter no máximo 100 caracteres.',
    )
  })

  it.each(['Sorriso & Cia', 'Clínica/Odonto', 'Odonto @ Centro'])(
    'rejects characters the API refuses: %j',
    (name) => {
      expect(validateClinicName(name)).toBe(
        'O nome da clínica deve conter apenas letras, números, espaços, apóstrofos, pontos e hífens.',
      )
    },
  )
})

describe('validateResponsibleName', () => {
  it('accepts a first and last name', () => {
    expect(validateResponsibleName('Ana Maria Martins')).toBeNull()
  })

  it('asks for a surname when only one word is given', () => {
    expect(validateResponsibleName('Ana')).toBe('Informe nome e sobrenome do responsável.')
  })

  it('explains invalid characters instead of asking for a surname', () => {
    expect(validateResponsibleName('Ana M4rtins')).toBe(
      'O nome do responsável não pode conter números ou caracteres especiais.',
    )
  })

  it('rejects a one-letter first name, which the API refuses', () => {
    expect(validateResponsibleName('A Silva')).toBe(
      'O primeiro nome do responsável deve ter pelo menos 2 letras.',
    )
  })

  it('rejects a one-letter surname', () => {
    expect(validateResponsibleName('Ana S')).toBe(
      'O sobrenome do responsável deve ter pelo menos 2 letras.',
    )
  })

  it('accepts 50-character name parts and rejects 51', () => {
    expect(validateResponsibleName(`${'a'.repeat(50)} ${'b'.repeat(50)}`)).toBeNull()
    expect(validateResponsibleName(`${'a'.repeat(51)} Silva`)).toBe(
      'O primeiro nome do responsável deve ter no máximo 50 caracteres.',
    )
    expect(validateResponsibleName(`Ana ${'b'.repeat(51)}`)).toBe(
      'O sobrenome do responsável deve ter no máximo 50 caracteres.',
    )
  })
})
