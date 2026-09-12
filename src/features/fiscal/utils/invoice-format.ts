import { centsToMoneyInput, parseMoneyInputToCents } from '@/lib/money-input'

// Currency formatting is a single shared rule; the inventory module re-exports
// the same helper. Do not re-implement the cents-to-BRL conversion here.
export { formatCurrencyBRLCents as formatCents } from '@/lib/number-formatters'

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
