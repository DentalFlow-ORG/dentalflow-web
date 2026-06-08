import { render, screen, waitFor } from '@/test-utils/render-utils'
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

import { listAppointmentsForInvoice } from '@/features/fiscal/services/fiscal.service'
import { AppointmentInvoicePickerModal } from '@/features/fiscal/components/AppointmentInvoicePickerModal'

const mockList = listAppointmentsForInvoice as ReturnType<typeof vi.fn>

const emptyResponse = { data: [], total: 0, page: 1, limit: 20 }

function renderModal(open = true) {
  return render(
    <AppointmentInvoicePickerModal open={open} onClose={vi.fn()} onSelect={vi.fn()} />,
  )
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
        screen.getByText(
          'Selecione a consulta para preencher automaticamente os dados da nota.',
        ),
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
})
