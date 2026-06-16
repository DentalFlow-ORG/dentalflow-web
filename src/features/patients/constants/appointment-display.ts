export type BadgeTone = 'success' | 'warning' | 'muted'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

const STATUS_TONE: Record<string, BadgeTone> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  CONFIRMED: 'warning',
  CANCELED: 'muted',
  NO_SHOW: 'muted',
}
