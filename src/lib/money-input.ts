function centsToBRFormatted(cents: number): string {
  const value = cents / 100
  const [intPart, decPart] = value.toFixed(2).split('.')
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${intFormatted},${decPart}`
}

export function formatMoneyInputFromDigits(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  const cents = Number.parseInt(digits, 10)
  if (cents === 0) return ''
  return centsToBRFormatted(cents)
}

export function parseMoneyInputToCents(value: string): number {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 0
  return Number.parseInt(digits, 10)
}

export function centsToMoneyInput(cents: number | null | undefined): string {
  if (!cents) return ''
  return centsToBRFormatted(cents)
}
