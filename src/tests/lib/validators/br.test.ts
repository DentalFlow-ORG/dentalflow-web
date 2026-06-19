import { describe, expect, it } from 'vitest'

import {
  VALID_UFS,
  formatBrazilianPhone,
  formatCEP,
  formatCNPJ,
  formatCPF,
  isValidBrazilianPhone,
  isValidCEP,
  isValidCNPJ,
  isValidCPF,
  isValidCpfOrCnpj,
  isValidUF,
  normalizeDigits,
} from '@/lib/validators/br'

// ── normalizeDigits ───────────────────────────────────────────────────────────

describe('normalizeDigits', () => {
  it('strips all non-digit characters', () => {
    expect(normalizeDigits('123.456.789-09')).toBe('12345678909')
  })
  it('returns empty string for empty input', () => {
    expect(normalizeDigits('')).toBe('')
  })
  it('leaves pure digits unchanged', () => {
    expect(normalizeDigits('12345')).toBe('12345')
  })
})

// ── isValidCPF ────────────────────────────────────────────────────────────────

describe('isValidCPF', () => {
  it('accepts a known-valid CPF (unmasked)', () => {
    expect(isValidCPF('12345678909')).toBe(true)
  })
  it('accepts a known-valid CPF (masked)', () => {
    expect(isValidCPF('123.456.789-09')).toBe(true)
  })
  it('rejects all-same-digit CPFs (000.000.000-00)', () => {
    expect(isValidCPF('00000000000')).toBe(false)
  })
  it('rejects all-same-digit CPFs (111.111.111-11)', () => {
    expect(isValidCPF('11111111111')).toBe(false)
  })
  it('rejects CPF with wrong first check digit', () => {
    expect(isValidCPF('12345678908')).toBe(false)
  })
  it('rejects CPF with wrong second check digit', () => {
    expect(isValidCPF('12345678900')).toBe(false)
  })
  it('rejects CPF shorter than 11 digits', () => {
    expect(isValidCPF('1234567890')).toBe(false)
  })
  it('rejects CPF longer than 11 digits', () => {
    expect(isValidCPF('123456789091')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidCPF('')).toBe(false)
  })
})

// ── isValidCNPJ ───────────────────────────────────────────────────────────────

describe('isValidCNPJ', () => {
  it('accepts a known-valid CNPJ (unmasked)', () => {
    expect(isValidCNPJ('11222333000181')).toBe(true)
  })
  it('accepts a known-valid CNPJ (masked)', () => {
    expect(isValidCNPJ('11.222.333/0001-81')).toBe(true)
  })
  it('rejects all-same-digit CNPJ (00000000000000)', () => {
    expect(isValidCNPJ('00000000000000')).toBe(false)
  })
  it('rejects all-same-digit CNPJ (11111111111111)', () => {
    expect(isValidCNPJ('11111111111111')).toBe(false)
  })
  it('rejects CNPJ with wrong first check digit', () => {
    expect(isValidCNPJ('11222333000182')).toBe(false)
  })
  it('rejects the commonly-used invalid test CNPJ 12.345.678/0001-90', () => {
    expect(isValidCNPJ('12345678000190')).toBe(false)
  })
  it('rejects CNPJ shorter than 14 digits', () => {
    expect(isValidCNPJ('1122233300018')).toBe(false)
  })
  it('rejects CNPJ longer than 14 digits', () => {
    expect(isValidCNPJ('112223330001811')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidCNPJ('')).toBe(false)
  })
})

// ── isValidCpfOrCnpj ─────────────────────────────────────────────────────────

describe('isValidCpfOrCnpj', () => {
  it('returns true for a valid CPF', () => {
    expect(isValidCpfOrCnpj('123.456.789-09')).toBe(true)
  })
  it('returns true for a valid CNPJ', () => {
    expect(isValidCpfOrCnpj('11.222.333/0001-81')).toBe(true)
  })
  it('returns false for an invalid CPF', () => {
    expect(isValidCpfOrCnpj('123.456.789-00')).toBe(false)
  })
  it('returns false for an invalid CNPJ', () => {
    expect(isValidCpfOrCnpj('12.345.678/0001-90')).toBe(false)
  })
  it('returns false for a 12-digit number (neither CPF nor CNPJ)', () => {
    expect(isValidCpfOrCnpj('123456789012')).toBe(false)
  })
  it('returns false for empty string', () => {
    expect(isValidCpfOrCnpj('')).toBe(false)
  })
})

// ── isValidCEP ────────────────────────────────────────────────────────────────

