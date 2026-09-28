import { isValidBrazilianPhone, normalizeDigits } from '@/lib/validators/br'

// Brazilian numbers are persisted as 10–11 digits (DDD + number). A pasted
// international form such as "+55 11 98765-4321" carries the country code,
// which is dropped so the local number is kept instead of being truncated.
//
// "55" alone is not proof of a country code: it is also the DDD of Rio Grande
// do Sul, and masks re-run this on every keystroke. The prefix is only treated
// as a country code when the input is explicitly international ("+" or "00")
// or is a full 13-digit number (55 + DDD + 9 digits). Anything else keeps the
// leading digits and drops the overflow, so an extra keystroke can never turn
// a DDD 55 number into a different valid-looking one.
function stripBrazilCountryCode(raw: string, digits: string) {
  const isInternational = /^\s*(\+|00)/.test(raw)
  if (isInternational && digits.startsWith('0055')) return digits.slice(4)
  if (digits.startsWith('55') && (isInternational || digits.length === 13)) {
    return digits.slice(2)
  }
  return digits
}

export function normalizePhoneBR(value: string | null | undefined) {
  const raw = value ?? ''
  return stripBrazilCountryCode(raw, normalizeDigits(raw)).slice(0, 11)
}

export function formatPhoneBR(value: string) {
  const digits = normalizePhoneBR(value)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/** Formats canonical or legacy Brazilian contacts without truncating unfamiliar snapshots. */
export function displayPhoneBR(value: string) {
  const digits = stripBrazilCountryCode(value, normalizeDigits(value))
  return digits.length === 10 || digits.length === 11 ? formatPhoneBR(digits) : value
}

export function formatCpfCnpjBR(value: string) {
  const digits = normalizeDigits(value).slice(0, 14)

  if (digits.length <= 11) {
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

export function formatCepBR(value: string) {
  const digits = normalizeDigits(value).slice(0, 8)

  if (digits.length <= 5) return digits

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function formatUf(value: string) {
  return value
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase()
}

export function formatDecimalInput(value: string) {
  return value.replace(/[^\d,.]/g, '').replace(/([,.].*)[,.]/g, '$1')
}

// WhatsApp needs a reachable DDD number: toll-free 0800 lines are rejected.
export function isValidWhatsappPhoneBR(value: string): boolean {
  const digits = normalizePhoneBR(value)
  return !digits.startsWith('0') && isValidBrazilianPhone(digits)
}

export const WHATSAPP_PHONE_REQUIRED_MESSAGE = 'Informe um telefone com WhatsApp válido.'

export function isValidPersonName(value: string): boolean {
  return /^[\p{L}\s.'-]+$/u.test(value.trim())
}
