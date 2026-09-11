import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

vi.mock('@/features/fiscal/utils/print-invoice', () => ({
  printInvoice: vi.fn(),
}))

import { InvoiceDetails } from '@/features/fiscal/components/InvoiceDetails'
import { getInvoiceEventLabel } from '@/features/fiscal/constants/invoice-events'
import type { FiscalInvoiceEvent, ServiceInvoice } from '@/features/fiscal/types/fiscal.types'
import { printInvoice } from '@/features/fiscal/utils/print-invoice'

const mockPrintInvoice = printInvoice as ReturnType<typeof vi.fn>

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<FiscalInvoiceEvent> = {}): FiscalInvoiceEvent {
  return {
    id: 'evt-1',
    eventType: 'STATUS_CHANGE',
    previousStatus: 'DRAFT',
    nextStatus: 'READY_TO_ISSUE',
    message: null,
    createdAt: '2026-06-07T10:00:00.000Z',
    ...overrides,
  }
}

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
    events: [],
    ...overrides,
  }
}

afterEach(() => {
  vi.clearAllMocks()
})

// ── getInvoiceEventLabel ───────────────────────────────────────────────────────

describe('getInvoiceEventLabel', () => {
  it('returns "Nota criada" for CREATED', () => {
    expect(getInvoiceEventLabel('CREATED')).toBe('Nota criada')
  })

  it('returns "Nota atualizada" for UPDATED', () => {
    expect(getInvoiceEventLabel('UPDATED')).toBe('Nota atualizada')
  })

  it('returns "Status alterado" for STATUS_CHANGE', () => {
    expect(getInvoiceEventLabel('STATUS_CHANGE')).toBe('Status alterado')
  })

  it('returns "Nota emitida" for ISSUED', () => {
    expect(getInvoiceEventLabel('ISSUED')).toBe('Nota emitida')
  })

  it('returns "Nota cancelada" for CANCELED', () => {
    expect(getInvoiceEventLabel('CANCELED')).toBe('Nota cancelada')
  })

  it('returns "Erro fiscal" for ERROR', () => {
    expect(getInvoiceEventLabel('ERROR')).toBe('Erro fiscal')
  })

  it('returns "Evento registrado" fallback for unknown event type', () => {
    expect(getInvoiceEventLabel('SOME_UNKNOWN_EVENT')).toBe('Evento registrado')
  })

  it('returns "Evento registrado" fallback for empty string', () => {
    expect(getInvoiceEventLabel('')).toBe('Evento registrado')
  })
})

// ── InvoiceDetails ────────────────────────────────────────────────────────────

