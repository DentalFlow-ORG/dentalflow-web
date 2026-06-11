import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { InvoiceList } from '@/features/fiscal/components/InvoiceList'
import type { ClinicFiscalProfile, ServiceInvoice } from '@/features/fiscal/types/fiscal.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeInvoice(overrides: Partial<ServiceInvoice> = {}): ServiceInvoice {
  return {
    id: 'inv-1',
    patientId: null,
    appointmentId: null,
    status: 'DRAFT',
    environment: 'LOCAL',
    isLegalDocument: false,
    invoiceNumber: null,
    verificationCode: null,
    customerName: 'João Silva',
    customerDocument: '123.456.789-00',
    customerEmail: null,
    customerPhone: null,
    serviceDescription: 'Consulta odontológica',
    serviceCode: null,
    amountCents: 25000,
    deductionsCents: null,
    issRate: null,
    issAmountCents: null,
    currency: 'BRL',
    competenceDate: '2026-06-07',
    simulatedIssueDate: null,
    issueDate: null,
    errorMessage: null,
    cancellationReason: null,
    canceledAt: null,
    notes: null,
    createdAt: '2026-06-07T12:00:00.000Z',
    updatedAt: '2026-06-07T12:00:00.000Z',
    ...overrides,
  }
}

function makeProfile(overrides: Partial<ClinicFiscalProfile> = {}): ClinicFiscalProfile {
  return {
    id: 'profile-1',
    clinicId: 'clinic-1',
    legalName: 'Clínica Teste',
    tradeName: null,
    documentType: 'CNPJ',
    documentNumber: '12.345.678/0001-90',
    municipalRegistration: null,
    stateRegistration: null,
    taxRegime: 'SIMPLES_NACIONAL',
    specialTaxRegime: null,
    serviceCode: null,
    cnae: null,
    issRate: null,
    addressStreet: 'Rua Teste',
    addressNumber: '123',
    addressComplement: null,
    addressNeighborhood: 'Centro',
    addressCity: 'São Paulo',
    addressState: 'SP',
    addressZipCode: '01310-100',
    cityIbgeCode: null,
    fiscalProvider: 'LOCAL',
    fiscalProviderMode: 'LOCAL',
    isConfigured: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function renderList(
  overrides: {
    invoices?: ServiceInvoice[]
    userRole?: string
    isOwner?: boolean
    profile?: ClinicFiscalProfile | null
    page?: number
    totalPages?: number
    total?: number
    limit?: number
    onViewDetails?: (invoice: ServiceInvoice) => void
    onEdit?: (invoice: ServiceInvoice) => void
    onMarkReady?: (invoice: ServiceInvoice) => void
    onSimulate?: (invoice: ServiceInvoice) => void
    onCancel?: (invoice: ServiceInvoice) => void
    onPageChange?: (page: number) => void
    onPageSizeChange?: (limit: number) => void
  } = {},
) {
  const props = {
    invoices: [makeInvoice()],
    userRole: 'OWNER' as string | undefined,
    isOwner: true,
    profile: null as ClinicFiscalProfile | null,
    page: 1,
    totalPages: 1,
    total: 1,
    limit: 20,
    onViewDetails: vi.fn(),
    onEdit: vi.fn(),
    onMarkReady: vi.fn(),
    onSimulate: vi.fn(),
    onCancel: vi.fn(),
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    ...overrides,
  }
  const result = render(<InvoiceList {...props} />)
  return { ...result, props }
}

// ── Empty state ────────────────────────────────────────────────────────────────

describe('InvoiceList — empty state', () => {
  it('renders empty state when invoices array is empty', () => {
    renderList({ invoices: [] })
    expect(screen.getByText('Nenhuma nota fiscal encontrada')).toBeInTheDocument()
  })

  it('does not render table or cards when empty', () => {
    renderList({ invoices: [] })
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

// ── Mobile card ────────────────────────────────────────────────────────────────

describe('InvoiceList — mobile card', () => {
  it('renders customer name in mobile card', () => {
    renderList()
    const names = screen.getAllByText('João Silva')
    expect(names.length).toBeGreaterThan(0)
  })

  it('renders formatted amount in mobile card', () => {
    renderList()
    // R$ 250,00 — amount appears at least once
    const amounts = screen.getAllByText(/250/)
    expect(amounts.length).toBeGreaterThan(0)
  })

  it('renders status badge', () => {
    renderList()
    const badges = screen.getAllByText('Rascunho')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('renders competence date', () => {
    renderList()
    // 2026-06-07 formatted as pt-BR: 07/06/2026
    const dates = screen.getAllByText(/07\/06\/2026/)
    expect(dates.length).toBeGreaterThan(0)
  })

  it('renders service description', () => {
    renderList()
    const descs = screen.getAllByText('Consulta odontológica')
    expect(descs.length).toBeGreaterThan(0)
  })

  it('amount has tabular-nums class in mobile card', () => {
    const { container } = renderList()
    const tabularEl = container.querySelector('.tabular-nums')
    expect(tabularEl).toBeInTheDocument()
  })

  it('mobile card uses article element', () => {
    const { container } = renderList()
    expect(container.querySelector('article')).toBeInTheDocument()
  })
})

// ── Desktop table ──────────────────────────────────────────────────────────────

describe('InvoiceList — desktop table', () => {
  it('renders table with aria-label "Notas fiscais"', () => {
    renderList()
    expect(screen.getByRole('table', { name: 'Notas fiscais' })).toBeInTheDocument()
  })

  it('renders all column headers', () => {
    renderList()
    expect(screen.getByRole('columnheader', { name: 'Cliente' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Serviço' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Valor' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Competência' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Criada em' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Ações' })).toBeInTheDocument()
  })

  it('desktop scroll wrapper has app-scrollbar class', () => {
    const { container } = renderList()
    expect(container.querySelector('.app-scrollbar')).toBeInTheDocument()
  })

  it('service description cell has truncate class', () => {
    const { container } = renderList()
    const truncated = container.querySelector('td .truncate')
    expect(truncated).toBeInTheDocument()
  })
})

// ── Action guards ──────────────────────────────────────────────────────────────

describe('InvoiceList — action guards', () => {
  it('DRAFT + OWNER: shows Ver detalhes, Editar, Marcar pronta, Cancelar', () => {
    renderList({ invoices: [makeInvoice({ status: 'DRAFT' })], isOwner: true, userRole: 'OWNER' })
    // Multiple buttons with same label (mobile + desktop) — at least one of each
    expect(
      screen.getAllByRole('button', { name: /Ver detalhes da nota de João Silva/ }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: /Editar nota de João Silva/ }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: /Marcar nota de João Silva como pronta/ }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: /Cancelar nota de João Silva/ }).length,
    ).toBeGreaterThan(0)
  })

  it('ISSUED + OWNER: does not show cancel button', () => {
    renderList({ invoices: [makeInvoice({ status: 'ISSUED' })], isOwner: true, userRole: 'OWNER' })
    expect(
      screen.queryByRole('button', { name: /Cancelar nota de João Silva/ }),
    ).not.toBeInTheDocument()
  })

  it('CANCELED + OWNER: does not show cancel button', () => {
    renderList({
      invoices: [makeInvoice({ status: 'CANCELED' })],
      isOwner: true,
      userRole: 'OWNER',
    })
    expect(
      screen.queryByRole('button', { name: /Cancelar nota de João Silva/ }),
    ).not.toBeInTheDocument()
  })

  it('READY_TO_ISSUE + LOCAL profile + OWNER: shows simulate button', () => {
    renderList({
      invoices: [makeInvoice({ status: 'READY_TO_ISSUE' })],
      isOwner: true,
      userRole: 'OWNER',
      profile: makeProfile({ fiscalProviderMode: 'LOCAL' }),
    })
    expect(
      screen.getAllByRole('button', { name: /Simular emissão da nota de João Silva/ }).length,
    ).toBeGreaterThan(0)
  })

  it('READY_TO_ISSUE + SANDBOX profile + OWNER: hides simulate button', () => {
    renderList({
      invoices: [makeInvoice({ status: 'READY_TO_ISSUE' })],
      isOwner: true,
      userRole: 'OWNER',
      profile: makeProfile({ fiscalProviderMode: 'SANDBOX' }),
    })
    expect(
      screen.queryByRole('button', { name: /Simular emissão da nota de João Silva/ }),
    ).not.toBeInTheDocument()
  })

  it('READY_TO_ISSUE + null profile + OWNER: hides simulate button', () => {
    renderList({
      invoices: [makeInvoice({ status: 'READY_TO_ISSUE' })],
      isOwner: true,
      userRole: 'OWNER',
      profile: null,
    })
    expect(
      screen.queryByRole('button', { name: /Simular emissão da nota de João Silva/ }),
    ).not.toBeInTheDocument()
  })

  it('DRAFT + non-DRAFT status: no markReady button for READY_TO_ISSUE', () => {
    renderList({ invoices: [makeInvoice({ status: 'READY_TO_ISSUE' })], isOwner: true })
    expect(
      screen.queryByRole('button', { name: /Marcar nota de João Silva como pronta/ }),
    ).not.toBeInTheDocument()
  })

  it('non-owner: does not see markReady button', () => {
    renderList({
      invoices: [makeInvoice({ status: 'DRAFT' })],
      isOwner: false,
      userRole: 'ASSISTANT',
    })
    expect(
      screen.queryByRole('button', { name: /Marcar nota de João Silva como pronta/ }),
    ).not.toBeInTheDocument()
  })

  it('non-owner: does not see cancel button', () => {
    renderList({
      invoices: [makeInvoice({ status: 'DRAFT' })],
      isOwner: false,
      userRole: 'ASSISTANT',
    })
    expect(
      screen.queryByRole('button', { name: /Cancelar nota de João Silva/ }),
    ).not.toBeInTheDocument()
  })

  it('ASSISTANT + DRAFT: shows edit button', () => {
    renderList({
      invoices: [makeInvoice({ status: 'DRAFT' })],
      isOwner: false,
      userRole: 'ASSISTANT',
    })
    expect(
      screen.getAllByRole('button', { name: /Editar nota de João Silva/ }).length,
    ).toBeGreaterThan(0)
  })

  it('ISSUED + OWNER: does not show edit button', () => {
    renderList({ invoices: [makeInvoice({ status: 'ISSUED' })], isOwner: true, userRole: 'OWNER' })
    expect(
      screen.queryByRole('button', { name: /Editar nota de João Silva/ }),
    ).not.toBeInTheDocument()
  })
})

// ── Callback wiring ───────────────────────────────────────────────────────────

describe('InvoiceList — callback wiring', () => {
  it('clicking Ver detalhes calls onViewDetails', () => {
    const onViewDetails = vi.fn()
    const invoice = makeInvoice()
    renderList({ invoices: [invoice], onViewDetails })
    fireEvent.click(
      screen.getAllByRole('button', { name: /Ver detalhes da nota de João Silva/ })[0],
    )
    expect(onViewDetails).toHaveBeenCalledWith(invoice)
  })

  it('clicking Cancelar calls onCancel with the invoice', () => {
    const onCancel = vi.fn()
    const invoice = makeInvoice({ status: 'DRAFT' })
    renderList({ invoices: [invoice], isOwner: true, onCancel })
    fireEvent.click(screen.getAllByRole('button', { name: /Cancelar nota de João Silva/ })[0])
    expect(onCancel).toHaveBeenCalledWith(invoice)
  })
})
