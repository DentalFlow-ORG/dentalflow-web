import type { ServiceInvoiceStatus } from '@/features/fiscal/types/fiscal.types'
import {
  canCancelInvoice,
  canSimulateInvoice,
  getInvoiceActionLabel,
} from '@/features/fiscal/utils/invoice-actions'

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

// ── getInvoiceActionLabel ──────────────────────────────────────────────────────

describe('getInvoiceActionLabel', () => {
  it('returns details label with customer name', () => {
    expect(getInvoiceActionLabel('details', 'João Silva')).toBe(
      'Ver detalhes da nota de João Silva',
    )
  })

  it('returns edit label with customer name', () => {
    expect(getInvoiceActionLabel('edit', 'João Silva')).toBe('Editar nota de João Silva')
  })

  it('returns markReady label with customer name', () => {
    expect(getInvoiceActionLabel('markReady', 'João Silva')).toBe(
      'Marcar nota de João Silva como pronta para emissão',
    )
  })

  it('returns simulate label with customer name', () => {
    expect(getInvoiceActionLabel('simulate', 'João Silva')).toBe(
      'Simular emissão da nota de João Silva',
    )
  })

  it('returns cancel label with customer name', () => {
    expect(getInvoiceActionLabel('cancel', 'João Silva')).toBe('Cancelar nota de João Silva')
  })

  it('uses "nota fiscal" fallback when customerName is empty string', () => {
    expect(getInvoiceActionLabel('details', '')).toBe('Ver detalhes da nota de nota fiscal')
  })

  it('fallback applies to all actions when name is empty', () => {
    expect(getInvoiceActionLabel('edit', '')).toBe('Editar nota de nota fiscal')
    expect(getInvoiceActionLabel('markReady', '')).toBe(
      'Marcar nota de nota fiscal como pronta para emissão',
    )
    expect(getInvoiceActionLabel('simulate', '')).toBe('Simular emissão da nota de nota fiscal')
    expect(getInvoiceActionLabel('cancel', '')).toBe('Cancelar nota de nota fiscal')
  })

  it('label starts with the visible button text for details', () => {
    const label = getInvoiceActionLabel('details', 'Maria')
    expect(label.startsWith('Ver detalhes')).toBe(true)
  })

  it('label starts with the visible button text for edit', () => {
    const label = getInvoiceActionLabel('edit', 'Maria')
    expect(label.startsWith('Editar')).toBe(true)
  })

  it('label starts with the visible button text for cancel', () => {
    const label = getInvoiceActionLabel('cancel', 'Maria')
    expect(label.startsWith('Cancelar')).toBe(true)
  })

  it('label starts with the visible button text for simulate', () => {
    const label = getInvoiceActionLabel('simulate', 'Maria')
    expect(label.startsWith('Simular emissão')).toBe(true)
  })

  it('label starts with "Marcar" for markReady action', () => {
    const label = getInvoiceActionLabel('markReady', 'Maria')
    expect(label.startsWith('Marcar')).toBe(true)
  })

  it('includes customer name in all action labels', () => {
    const name = 'Paciente Único'
    const actions = ['details', 'edit', 'markReady', 'simulate', 'cancel'] as const
    for (const action of actions) {
      expect(getInvoiceActionLabel(action, name)).toContain(name)
    }
  })
})
