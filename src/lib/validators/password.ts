/**
 * Password policy mirrored from the API (common/validators/password-policy.ts).
 * The API is authoritative; the client checks the same rules up front so a
 * weak password is explained before the request instead of after a 400.
 */

const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

export const PASSWORD_POLICY_MESSAGE =
  'A senha deve ter de 8 a 72 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.'

export const PASSWORD_MISMATCH_MESSAGE = 'As senhas não coincidem.'

export type PasswordRequirement = {
  label: string
  met: boolean
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { label: 'Mínimo de 8 caracteres', met: password.length >= PASSWORD_MIN_LENGTH },
    { label: 'Letra maiúscula (A–Z)', met: /[A-Z]/.test(password) },
    { label: 'Letra minúscula (a–z)', met: /[a-z]/.test(password) },
    { label: 'Número (0–9)', met: /[0-9]/.test(password) },
    { label: 'Caractere especial (!@#$…)', met: /[^a-zA-Z0-9]/.test(password) },
  ]
}

export function meetsPasswordPolicy(password: string): boolean {
  return (
    password.length <= PASSWORD_MAX_LENGTH &&
    getPasswordRequirements(password).every((requirement) => requirement.met)
  )
}
