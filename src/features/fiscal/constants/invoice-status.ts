import type { ServiceInvoiceStatus } from '../types/fiscal.types'

export const INVOICE_STATUS_LABEL: Record<ServiceInvoiceStatus, string> = {
  DRAFT: 'Rascunho',
  READY_TO_ISSUE: 'Pronta para emissão',
  SIMULATED: 'Simulada',
  PROCESSING: 'Processando',
  ISSUED: 'Emitida',
  FAILED: 'Falhou',
  CANCELED: 'Cancelada',
}

export const INVOICE_STATUS_TONE: Record<
  ServiceInvoiceStatus,
  'success' | 'warning' | 'danger' | 'muted'
> = {
  DRAFT: 'muted',
  READY_TO_ISSUE: 'warning',
  SIMULATED: 'success',
  PROCESSING: 'warning',
  ISSUED: 'success',
  FAILED: 'danger',
  CANCELED: 'muted',
}
