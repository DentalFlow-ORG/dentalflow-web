import type { FiscalProviderMode, ServiceInvoiceStatus } from '../types/fiscal.types'

const CANCELABLE_STATUSES: readonly ServiceInvoiceStatus[] = [
  'DRAFT',
  'READY_TO_ISSUE',
  'SIMULATED',
  'PROCESSING',
  'FAILED',
]

export function canCancelInvoice(status: ServiceInvoiceStatus): boolean {
  return (CANCELABLE_STATUSES as ServiceInvoiceStatus[]).includes(status)
}

export function canSimulateInvoice(
  status: ServiceInvoiceStatus,
  providerMode: FiscalProviderMode | null | undefined,
): boolean {
  return status === 'READY_TO_ISSUE' && providerMode === 'LOCAL'
}

export type InvoiceAction = 'details' | 'edit' | 'markReady' | 'simulate' | 'cancel'

export function getInvoiceActionLabel(action: InvoiceAction, customerName: string): string {
  const subject = customerName || 'nota fiscal'
  switch (action) {
    case 'details':
      return `Ver detalhes da nota de ${subject}`
    case 'edit':
      return `Editar nota de ${subject}`
    case 'markReady':
      return `Marcar nota de ${subject} como pronta para emissão`
    case 'simulate':
      return `Simular emissão da nota de ${subject}`
    case 'cancel':
      return `Cancelar nota de ${subject}`
  }
}
