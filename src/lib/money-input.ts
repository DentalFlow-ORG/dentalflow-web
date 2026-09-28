function centsToBRFormatted(cents: number): string {
  const value = cents / 100
  const [intPart, decPart] = value.toFixed(2).split('.')
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${intFormatted},${decPart}`
}

// Mirrors the API's MAX_CENTS_AMOUNT (R$ 9.999.999,99) used by every
// integer-cents money field. Callers with a different backend limit pass it.
/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export const MONEY_INPUT_MAX_CENTS = 999_999_999

export function formatMoneyInputFromDigits(
  value: string,
  maxCents: number = MONEY_INPUT_MAX_CENTS,
): string {
  let digits = value.replace(/\D/g, '').replace(/^0+/, '')
  // Typing past the limit ignores the extra trailing digits instead of
  // producing an amount the API would reject.
  while (digits.length > String(maxCents).length || Number(digits) > maxCents) {
    digits = digits.slice(0, -1)
  }
  if (!digits) return ''
  return centsToBRFormatted(Number.parseInt(digits, 10))
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
