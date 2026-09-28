import { isValidPersonName } from '@/lib/field-formatters'

import { splitFullName } from './name'

/**
 * Registration rules mirrored from the API RegisterDto / CompleteProfileDto so
 * users get a pt-BR explanation before the request instead of a 400.
 */

const CLINIC_NAME_MIN_LENGTH = 2
export const CLINIC_NAME_MAX_LENGTH = 100
const NAME_PART_MIN_LENGTH = 2
const NAME_PART_MAX_LENGTH = 50
// First name + space + last name, each within the API limit.
export const RESPONSIBLE_NAME_MAX_LENGTH = NAME_PART_MAX_LENGTH * 2 + 1

// API SAFE_TEXT_PATTERN: letters, digits, spaces, apostrophes, dots, hyphens.
const CLINIC_NAME_PATTERN = /^[\p{L}\p{N}\s.'-]+$/u

export const TERMS_REQUIRED_MESSAGE =
  'Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.'

export function validateClinicName(value: string): string | null {
  const name = value.trim()
  if (name.length < CLINIC_NAME_MIN_LENGTH) return 'Informe o nome da clínica.'
  if (name.length > CLINIC_NAME_MAX_LENGTH) {
    return `O nome da clínica deve ter no máximo ${CLINIC_NAME_MAX_LENGTH} caracteres.`
  }
  if (!CLINIC_NAME_PATTERN.test(name)) {
    return 'O nome da clínica deve conter apenas letras, números, espaços, apóstrofos, pontos e hífens.'
  }
  return null
}

export function validateResponsibleName(value: string): string | null {
  const name = value.trim()
  if (name.split(/\s+/).filter(Boolean).length < 2) {
    return 'Informe nome e sobrenome do responsável.'
  }
  if (!isValidPersonName(name)) {
    return 'O nome do responsável não pode conter números ou caracteres especiais.'
  }

  const { firstName, lastName } = splitFullName(name)
  if (firstName.length < NAME_PART_MIN_LENGTH) {
    return 'O primeiro nome do responsável deve ter pelo menos 2 letras.'
  }
  if (firstName.length > NAME_PART_MAX_LENGTH) {
    return 'O primeiro nome do responsável deve ter no máximo 50 caracteres.'
  }
  if (lastName.length < NAME_PART_MIN_LENGTH) {
    return 'O sobrenome do responsável deve ter pelo menos 2 letras.'
  }
  if (lastName.length > NAME_PART_MAX_LENGTH) {
    return 'O sobrenome do responsável deve ter no máximo 50 caracteres.'
  }
  return null
}
