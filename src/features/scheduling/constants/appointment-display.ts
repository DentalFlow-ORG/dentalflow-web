import type { AppointmentPaymentMethod, AppointmentStatus } from '../types/scheduling.types'

export const PAYMENT_METHOD_LABELS: Record<AppointmentPaymentMethod, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  PIX: 'PIX',
  BANK_TRANSFER: 'Transferência bancária',
  HEALTH_INSURANCE: 'Plano de saúde',
  OTHER: 'Outro',
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING:
    'border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-700/60 dark:bg-amber-900/80 dark:text-amber-200 dark:hover:bg-amber-800/80 dark:hover:border-amber-600/80',
  CONFIRMED:
    'border-emerald-300 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-700/60 dark:bg-emerald-900/80 dark:text-emerald-200 dark:hover:bg-emerald-800/80 dark:hover:border-emerald-600/80',
  COMPLETED: 'border-border bg-muted text-muted-foreground hover:bg-muted/80',
  CANCELED:
    'border-red-300 bg-red-100 text-red-900 hover:bg-red-200 dark:border-red-700/60 dark:bg-red-900/80 dark:text-red-300 dark:hover:bg-red-800/80 dark:hover:border-red-600/80',
  NO_SHOW:
    'border-orange-300 bg-orange-100 text-orange-900 hover:bg-orange-200 dark:border-orange-700/60 dark:bg-orange-900/80 dark:text-orange-300 dark:hover:bg-orange-800/80 dark:hover:border-orange-600/80',
}
