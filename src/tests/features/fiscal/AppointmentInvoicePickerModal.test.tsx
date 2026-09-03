import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

vi.mock('@/features/fiscal/services/fiscal.service', () => ({
  listAppointmentsForInvoice: vi.fn(),
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <option value="">{placeholder}</option>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

import { AppointmentInvoicePickerModal } from '@/features/fiscal/components/AppointmentInvoicePickerModal'
import { listAppointmentsForInvoice } from '@/features/fiscal/services/fiscal.service'
import type { AppointmentForInvoice } from '@/features/fiscal/types/fiscal.types'

const mockList = listAppointmentsForInvoice as ReturnType<typeof vi.fn>

const emptyResponse = { data: [], total: 0, page: 1, limit: 20 }

function makeAppointment(overrides: Partial<AppointmentForInvoice> = {}): AppointmentForInvoice {
  return {
    id: 'appt-1',
    patientName: 'Maria Silva',
    patientEmail: null,
    patientPhone: null,
    appointmentDate: '2026-06-10',
    startTime: '10:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    estimatedAmountCents: 10000,
    paidAmountCents: 10000,
    profile: { id: 'p1', displayName: 'Dra. Ana' },
    service: { id: 's1', name: 'Limpeza' },
    hasActiveInvoice: false,
    activeInvoiceId: null,
    ...overrides,
  }
}

function renderModal(open = true) {
  return render(<AppointmentInvoicePickerModal open={open} onClose={vi.fn()} onSelect={vi.fn()} />)
}

describe('AppointmentInvoicePickerModal', () => {
  beforeEach(() => {
    mockList.mockResolvedValue(emptyResponse)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ── Dialog semantics ────────────────────────────────────────────────────────

  it('renders Dialog.Title text', async () => {
    renderModal()
    await waitFor(() => {
      expect(screen.getByText('Gerar nota a partir de consulta')).toBeInTheDocument()
    })
  })

  it('renders Dialog.Description text visible to screen readers', async () => {
    renderModal()
    await waitFor(() => {
      expect(
        screen.getByText('Selecione a consulta para preencher automaticamente os dados da nota.'),
      ).toBeInTheDocument()
    })
  })

  it('dialog content does not carry aria-describedby suppression workaround', async () => {
    renderModal()
    await waitFor(() => {
      screen.getByText('Gerar nota a partir de consulta')
    })
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    // Radix wires aria-describedby automatically when Dialog.Description is present;
    // the attribute must NOT be absent-or-empty (which was the workaround value).
    expect(dialog?.getAttribute('aria-describedby')).not.toBeNull()
    expect(dialog?.getAttribute('aria-describedby')).not.toBe('')
  })

  // ── Loading state accessibility ─────────────────────────────────────────────

  it('loading state has role="status"', () => {
    mockList.mockReturnValue(new Promise(() => {}))
    renderModal()
    const status = document.body.querySelector('[role="status"]')
    expect(status).toBeInTheDocument()
  })

  it('loading state has aria-live="polite"', () => {
    mockList.mockReturnValue(new Promise(() => {}))
    renderModal()
    const status = document.body.querySelector('[role="status"]')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('loading state contains loading text', () => {
    mockList.mockReturnValue(new Promise(() => {}))
    renderModal()
    const status = document.body.querySelector('[role="status"]')
    expect(status?.textContent).toContain('Carregando consultas')
  })

  // ── Closed state ────────────────────────────────────────────────────────────

  it('does not render dialog content when closed', () => {
    renderModal(false)
    expect(screen.queryByText('Gerar nota a partir de consulta')).not.toBeInTheDocument()
  })

  // ── Empty state ─────────────────────────────────────────────────────────────

  it('renders empty state message when no appointments found', async () => {
    renderModal()
    await waitFor(() => {
      expect(screen.getByText('Nenhuma consulta encontrada.')).toBeInTheDocument()
    })
  })

  // ── Controls ────────────────────────────────────────────────────────────────

  it('renders close button with accessible label', async () => {
    renderModal()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
    })
  })

  it('renders search button with accessible label', async () => {
    renderModal()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
    })
  })

  it('patient search input is associated with its label', async () => {
    renderModal()
    await waitFor(() => {
      expect(screen.getByLabelText('Paciente')).toBeInTheDocument()
    })
  })

  // ── Error state ─────────────────────────────────────────────────────────────

  it('shows an error message when loading fails', async () => {
    mockList.mockRejectedValue(new Error('network error'))
    renderModal()
    expect(
      await screen.findByText('Não foi possível carregar as consultas. Tente novamente.'),
    ).toBeInTheDocument()
  })

  // ── Appointment rows ────────────────────────────────────────────────────────

  it('renders appointment details: patient, date, service, dentist, amount', async () => {
    mockList.mockResolvedValue({
      data: [makeAppointment()],
      total: 1,
      page: 1,
      limit: 20,
    })
    renderModal()
    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText(/limpeza/i)).toBeInTheDocument()
    expect(screen.getByText(/dra\. ana/i)).toBeInTheDocument()
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument()
  })

  it('shows a "Nota já existe" badge when the appointment already has an active invoice', async () => {
    mockList.mockResolvedValue({
      data: [makeAppointment({ hasActiveInvoice: true })],
      total: 1,
      page: 1,
      limit: 20,
    })
    renderModal()
    expect(await screen.findByText('Nota já existe')).toBeInTheDocument()
  })

  it('shows a pending-payment badge when paymentStatus is PAYMENT_PENDING', async () => {
    mockList.mockResolvedValue({
      data: [makeAppointment({ paymentStatus: 'PAYMENT_PENDING' })],
      total: 1,
      page: 1,
      limit: 20,
    })
    renderModal()
    const badges = await screen.findAllByText('Pagamento pendente')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('falls back to estimatedAmountCents when paidAmountCents is null', async () => {
    mockList.mockResolvedValue({
      data: [makeAppointment({ paidAmountCents: null, estimatedAmountCents: 5000 })],
      total: 1,
      page: 1,
      limit: 20,
    })
    renderModal()
    expect(await screen.findByText('R$ 50,00')).toBeInTheDocument()
  })

  it('does not render an amount when both amount fields are null', async () => {
    mockList.mockResolvedValue({
      data: [makeAppointment({ paidAmountCents: null, estimatedAmountCents: null })],
      total: 1,
      page: 1,
      limit: 20,
    })
    renderModal()
    await screen.findByText('Maria Silva')
    expect(screen.queryByText(/^R\$/)).not.toBeInTheDocument()
  })

  it('calls onSelect with the appointment id and closes when Selecionar is clicked', async () => {
    mockList.mockResolvedValue({ data: [makeAppointment()], total: 1, page: 1, limit: 20 })
    const onSelect = vi.fn()
    const onClose = vi.fn()
    render(<AppointmentInvoicePickerModal open onClose={onClose} onSelect={onSelect} />)
    await screen.findByText('Maria Silva')
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar' }))
    expect(onSelect).toHaveBeenCalledWith('appt-1')
    expect(onClose).toHaveBeenCalledOnce()
  })

  // ── Search ──────────────────────────────────────────────────────────────────

  it('applies a patient search filter when the search button is clicked', async () => {
    renderModal()
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1))
    await userEvent.type(screen.getByLabelText('Paciente'), 'Ana')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith(
        expect.objectContaining({ patient: 'Ana', page: 1 }),
      ),
    )
  })

  it('applies the search filter when Enter is pressed in the search field', async () => {
    renderModal()
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1))
    const input = screen.getByLabelText('Paciente')
    await userEvent.type(input, 'Bea{Enter}')
    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith(
        expect.objectContaining({ patient: 'Bea', page: 1 }),
      ),
    )
  })

  // ── Payment status filter ───────────────────────────────────────────────────

  it('applies the payment status filter when changed', async () => {
    renderModal()
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1))
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'PAID' },
    })
    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith(
        expect.objectContaining({ paymentStatus: 'PAID', page: 1 }),
      ),
    )
  })

  it('clears the payment status filter when "__all__" is selected', async () => {
    renderModal()
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1))
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'PAID' },
    })
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2))
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '__all__' },
    })
    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith(
        expect.objectContaining({ paymentStatus: undefined, page: 1 }),
      ),
    )
  })

  // ── Pagination ──────────────────────────────────────────────────────────────

  it('renders pagination and advances to the next page', async () => {
    mockList.mockResolvedValue({
      data: [makeAppointment()],
      total: 50,
      page: 1,
      limit: 20,
    })
    renderModal()
    await screen.findByText('Maria Silva')
    expect(screen.getByText('1–20 de 50')).toBeInTheDocument()

    const nextButton = screen.getByRole('button', { name: 'Próxima' })
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(nextButton).toBeEnabled()

    await userEvent.click(nextButton)
    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })),
    )
  })

  it('does not render pagination when total fits within one page', async () => {
    mockList.mockResolvedValue({ data: [makeAppointment()], total: 5, page: 1, limit: 20 })
    renderModal()
    await screen.findByText('Maria Silva')
    expect(screen.queryByText(/de 5$/)).not.toBeInTheDocument()
  })

  // ── Close resets state ──────────────────────────────────────────────────────

  it('resets the search field and filters when closed', async () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <AppointmentInvoicePickerModal open onClose={onClose} onSelect={vi.fn()} />,
    )
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1))
    await userEvent.type(screen.getByLabelText('Paciente'), 'Ana')

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledOnce()

    rerender(<AppointmentInvoicePickerModal open onClose={onClose} onSelect={vi.fn()} />)
    expect(screen.getByLabelText('Paciente')).toHaveValue('')
  })
})
