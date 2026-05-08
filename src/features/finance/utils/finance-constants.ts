import type {
  FinancialTransactionStatus,
  FinancialTransactionType,
  FixedExpenseRecurrence,
} from '../types/finance.types'

export const CATEGORY_COLORS = [
  '#10B981',
  '#6366F1',
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#0EA5E9',
  '#7C3AED',
  '#64748B',
  '#EC4899',
  '#14B8A6',
] as const

export const CATEGORY_COLOR_NAMES: Record<string, string> = {
  '#10B981': 'Verde',
  '#6366F1': 'Índigo',
  '#EF4444': 'Vermelho',
  '#F97316': 'Laranja',
  '#F59E0B': 'Âmbar',
  '#0EA5E9': 'Azul',
  '#7C3AED': 'Roxo',
  '#64748B': 'Cinza',
  '#EC4899': 'Rosa',
  '#14B8A6': 'Ciano',
}

export const STATUS_LABEL: Record<FinancialTransactionStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELED: 'Cancelado',
}

export const TYPE_LABEL: Record<FinancialTransactionType, string> = {
  INCOME: 'Entrada',
  EXPENSE: 'Saída',
}

export const SOURCE_LABEL: Record<string, string> = {
  MANUAL: 'Manual',
  SERVICE_PAYMENT: 'Serviço pago',
  FIXED_EXPENSE: 'Despesa fixa',
  ADJUSTMENT: 'Ajuste',
}

export const RECURRENCE_LABEL: Record<FixedExpenseRecurrence, string> = {
  MONTHLY: 'Mensal',
  WEEKLY: 'Semanal',
  YEARLY: 'Anual',
}

export const statusTone: Record<FinancialTransactionStatus, 'success' | 'warning' | 'muted'> = {
  PAID: 'success',
  PENDING: 'warning',
  CANCELED: 'muted',
}
