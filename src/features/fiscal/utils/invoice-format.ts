import { formatCurrencyBR } from '@/lib/number-formatters'

export function formatCents(cents: number): string {
  return formatCurrencyBR(cents / 100) ?? 'R$ 0,00'
}

export function formatInvoiceDate(value?: string | null): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value))
}

export function toMoneyInput(cents: number): string {
  return cents ? String((cents / 100).toFixed(2)) : ''
}

export function fromMoneyInput(value: string): number {
  const normalized = value.replace(',', '.')
  const number = Number(normalized)
  return Number.isFinite(number) ? Math.round(number * 100) : 0
}
