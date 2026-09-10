export function formatCurrencyBR(value: number | null | undefined) {
  if (value == null) return null

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCurrencyBRL(value: number | null | undefined, fallback = 'R$ 0,00') {
  return formatCurrencyBR(value) ?? fallback
}

export function formatCurrencyBRLCents(cents: number): string {
  return formatCurrencyBRL(cents / 100)
}
