import type { PrivacyRequestStatus, PrivacyRequestType } from '../types/compliance.types'

export const STATUS_LABEL: Record<PrivacyRequestStatus, string> = {
  OPEN: 'Aberta',
  IN_REVIEW: 'Em análise',
  WAITING_VERIFICATION: 'Aguardando verificação',
  COMPLETED: 'Concluída',
  REJECTED: 'Rejeitada',
  CANCELED: 'Cancelada',
}

export const STATUS_TONE: Record<PrivacyRequestStatus, 'success' | 'muted' | 'warning'> = {
  OPEN: 'warning',
  IN_REVIEW: 'warning',
  WAITING_VERIFICATION: 'warning',
  COMPLETED: 'success',
  REJECTED: 'muted',
  CANCELED: 'muted',
}

export const REQUEST_TYPE_LABEL: Record<PrivacyRequestType, string> = {
  CONFIRM_PROCESSING: 'Confirmação de tratamento',
  ACCESS_DATA: 'Acesso aos dados',
  CORRECT_DATA: 'Correção de dados',
  DELETE_OR_ANONYMIZE: 'Exclusão / anonimização',
  PORTABILITY: 'Portabilidade',
  SHARING_INFORMATION: 'Informações de compartilhamento',
  REVOKE_CONSENT: 'Revogar consentimento',
  OTHER: 'Outra',
}

export const REQUESTER_TYPE_LABEL: Record<string, string> = {
  PATIENT: 'Paciente',
  CLINIC_OWNER: 'Proprietário',
  CLINIC_STAFF: 'Equipe',
  OTHER: 'Outro',
}
