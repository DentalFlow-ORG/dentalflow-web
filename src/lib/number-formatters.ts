export function parseOptionalNumber(value: string | null | undefined) {
  if (!value?.trim()) return undefined

  const normalized = Number(value.replace(',', '.'))

  return Number.isNaN(normalized) ? undefined : normalized
}

export function formatCurrencyBR(value: number | null | undefined) {
  if (value == null) return null

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
