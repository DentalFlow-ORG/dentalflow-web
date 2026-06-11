import { centsToMoneyInput, parseMoneyInputToCents } from '@/lib/money-input'
import { formatCurrencyBR } from '@/lib/number-formatters'

export function formatCents(cents: number): string {
  return formatCurrencyBR(cents / 100) ?? 'R$ 0,00'
}

export function formatInvoiceDate(value?: string | null): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value))
}

export function toMoneyInput(cents: number): string {
  return centsToMoneyInput(cents)
}

export function fromMoneyInput(value: string): number {
  return parseMoneyInputToCents(value)
}
