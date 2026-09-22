/**
 * Brazilian data validators — pure, testable, no side effects.
 *
 * All validators accept masked or unmasked input.
 * Format functions produce user-facing masked strings.
 */

// ── Normalisation ─────────────────────────────────────────────────────────────

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '')
}

// ── CPF ───────────────────────────────────────────────────────────────────────

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export function isValidCPF(value: string): boolean {
  const d = normalizeDigits(value)
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number.parseInt(d[i]) * (10 - i)
  let rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  if (rem !== Number.parseInt(d[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += Number.parseInt(d[i]) * (11 - i)
  rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  return rem === Number.parseInt(d[10])
}

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export function formatCPF(value: string): string {
  const d = normalizeDigits(value).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// ── CNPJ ──────────────────────────────────────────────────────────────────────

export function isValidCNPJ(value: string): boolean {
  const d = normalizeDigits(value)
  if (d.length !== 14) return false
  if (/^(\d)\1{13}$/.test(d)) return false

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) sum += Number.parseInt(d[i]) * w1[i]
  let rem = sum % 11
  const d1 = rem < 2 ? 0 : 11 - rem
  if (d1 !== Number.parseInt(d[12])) return false

  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) sum += Number.parseInt(d[i]) * w2[i]
  rem = sum % 11
  const d2 = rem < 2 ? 0 : 11 - rem
  return d2 === Number.parseInt(d[13])
}

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export function formatCNPJ(value: string): string {
  const d = normalizeDigits(value).slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

// ── CPF or CNPJ ───────────────────────────────────────────────────────────────

export function isValidCpfOrCnpj(value: string): boolean {
  const d = normalizeDigits(value)
  if (d.length === 11) return isValidCPF(d)
  if (d.length === 14) return isValidCNPJ(d)
  return false
}

// ── CEP ───────────────────────────────────────────────────────────────────────

export function isValidCEP(value: string): boolean {
  return normalizeDigits(value).length === 8
}

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export function formatCEP(value: string): string {
  const d = normalizeDigits(value).slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

// ── UF ────────────────────────────────────────────────────────────────────────

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export const VALID_UFS = new Set([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
])

export function isValidUF(value: string): boolean {
  return VALID_UFS.has(value.trim().toUpperCase())
}

// ── Brazilian phone ───────────────────────────────────────────────────────────

// Valid Brazilian DDD codes (area codes).
const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
])

export function isValidBrazilianPhone(value: string): boolean {
  let d = normalizeDigits(value)

  // Strip optional country code +55 or 55
  if ((d.startsWith('55') && d.length > 11) || d.startsWith('0055')) {
    d = d.startsWith('0055') ? d.slice(4) : d.slice(2)
  }

  // 0800: 0800 + 7 digits = 11 digits total — treated separately
  if (d.startsWith('0800') && d.length === 11) {
    return !/^(\d)\1{10}$/.test(d)
  }

  if (d.length < 10 || d.length > 11) return false
  if (/^(\d)\1+$/.test(d)) return false

  const ddd = Number.parseInt(d.slice(0, 2), 10)
  if (!VALID_DDDS.has(ddd)) return false

  const number = d.slice(2)

  if (d.length === 11) {
    // Mobile: 9th-digit prefix required
    if (number[0] !== '9') return false
    if (/^(\d)\1+$/.test(number)) return false
    return true
  }

  // Landline: first digit 2–8
  const first = Number.parseInt(number[0], 10)
  if (first < 2 || first > 8) return false
  if (/^(\d)\1+$/.test(number)) return false
  return true
}

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export function formatBrazilianPhone(value: string): string {
  const d = normalizeDigits(value).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
