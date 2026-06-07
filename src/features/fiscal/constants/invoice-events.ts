const INVOICE_EVENT_LABELS: Record<string, string> = {
  CREATED: 'Nota criada',
  UPDATED: 'Nota atualizada',
  STATUS_CHANGE: 'Status alterado',
  ISSUED: 'Nota emitida',
  CANCELED: 'Nota cancelada',
  ERROR: 'Erro fiscal',
}

export function getInvoiceEventLabel(eventType: string): string {
  return INVOICE_EVENT_LABELS[eventType] ?? 'Evento registrado'
}
