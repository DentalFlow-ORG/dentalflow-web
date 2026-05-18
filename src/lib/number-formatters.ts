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

export function formatCurrencyBRL(value: number | null | undefined, fallback = 'R$ 0,00') {
  return formatCurrencyBR(value) ?? fallback
}

export function parseCurrencyBRL(value: string | null | undefined) {
  if (!value?.trim()) return null

  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')

  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? null : parsed
}

export function formatPercentBR(value: number | null | undefined, fallback = '0%') {
  if (value == null || Number.isNaN(value)) return fallback

  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value)
}
