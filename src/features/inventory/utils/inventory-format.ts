export function formatBRLCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

// expiresAt is stored as @db.Date (date-only, UTC midnight) — use UTC to avoid off-by-one day
export function formatProductDate(isoString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoString))
}

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`
}

// createdAt / updatedAt are real timestamps — display in the user's local timezone
export function formatProductDateTime(isoString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoString))
}
