import type { AttentionPriorityFilter, AttentionReasonFilter, WhatsAppFilter } from '../hooks/usePatientsAttention'
import type { AttentionPriority, AttentionReason } from '../types/attention.types'

import type { BadgeTone } from './appointment-display'

export const REASON_LABEL: Record<AttentionReason, string> = {
  INACTIVE: 'Inativo',
  NO_UPCOMING_APPOINTMENT: 'Sem próxima consulta',
  PENDING_PAYMENT: 'Pagamento pendente',
  RECENTLY_CANCELED: 'Cancelamento recente',
  RECENT_NO_SHOW: 'Falta recente',
}

export const REASON_TONE: Record<AttentionReason, BadgeTone> = {
  INACTIVE: 'muted',
  NO_UPCOMING_APPOINTMENT: 'warning',
  PENDING_PAYMENT: 'muted',
  RECENTLY_CANCELED: 'warning',
  RECENT_NO_SHOW: 'warning',
}

export const PRIORITY_LABEL: Record<AttentionPriority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
}

export const PRIORITY_TONE: Record<AttentionPriority, BadgeTone> = {
  HIGH: 'muted',
  MEDIUM: 'warning',
  LOW: 'muted',
}

export const REASON_OPTIONS: { value: AttentionReasonFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos os motivos' },
  { value: 'PENDING_PAYMENT', label: 'Pagamento pendente' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'NO_UPCOMING_APPOINTMENT', label: 'Sem próxima consulta' },
  { value: 'RECENTLY_CANCELED', label: 'Cancelamento recente' },
  { value: 'RECENT_NO_SHOW', label: 'Falta recente' },
]

export const PRIORITY_OPTIONS: { value: AttentionPriorityFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas as prioridades' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'LOW', label: 'Baixa' },
]

export const WHATSAPP_OPTIONS: { value: WhatsAppFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos os pacientes' },
  { value: 'HAS_CONSENT', label: 'Com WhatsApp autorizado' },
]
