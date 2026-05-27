import type { UserRole } from '../types/admin.types'

export type RoleBadgeTone = 'success' | 'muted' | 'warning'

export const ADMIN_ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Admin',
  OWNER: 'Proprietário',
  DENTIST: 'Profissional',
  ASSISTANT: 'Assistente',
  PATIENT: 'Paciente',
}

export const ADMIN_ROLE_TONE: Record<UserRole, RoleBadgeTone> = {
  ADMIN: 'warning',
  OWNER: 'success',
  DENTIST: 'muted',
  ASSISTANT: 'muted',
  PATIENT: 'muted',
}

export const USER_FORM_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Admin (plataforma)' },
  { value: 'OWNER', label: 'Proprietário' },
  { value: 'DENTIST', label: 'Profissional' },
  { value: 'ASSISTANT', label: 'Assistente' },
]
