import { canCancelInvoice, canSimulateInvoice } from '@/features/fiscal/utils/invoice-actions'
import type { ServiceInvoiceStatus } from '@/features/fiscal/types/fiscal.types'

// ── canCancelInvoice ───────────────────────────────────────────────────────────

describe('canCancelInvoice', () => {
  const cancelable: ServiceInvoiceStatus[] = [
    'DRAFT',
    'READY_TO_ISSUE',
    'SIMULATED',
    'PROCESSING',
    'FAILED',
  ]

  const notCancelable: ServiceInvoiceStatus[] = ['ISSUED', 'CANCELED']

  for (const status of cancelable) {
    it(`returns true for ${status}`, () => {
      expect(canCancelInvoice(status)).toBe(true)
    })
  }

  for (const status of notCancelable) {
    it(`returns false for ${status}`, () => {
      expect(canCancelInvoice(status)).toBe(false)
    })
  }
})

// ── canSimulateInvoice ─────────────────────────────────────────────────────────

describe('canSimulateInvoice', () => {
  it('returns true when status is READY_TO_ISSUE and providerMode is LOCAL', () => {
    expect(canSimulateInvoice('READY_TO_ISSUE', 'LOCAL')).toBe(true)
  })

  it('returns false when status is READY_TO_ISSUE and providerMode is SANDBOX', () => {
    expect(canSimulateInvoice('READY_TO_ISSUE', 'SANDBOX')).toBe(false)
  })

  it('returns false when status is READY_TO_ISSUE and providerMode is PRODUCTION', () => {
    expect(canSimulateInvoice('READY_TO_ISSUE', 'PRODUCTION')).toBe(false)
  })

  it('returns false when status is READY_TO_ISSUE and providerMode is null', () => {
    expect(canSimulateInvoice('READY_TO_ISSUE', null)).toBe(false)
  })

  it('returns false when status is READY_TO_ISSUE and providerMode is undefined', () => {
    expect(canSimulateInvoice('READY_TO_ISSUE', undefined)).toBe(false)
  })

  it('returns false for DRAFT even if providerMode is LOCAL', () => {
    expect(canSimulateInvoice('DRAFT', 'LOCAL')).toBe(false)
  })

  it('returns false for ISSUED even if providerMode is LOCAL', () => {
    expect(canSimulateInvoice('ISSUED', 'LOCAL')).toBe(false)
  })

  it('returns false for FAILED even if providerMode is LOCAL', () => {
    expect(canSimulateInvoice('FAILED', 'LOCAL')).toBe(false)
  })

  it('returns false for SIMULATED even if providerMode is LOCAL', () => {
    expect(canSimulateInvoice('SIMULATED', 'LOCAL')).toBe(false)
  })

  it('returns false for PROCESSING even if providerMode is LOCAL', () => {
    expect(canSimulateInvoice('PROCESSING', 'LOCAL')).toBe(false)
  })

  it('returns false for CANCELED even if providerMode is LOCAL', () => {
    expect(canSimulateInvoice('CANCELED', 'LOCAL')).toBe(false)
  })
})
