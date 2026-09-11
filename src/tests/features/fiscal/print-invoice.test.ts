import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ServiceInvoice } from '@/features/fiscal/types/fiscal.types'
import { printInvoice } from '@/features/fiscal/utils/print-invoice'

const baseInvoice: ServiceInvoice = {
  id: 'inv-1',
  patientId: null,
  appointmentId: null,
  status: 'SIMULATED',
  environment: 'LOCAL',
  isLegalDocument: false,
  invoiceNumber: null,
  verificationCode: null,
  customerName: 'Ana Souza',
  customerDocument: null,
  customerEmail: null,
  customerPhone: null,
  serviceDescription: 'Consulta odontológica',
  serviceCode: null,
  amountCents: 25000,
  deductionsCents: null,
  issRate: null,
  issAmountCents: null,
  currency: 'BRL',
  competenceDate: '2026-06-01',
  simulatedIssueDate: null,
  issueDate: null,
  errorMessage: null,
  cancellationReason: null,
  canceledAt: null,
  notes: null,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
}

describe('printInvoice', () => {
  let mockWin: { document: { write: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> } }

  beforeEach(() => {
    mockWin = { document: { write: vi.fn(), close: vi.fn() } }
    vi.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls window.open', () => {
    printInvoice(baseInvoice)
    expect(window.open).toHaveBeenCalled()
  })

  it('prints optional invoice and tax data as escaped text, including zero ISS', () => {
    printInvoice({
      ...baseInvoice,
      invoiceNumber: 'NF-42',
      serviceCode: '04.12',
      issRate: 0,
      issAmountCents: 0,
      notes: '<b>Revisão</b> & "retorno"',
    })
    const document = new DOMParser().parseFromString(
      mockWin.document.write.mock.calls[0][0],
      'text/html',
    )
    expect(document.body.textContent).toContain('Nº NF-42')
    expect(document.body.textContent).toContain('Código de serviço: 04.12')
    expect(document.body.textContent).toContain('Alíquota ISS0%')
    expect(document.body.textContent).toMatch(/Valor ISSR\$\s0,00/)
    expect(document.body.textContent).toContain('<b>Revisão</b> & "retorno"')
    expect(document.querySelector('b')).toBeNull()
    expect(mockWin.document.close).toHaveBeenCalledOnce()
  })

  it('does not throw when window.open returns null', () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    expect(() => printInvoice(baseInvoice)).not.toThrow()
  })

  it('calls document.close()', () => {
    printInvoice(baseInvoice)
    expect(mockWin.document.close).toHaveBeenCalled()
  })

  it('uses "Local/Simulação" label for LOCAL environment', () => {
    printInvoice({ ...baseInvoice, environment: 'LOCAL' })
    const html: string = mockWin.document.write.mock.calls[0][0]
    expect(html).toContain('Local/Simulação')
  })

  it('uses "Homologação" label for SANDBOX environment', () => {
    printInvoice({ ...baseInvoice, environment: 'SANDBOX' })
    const html: string = mockWin.document.write.mock.calls[0][0]
    expect(html).toContain('Homologação')
  })

  it('uses "Produção" label for PRODUCTION environment', () => {
    printInvoice({ ...baseInvoice, environment: 'PRODUCTION' })
    const html: string = mockWin.document.write.mock.calls[0][0]
    expect(html).toContain('Produção')
  })

  it('escapes XSS in customerName', () => {
    printInvoice({ ...baseInvoice, customerName: '<script>alert(1)</script>' })
    const html: string = mockWin.document.write.mock.calls[0][0]
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>alert')
  })
})
