import type {
  AppointmentPaymentMethod,
  AppointmentPaymentStatus,
  AppointmentStatus,
} from '../types/scheduling.types'

export const PAYMENT_METHOD_LABELS: Record<AppointmentPaymentMethod, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  PIX: 'PIX',
  BANK_TRANSFER: 'Transferência bancária',
  HEALTH_INSURANCE: 'Plano de saúde',
  OTHER: 'Outro',
}

// Flat label maps — use these when only the text label is needed (aria-labels,
// tooltips, KPI cards, compact display). For badge rendering use
// AppointmentStatusBadge / AppointmentPaymentBadge directly.
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELED: 'Cancelado',
  COMPLETED: 'Concluído',
  NO_SHOW: 'Não compareceu',
}

const PAYMENT_STATUS_LABELS: Record<AppointmentPaymentStatus, string> = {
  PAYMENT_PENDING: 'Pagamento pendente',
  PAID: 'Pago',
  PARTIALLY_PAID: 'Pago parcialmente',
  REFUNDED: 'Reembolsado',
  CANCELED: 'Cancelado',
}

// Calendar card colors — intentionally different from badge colors.
// Cards need full background fills and hover transitions; badges use subtle
// translucent tints. Keep these separate so card and badge styles can evolve
// independently.
export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING:
    'border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-700/60 dark:bg-amber-900/80 dark:text-amber-200 dark:hover:bg-amber-800/80 dark:hover:border-amber-600/80',
  CONFIRMED:
    'border-emerald-300 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-700/60 dark:bg-emerald-900/80 dark:text-emerald-200 dark:hover:bg-emerald-800/80 dark:hover:border-emerald-600/80',
  COMPLETED:
    'border-blue-300 bg-blue-100 text-blue-950 hover:bg-blue-200 dark:border-blue-700/60 dark:bg-blue-900/80 dark:text-blue-200 dark:hover:bg-blue-800/80 dark:hover:border-blue-600/80',
  CANCELED:
    'border-rose-300 bg-rose-100 text-rose-900 hover:bg-rose-200 dark:border-rose-700/60 dark:bg-rose-900/80 dark:text-rose-300 dark:hover:bg-rose-800/80 dark:hover:border-rose-600/80',
  NO_SHOW:
    'border-violet-300 bg-violet-100 text-violet-900 hover:bg-violet-200 dark:border-violet-700/60 dark:bg-violet-900/80 dark:text-violet-300 dark:hover:bg-violet-800/80 dark:hover:border-violet-600/80',
}

// Solid accent colors for timeline dots and left-border strips.
// These are background-color utilities — apply to a narrow element alongside
// the main card so the status accent contrasts against any card background.
export const STATUS_ACCENT_COLORS: Record<AppointmentStatus, string> = {
  PENDING: 'bg-amber-400 dark:bg-amber-500',
  CONFIRMED: 'bg-emerald-500 dark:bg-emerald-400',
  COMPLETED: 'bg-blue-500 dark:bg-blue-400',
  CANCELED: 'bg-rose-500 dark:bg-rose-400',
  NO_SHOW: 'bg-violet-500 dark:bg-violet-400',
}
