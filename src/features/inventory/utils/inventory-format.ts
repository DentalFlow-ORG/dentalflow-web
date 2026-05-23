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
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString))
}

export function getMovementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    IN: 'Entrada',
    OUT: 'Saída',
    ADJUSTMENT: 'Ajuste',
    LOSS: 'Perda/descarte',
  }

  return labels[type] ?? type
}

export function formatMovementQuantity(
  type: string,
  quantity: number,
  unit: string,
): string {
  const sign = type === 'IN' ? '+' : type === 'OUT' || type === 'LOSS' ? '-' : ''
  return `${sign}${formatQuantity(quantity, unit)}`
}

export function formatQuantityTransition(
  previousQuantity: number,
  newQuantity: number,
): string {
  return `${previousQuantity} → ${newQuantity}`
}
