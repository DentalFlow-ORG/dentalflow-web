// Stock quantities are Decimal(10,3) in the API: up to 7 integer digits and
// 3 decimal places. Inputs are text (not type="number") so the browser never
// accepts scientific notation such as "1e5" or a negative sign.
const MAX_INTEGER_DIGITS = 7
const MAX_DECIMAL_DIGITS = 3

/** Keeps digits and a single decimal separator (shown as a comma), within the column precision. */
export function sanitizeQuantityInput(value: string): string {
  const cleaned = value.replace(/[^\d,.]/g, '').replace('.', ',')
  const [integerPart, ...rest] = cleaned.split(',')
  const integer = integerPart.slice(0, MAX_INTEGER_DIGITS)
  if (rest.length === 0) return integer
  const decimals = rest.join('').replace(/\D/g, '').slice(0, MAX_DECIMAL_DIGITS)
  return `${integer},${decimals}`
}

/** Parses a sanitized quantity; returns null when the field is empty or not a number. */
export function parseQuantityInput(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!normalized || normalized === '.') return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

/** Formats a stored quantity for the input, using the Brazilian decimal comma. */
export function quantityToInput(value: number): string {
  return String(value).replace('.', ',')
}
