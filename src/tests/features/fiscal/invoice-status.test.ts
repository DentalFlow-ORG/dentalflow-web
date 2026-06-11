import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_TONE,
} from '@/features/fiscal/constants/invoice-status'
import type { ServiceInvoiceStatus } from '@/features/fiscal/types/fiscal.types'

const ALL_STATUSES: ServiceInvoiceStatus[] = [
  'DRAFT',
  'READY_TO_ISSUE',
  'SIMULATED',
  'PROCESSING',
  'ISSUED',
  'FAILED',
  'CANCELED',
]

describe('INVOICE_STATUS_LABEL', () => {
  it('has a label for every ServiceInvoiceStatus', () => {
    for (const status of ALL_STATUSES) {
      expect(INVOICE_STATUS_LABEL[status]).toBeDefined()
      expect(typeof INVOICE_STATUS_LABEL[status]).toBe('string')
      expect(INVOICE_STATUS_LABEL[status].length).toBeGreaterThan(0)
    }
  })

  it('DRAFT maps to "Rascunho"', () => {
    expect(INVOICE_STATUS_LABEL.DRAFT).toBe('Rascunho')
  })

  it('ISSUED maps to "Emitida"', () => {
    expect(INVOICE_STATUS_LABEL.ISSUED).toBe('Emitida')
  })

  it('FAILED maps to "Falhou"', () => {
    expect(INVOICE_STATUS_LABEL.FAILED).toBe('Falhou')
  })

  it('CANCELED maps to "Cancelada"', () => {
    expect(INVOICE_STATUS_LABEL.CANCELED).toBe('Cancelada')
  })
})

describe('INVOICE_STATUS_TONE', () => {
  it('has a tone for every ServiceInvoiceStatus', () => {
    for (const status of ALL_STATUSES) {
      expect(INVOICE_STATUS_TONE[status]).toBeDefined()
    }
  })

  it('FAILED tone is "danger"', () => {
    expect(INVOICE_STATUS_TONE.FAILED).toBe('danger')
  })

  it('ISSUED tone is "success"', () => {
    expect(INVOICE_STATUS_TONE.ISSUED).toBe('success')
  })

  it('DRAFT tone is "muted"', () => {
    expect(INVOICE_STATUS_TONE.DRAFT).toBe('muted')
  })

  it('CANCELED tone is "muted"', () => {
    expect(INVOICE_STATUS_TONE.CANCELED).toBe('muted')
  })

  it('READY_TO_ISSUE tone is "warning"', () => {
    expect(INVOICE_STATUS_TONE.READY_TO_ISSUE).toBe('warning')
  })

  it('PROCESSING tone is "warning"', () => {
    expect(INVOICE_STATUS_TONE.PROCESSING).toBe('warning')
  })

  it('SIMULATED tone is "success"', () => {
    expect(INVOICE_STATUS_TONE.SIMULATED).toBe('success')
  })
})
