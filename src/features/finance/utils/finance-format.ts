import { safeFormatDateBR } from '@/lib/date-time-formatters'
import { formatCurrencyBRL } from '@/lib/number-formatters'

export function formatCurrency(value: string | number) {
  return formatCurrencyBRL(Number(value))
}

export function formatCompactCurrency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value))
}

export function formatDate(value: string) {
  return safeFormatDateBR(value)
}

export function formatShortDate(value: string) {
  const formatted = safeFormatDateBR(value, '')
  return formatted ? formatted.slice(0, 5) : 'Data não informada'
}
