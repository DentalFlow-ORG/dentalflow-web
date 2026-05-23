export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function normalizePhoneBR(value: string | null | undefined) {
  return onlyDigits(value ?? '')
}

export function formatPhoneBR(value: string) {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatCpfCnpjBR(value: string) {
  const digits = onlyDigits(value).slice(0, 14)

  if (digits.length <= 11) {
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

export function formatCepBR(value: string) {
  const digits = onlyDigits(value).slice(0, 8)

  if (digits.length <= 5) return digits

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function formatUf(value: string) {
  return value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
}

export function formatSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function formatDecimalInput(value: string) {
  return value.replace(/[^\d,.]/g, '').replace(/([,.].*)[,.]/g, '$1')
}

export function isValidPhoneBR(value: string): boolean {
  const digits = onlyDigits(value)
  return digits.length >= 10 && digits.length <= 11
}

export function isValidWhatsappPhoneBR(value: string): boolean {
  return isValidPhoneBR(value)
}

export const WHATSAPP_PHONE_REQUIRED_MESSAGE =
  'Informe um telefone com WhatsApp válido.'

export function isValidPersonName(value: string): boolean {
  return /^[\p{L}\s.'-]+$/u.test(value.trim())
}

export function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}
