import { Building2, DollarSign, Shield, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { FilterDef } from '@/components/common/ListToolbar'

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

export const ADMIN_NAV_CARDS: Array<{
  to: string
  icon: LucideIcon
  label: string
  description: string
}> = [
  {
    to: '/app/admin/clinics',
    icon: Building2,
    label: 'Clínicas',
    description: 'Visualize e gerencie as clínicas cadastradas na plataforma.',
  },
  {
    to: '/app/admin/users',
    icon: Users,
    label: 'Usuários',
    description: 'Consulte e administre contas de usuários.',
  },
  {
    to: '/app/admin/financeiro',
    icon: DollarSign,
    label: 'Financeiro SaaS',
    description: 'Receita recorrente, assinaturas ativas e planos.',
  },
  {
    to: '/app/admin/compliance',
    icon: Shield,
    label: 'Compliance',
    description: 'Privacidade, LGPD, auditoria e solicitações de titulares.',
  },
]

export const USER_FILTER_DEFS: FilterDef[] = [
  {
    key: 'role',
    label: 'Papel',
    options: Object.entries(ADMIN_ROLE_LABEL).map(([value, label]) => ({ value, label })),
  },
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Ativo' },
      { value: 'inactive', label: 'Inativo' },
    ],
  },
]

export const CLINIC_FILTER_DEFS: FilterDef[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Ativa' },
      { value: 'inactive', label: 'Inativa' },
    ],
  },
]
