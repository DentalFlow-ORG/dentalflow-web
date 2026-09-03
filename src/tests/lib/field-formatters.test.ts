import {
  WHATSAPP_PHONE_REQUIRED_MESSAGE,
  formatCepBR,
  formatCpfCnpjBR,
  formatDecimalInput,
  formatPhoneBR,
  formatUf,
  isValidPersonName,
  isValidPhoneBR,
  isValidWhatsappPhoneBR,
  normalizePhoneBR,
  onlyDigits,
} from '@/lib/field-formatters'

describe('onlyDigits', () => {
  it('strips non-digit characters', () => {
    expect(onlyDigits('(11) 98765-4321')).toBe('11987654321')
  })

  it('returns empty string when there are no digits', () => {
    expect(onlyDigits('abc')).toBe('')
  })
})

describe('normalizePhoneBR', () => {
  it('strips formatting from a phone value', () => {
    expect(normalizePhoneBR('(11) 98765-4321')).toBe('11987654321')
  })

  it('returns empty string for null', () => {
    expect(normalizePhoneBR(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(normalizePhoneBR(undefined)).toBe('')
  })
})

describe('formatPhoneBR', () => {
  it('returns raw digits for up to 2 digits', () => {
    expect(formatPhoneBR('11')).toBe('11')
  })

  it('formats partial area code + prefix (<=6 digits)', () => {
    expect(formatPhoneBR('11987')).toBe('(11) 987')
  })

  it('formats an 8-digit landline-style number (<=10 digits)', () => {
    expect(formatPhoneBR('1133334444')).toBe('(11) 3333-4444')
  })

  it('formats an 11-digit mobile number', () => {
    expect(formatPhoneBR('11987654321')).toBe('(11) 98765-4321')
  })

  it('truncates input beyond 11 digits', () => {
    expect(formatPhoneBR('119876543219999')).toBe('(11) 98765-4321')
  })

  it('strips non-digit characters before formatting', () => {
    expect(formatPhoneBR('(11) 98765-4321')).toBe('(11) 98765-4321')
  })
})

describe('formatCpfCnpjBR', () => {
  it('returns raw digits for up to 3 digits', () => {
    expect(formatCpfCnpjBR('123')).toBe('123')
  })

  it('formats up to 6 digits', () => {
    expect(formatCpfCnpjBR('123456')).toBe('123.456')
  })

  it('formats up to 9 digits', () => {
    expect(formatCpfCnpjBR('123456789')).toBe('123.456.789')
  })

  it('formats a full CPF (11 digits)', () => {
    expect(formatCpfCnpjBR('12345678901')).toBe('123.456.789-01')
  })

  it('formats a 12-digit CNPJ-in-progress value', () => {
    expect(formatCpfCnpjBR('123456789012')).toBe('12.345.678/9012')
  })

  it('formats a full CNPJ (14 digits)', () => {
    expect(formatCpfCnpjBR('12345678000199')).toBe('12.345.678/0001-99')
  })

  it('truncates input beyond 14 digits', () => {
    expect(formatCpfCnpjBR('123456780001999999')).toBe('12.345.678/0001-99')
  })

  it('strips non-digit characters before formatting', () => {
    expect(formatCpfCnpjBR('123.456.789-01')).toBe('123.456.789-01')
  })
})

describe('formatCepBR', () => {
  it('returns raw digits for up to 5 digits', () => {
    expect(formatCepBR('12345')).toBe('12345')
  })

  it('formats a full CEP (8 digits)', () => {
    expect(formatCepBR('12345678')).toBe('12345-678')
  })

  it('truncates input beyond 8 digits', () => {
    expect(formatCepBR('123456789999')).toBe('12345-678')
  })
})

describe('formatUf', () => {
  it('uppercases and strips non-letters', () => {
    expect(formatUf('sp1')).toBe('SP')
  })

  it('truncates to 2 letters', () => {
    expect(formatUf('sao')).toBe('SA')
  })
})

describe('formatDecimalInput', () => {
  it('strips invalid characters', () => {
    expect(formatDecimalInput('12a3b,45')).toBe('123,45')
  })

  it('collapses a second separator into the first group', () => {
    expect(formatDecimalInput('12,345.67')).toBe('12,34567')
  })
})

describe('isValidPhoneBR / isValidWhatsappPhoneBR', () => {
  it('accepts a valid mobile number', () => {
    expect(isValidPhoneBR('11987654321')).toBe(true)
    expect(isValidWhatsappPhoneBR('11987654321')).toBe(true)
  })

  it('rejects an invalid number', () => {
    expect(isValidPhoneBR('123')).toBe(false)
    expect(isValidWhatsappPhoneBR('123')).toBe(false)
  })
})

describe('WHATSAPP_PHONE_REQUIRED_MESSAGE', () => {
  it('is a non-empty message', () => {
    expect(WHATSAPP_PHONE_REQUIRED_MESSAGE).toBe('Informe um telefone com WhatsApp válido.')
  })
})

describe('isValidPersonName', () => {
  it('accepts a name with accents and spaces', () => {
    expect(isValidPersonName('José da Silva')).toBe(true)
  })

  it('accepts a name with apostrophes and hyphens', () => {
    expect(isValidPersonName("D'Ávila-Souza")).toBe(true)
  })

  it('rejects a name containing digits', () => {
    expect(isValidPersonName('João123')).toBe(false)
  })

  it('rejects an empty/whitespace-only name', () => {
    expect(isValidPersonName('   ')).toBe(false)
  })
})