describe('isValidCEP', () => {
  it('accepts 8-digit CEP (unmasked)', () => {
    expect(isValidCEP('01310100')).toBe(true)
  })
  it('accepts 8-digit CEP (masked)', () => {
    expect(isValidCEP('01310-100')).toBe(true)
  })
  it('rejects CEP with fewer than 8 digits', () => {
    expect(isValidCEP('0131010')).toBe(false)
  })
  it('rejects CEP with more than 8 digits', () => {
    expect(isValidCEP('013101001')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidCEP('')).toBe(false)
  })
})

// ── isValidUF ─────────────────────────────────────────────────────────────────

describe('isValidUF', () => {
  it('accepts all 27 official UFs', () => {
    for (const uf of VALID_UFS) {
      expect(isValidUF(uf)).toBe(true)
    }
  })
  it('accepts lowercase input (case-insensitive)', () => {
    expect(isValidUF('sp')).toBe(true)
  })
  it('accepts padded input with spaces', () => {
    expect(isValidUF(' SP ')).toBe(true)
  })
  it('rejects a single letter', () => {
    expect(isValidUF('S')).toBe(false)
  })
  it('rejects an invalid two-letter code', () => {
    expect(isValidUF('XX')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidUF('')).toBe(false)
  })
  it('rejects a valid state name (not the abbreviation)', () => {
    expect(isValidUF('São Paulo')).toBe(false)
  })
  it('has exactly 27 entries', () => {
    expect(VALID_UFS.size).toBe(27)
  })
})

// ── isValidBrazilianPhone ─────────────────────────────────────────────────────

describe('isValidBrazilianPhone', () => {
  it('accepts a valid 11-digit mobile number (unmasked)', () => {
    expect(isValidBrazilianPhone('11987654321')).toBe(true)
  })
  it('accepts a valid mobile number (masked)', () => {
    expect(isValidBrazilianPhone('(11) 98765-4321')).toBe(true)
  })
  it('accepts a valid 10-digit landline', () => {
    expect(isValidBrazilianPhone('1132345678')).toBe(true)
  })
  it('accepts a valid landline (masked)', () => {
    expect(isValidBrazilianPhone('(11) 3234-5678')).toBe(true)
  })
  it('accepts with +55 country code prefix', () => {
    expect(isValidBrazilianPhone('+5511987654321')).toBe(true)
  })
  it('accepts with 55 country code prefix (13 digits)', () => {
    expect(isValidBrazilianPhone('5511987654321')).toBe(true)
  })
  it('accepts a valid 0800 number', () => {
    expect(isValidBrazilianPhone('08001234567')).toBe(true)
  })
  it('rejects a mobile number with invalid DDD (00)', () => {
    expect(isValidBrazilianPhone('00987654321')).toBe(false)
  })
  it('rejects a mobile number with invalid DDD (20)', () => {
    expect(isValidBrazilianPhone('20987654321')).toBe(false)
  })
  it('rejects an 11-digit number where mobile digit is not 9', () => {
    expect(isValidBrazilianPhone('11887654321')).toBe(false)
  })
  it('rejects a landline with first digit 0', () => {
    expect(isValidBrazilianPhone('1102345678')).toBe(false)
  })
  it('rejects a landline with first digit 9 (treated as mobile but too short)', () => {
    // 10-digit number with "9" first digit after DDD is considered a landline format
    // but first digit 9 in a landline is outside 2-8 range → invalid
    expect(isValidBrazilianPhone('1192345678')).toBe(false)
  })
  it('rejects all-same-digit number', () => {
    expect(isValidBrazilianPhone('11111111111')).toBe(false)
  })
  it('rejects number shorter than 10 digits', () => {
    expect(isValidBrazilianPhone('119876543')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidBrazilianPhone('')).toBe(false)
  })
})

// ── format functions ──────────────────────────────────────────────────────────

describe('formatCPF', () => {
  it('formats 11-digit CPF correctly', () => {
    expect(formatCPF('12345678909')).toBe('123.456.789-09')
  })
  it('formats partial input (6 digits)', () => {
    expect(formatCPF('123456')).toBe('123.456')
  })
})

describe('formatCNPJ', () => {
  it('formats 14-digit CNPJ correctly', () => {
    expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
  })
  it('formats partial input (8 digits)', () => {
    expect(formatCNPJ('11222333')).toBe('11.222.333')
  })
})

describe('formatCEP', () => {
  it('formats 8-digit CEP correctly', () => {
    expect(formatCEP('01310100')).toBe('01310-100')
  })
  it('formats partial input (4 digits)', () => {
    expect(formatCEP('0131')).toBe('0131')
  })
})

describe('formatBrazilianPhone', () => {
  it('formats 11-digit mobile correctly', () => {
    expect(formatBrazilianPhone('11987654321')).toBe('(11) 98765-4321')
  })
  it('formats 10-digit landline correctly', () => {
    expect(formatBrazilianPhone('1132345678')).toBe('(11) 3234-5678')
  })
})
