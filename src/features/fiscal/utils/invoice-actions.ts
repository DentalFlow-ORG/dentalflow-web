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
