/**
 * E-mail rules shared by every form. The backend is authoritative: its DTOs
 * cap addresses at 254 characters (RFC 5321) and compare them trimmed and
 * lowercased, so the client mirrors that contract.
 */

export const EMAIL_MAX_LENGTH = 254

export const INVALID_EMAIL_MESSAGE = 'Informe um e-mail válido.'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function isValidEmail(value: string): boolean {
  const email = value.trim()
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email)
}