describe('InvoiceDetails', () => {
  // ── Heading and structure ──────────────────────────────────────────────────

  it('renders "Detalhes da nota fiscal" semantic heading', () => {
    render(<InvoiceDetails invoice={makeInvoice()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Detalhes da nota fiscal' })).toBeInTheDocument()
  })

  it('renders "Dados do serviço" section heading', () => {
    render(<InvoiceDetails invoice={makeInvoice()} onClose={vi.fn()} />)
    expect(screen.getByText('Dados do serviço')).toBeInTheDocument()
  })

  it('renders "Linha do tempo" section heading', () => {
    render(<InvoiceDetails invoice={makeInvoice()} onClose={vi.fn()} />)
    expect(screen.getByText('Linha do tempo')).toBeInTheDocument()
  })

  // ── Environment subtitle ────────────────────────────────────────────────────

  it('renders "Local/Simulação" subtitle for LOCAL environment', () => {
    render(<InvoiceDetails invoice={makeInvoice({ environment: 'LOCAL' })} onClose={vi.fn()} />)
    expect(screen.getByText(/Local\/Simulação/)).toBeInTheDocument()
  })

  it('renders "Sandbox" subtitle for SANDBOX environment', () => {
    render(<InvoiceDetails invoice={makeInvoice({ environment: 'SANDBOX' })} onClose={vi.fn()} />)
    expect(screen.getByText(/Sandbox/)).toBeInTheDocument()
  })

  it('renders "Produção" subtitle for PRODUCTION environment', () => {
    render(
      <InvoiceDetails invoice={makeInvoice({ environment: 'PRODUCTION' })} onClose={vi.fn()} />,
    )
    expect(screen.getByText(/Produção/)).toBeInTheDocument()
  })

  // ── Status badge ────────────────────────────────────────────────────────────

  it('renders Portuguese status label "Rascunho" for DRAFT', () => {
    render(<InvoiceDetails invoice={makeInvoice({ status: 'DRAFT' })} onClose={vi.fn()} />)
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('renders Portuguese status label "Emitida" for ISSUED', () => {
    render(<InvoiceDetails invoice={makeInvoice({ status: 'ISSUED' })} onClose={vi.fn()} />)
    expect(screen.getByText('Emitida')).toBeInTheDocument()
  })

  it('renders Portuguese status label "Falhou" for FAILED', () => {
    render(<InvoiceDetails invoice={makeInvoice({ status: 'FAILED' })} onClose={vi.fn()} />)
    expect(screen.getByText('Falhou')).toBeInTheDocument()
  })

  // ── Customer info ───────────────────────────────────────────────────────────

  it('renders customer name', () => {
    render(<InvoiceDetails invoice={makeInvoice()} onClose={vi.fn()} />)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('renders customer document', () => {
    render(<InvoiceDetails invoice={makeInvoice()} onClose={vi.fn()} />)
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument()
  })

  it('renders "Sem documento" when customerDocument is null', () => {
    render(<InvoiceDetails invoice={makeInvoice({ customerDocument: null })} onClose={vi.fn()} />)
    expect(screen.getByText('Sem documento')).toBeInTheDocument()
  })

  it('renders long customer name without crashing', () => {
    const longName = 'A'.repeat(200)
    render(<InvoiceDetails invoice={makeInvoice({ customerName: longName })} onClose={vi.fn()} />)
    expect(screen.getByText(longName)).toBeInTheDocument()
  })

  // ── Amount ──────────────────────────────────────────────────────────────────

  it('renders formatted BRL amount for 25000 cents', () => {
    render(<InvoiceDetails invoice={makeInvoice({ amountCents: 25000 })} onClose={vi.fn()} />)
    expect(screen.getByText(/250/)).toBeInTheDocument()
  })

  // ── Service data ────────────────────────────────────────────────────────────

  it('renders service description', () => {
    render(<InvoiceDetails invoice={makeInvoice()} onClose={vi.fn()} />)
    expect(screen.getByText('Consulta odontológica')).toBeInTheDocument()
  })

  it('renders dash when serviceCode is null', () => {
    render(<InvoiceDetails invoice={makeInvoice({ serviceCode: null })} onClose={vi.fn()} />)
    expect(screen.getByText(/Código de serviço: -/)).toBeInTheDocument()
  })

  it('renders serviceCode value when present', () => {
    render(<InvoiceDetails invoice={makeInvoice({ serviceCode: '04.12' })} onClose={vi.fn()} />)
    expect(screen.getByText(/04\.12/)).toBeInTheDocument()
  })

  // ── Close button accessibility ──────────────────────────────────────────────

  it('close button has aria-label "Fechar detalhes da nota fiscal"', () => {
    render(<InvoiceDetails invoice={makeInvoice()} onClose={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: 'Fechar detalhes da nota fiscal' }),
    ).toBeInTheDocument()
  })

  it('close button calls onClose when clicked', () => {
    const onClose = vi.fn()
    render(<InvoiceDetails invoice={makeInvoice()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar detalhes da nota fiscal' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('onClose is called exactly once per click', () => {
    const onClose = vi.fn()
    render(<InvoiceDetails invoice={makeInvoice()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar detalhes da nota fiscal' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // ── Print button accessibility ─────────────────────────────────────────────

  it('print button has aria-label "Imprimir nota fiscal"', () => {
    render(<InvoiceDetails invoice={makeInvoice()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Imprimir nota fiscal' })).toBeInTheDocument()
  })

  it('print button calls printInvoice with the invoice', () => {
    const invoice = makeInvoice()
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Imprimir nota fiscal' }))
    expect(mockPrintInvoice).toHaveBeenCalledWith(invoice)
  })

  // ── Event timeline — localized labels ─────────────────────────────────────

  it('renders localized "Status alterado" instead of raw "STATUS_CHANGE"', () => {
    const invoice = makeInvoice({
      status: 'ISSUED',
      events: [makeEvent({ eventType: 'STATUS_CHANGE' })],
    })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    expect(screen.getByText('Status alterado')).toBeInTheDocument()
    expect(screen.queryByText('STATUS_CHANGE')).not.toBeInTheDocument()
  })

  it('renders localized "Nota criada" for CREATED event', () => {
    const invoice = makeInvoice({
      events: [makeEvent({ eventType: 'CREATED' })],
    })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    expect(screen.getByText('Nota criada')).toBeInTheDocument()
  })

  it('renders localized "Nota emitida" for ISSUED event', () => {
    const invoice = makeInvoice({
      status: 'DRAFT',
      events: [makeEvent({ eventType: 'ISSUED' })],
    })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    expect(screen.getByText('Nota emitida')).toBeInTheDocument()
  })

  it('renders localized "Erro fiscal" for ERROR event', () => {
    const invoice = makeInvoice({
      events: [makeEvent({ eventType: 'ERROR' })],
    })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    expect(screen.getByText('Erro fiscal')).toBeInTheDocument()
  })

  it('renders "Evento registrado" fallback for unknown event type', () => {
    const invoice = makeInvoice({
      events: [makeEvent({ eventType: 'SOMETHING_UNKNOWN' })],
    })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    expect(screen.getByText('Evento registrado')).toBeInTheDocument()
    expect(screen.queryByText('SOMETHING_UNKNOWN')).not.toBeInTheDocument()
  })

  it('renders event message when present', () => {
    const invoice = makeInvoice({
      events: [makeEvent({ message: 'Erro ao emitir nota junto ao provedor.' })],
    })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    expect(screen.getByText('Erro ao emitir nota junto ao provedor.')).toBeInTheDocument()
  })

  it('does not render spurious text when event message is null', () => {
    const invoice = makeInvoice({
      events: [makeEvent({ message: null })],
    })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    expect(screen.queryByText('null')).not.toBeInTheDocument()
  })

  it('renders status transition labels in event row', () => {
    const invoice = makeInvoice({
      status: 'ISSUED',
      events: [
        makeEvent({
          eventType: 'STATUS_CHANGE',
          previousStatus: 'DRAFT',
          nextStatus: 'READY_TO_ISSUE',
        }),
      ],
    })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    // Both labels appear inside the event row's transition text
    expect(screen.getByText(/Rascunho/)).toBeInTheDocument()
    expect(screen.getByText(/Pronta para emissão/)).toBeInTheDocument()
  })

  it('renders dash for missing previousStatus in event transition', () => {
    const invoice = makeInvoice({
      events: [makeEvent({ previousStatus: null, nextStatus: 'DRAFT' })],
    })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    // Transition text: "- → Rascunho · date" — dash is present before the arrow
    expect(screen.getByText(/- →/)).toBeInTheDocument()
  })

  it('keeps an event without a destination status visible in the timeline', () => {
    render(
      <InvoiceDetails
        invoice={makeInvoice({
          events: [
            makeEvent({
              previousStatus: 'DRAFT',
              nextStatus: null,
              message: 'Aguardando resposta do provedor',
            }),
          ],
        })}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText(/Rascunho → -/)).toBeInTheDocument()
    expect(screen.getByText('Aguardando resposta do provedor')).toBeInTheDocument()
  })

  // ── Empty timeline state ────────────────────────────────────────────────────

  it('renders dashed empty state when events array is empty', () => {
    render(<InvoiceDetails invoice={makeInvoice({ events: [] })} onClose={vi.fn()} />)
    expect(screen.getByText('Nenhum evento registrado.')).toBeInTheDocument()
  })

  it('renders dashed empty state when events is undefined', () => {
    render(<InvoiceDetails invoice={makeInvoice({ events: undefined })} onClose={vi.fn()} />)
    expect(screen.getByText('Nenhum evento registrado.')).toBeInTheDocument()
  })

  it('does not render empty state when events are present', () => {
    const invoice = makeInvoice({ events: [makeEvent()] })
    render(<InvoiceDetails invoice={invoice} onClose={vi.fn()} />)
    expect(screen.queryByText('Nenhum evento registrado.')).not.toBeInTheDocument()
  })
})
