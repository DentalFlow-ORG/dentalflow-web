import { AppointmentPaymentSection } from '@/features/scheduling/components/appointments/AppointmentPaymentSection'
import { updateAppointmentPayment } from '@/features/scheduling/services/scheduling.service'
import type { Appointment } from '@/features/scheduling/types/scheduling.types'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import {
  makeAssistantUser,
  makeDentistUser,
  makeOwnerUser,
} from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '@/test-utils/render-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockShowAlert = vi.fn()

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  updateAppointmentPayment: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  resetAuthMocks()
})

// "Marcar como pendente" and "Cancelar cobrança" clear the paid amount, so
// both open a confirmation first. This opens it and confirms.
async function requestAndConfirm(action: 'Marcar como pendente' | 'Cancelar cobrança') {
  fireEvent.click(screen.getByRole('button', { name: action }))
  const dialog = await screen.findByRole('dialog')
  fireEvent.click(within(dialog).getByRole('button', { name: action }))
}

// ─── role-based rendering ─────────────────────────────────────────────────────

describe('role-based rendering', () => {
  it('OWNER sees the payment edit form with submit buttons', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<AppointmentPaymentSection appointment={makeAppointment()} onUpdated={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Confirmar pagamento/i })).toBeInTheDocument()
  })

  it('ASSISTANT sees the payment edit form with submit buttons', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    render(<AppointmentPaymentSection appointment={makeAppointment()} onUpdated={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Confirmar pagamento/i })).toBeInTheDocument()
  })

  it('DENTIST sees read-only payment info and no submit buttons', () => {
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
    render(<AppointmentPaymentSection appointment={makeAppointment()} onUpdated={vi.fn()} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Pagamento pendente')).toBeInTheDocument()
  })
})

// ─── read-only display ────────────────────────────────────────────────────────

describe('read-only display', () => {
  beforeEach(() => {
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
  })

  it('shows the payment status badge', () => {
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAID' })}
        onUpdated={vi.fn()}
      />,
    )
    expect(screen.getByText('Pago')).toBeInTheDocument()
  })

  it('shows the paid amount when paidAmountCents is set', () => {
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paidAmountCents: 10000 })}
        onUpdated={vi.fn()}
      />,
    )
    expect(screen.getByText(/R\$ 100,00/)).toBeInTheDocument()
  })

  it('shows payment notes when set', () => {
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentNotes: 'Pago em dinheiro' })}
        onUpdated={vi.fn()}
      />,
    )
    expect(screen.getByText('Pago em dinheiro')).toBeInTheDocument()
  })
})

// ─── validation guard ─────────────────────────────────────────────────────────

describe('validation guard', () => {
  it('shows a validation alert and does not call the service when PAID finalStatus has no paid amount', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    // paymentStatus PAYMENT_PENDING → "Confirmar pagamento" calls handleSubmit('PAID')
    // paidAmountCents null → paid field is empty string → paidCents = undefined → guard fires
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAYMENT_PENDING', paidAmountCents: null })}
        onUpdated={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Confirmar pagamento/i }))
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Valor obrigatório',
      description: 'Informe o valor pago para confirmar o pagamento.',
      tone: 'error',
    })
    expect(updateAppointmentPayment).not.toHaveBeenCalled()
  })
})

// ─── service call ─────────────────────────────────────────────────────────────

describe('service call', () => {
  it('calls updateAppointmentPayment with the correct appointment id and dto', async () => {
    vi.mocked(updateAppointmentPayment).mockResolvedValue(makeAppointment())
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    // paymentStatus PAID → "Marcar como pendente" is visible
    // click → handleSubmit('PAYMENT_PENDING') → guard does not fire for PAYMENT_PENDING
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ id: 'appt-42', paymentStatus: 'PAID' })}
        onUpdated={vi.fn()}
      />,
    )
    await requestAndConfirm('Marcar como pendente')
    await waitFor(() => {
      expect(updateAppointmentPayment).toHaveBeenCalledWith('appt-42', {
        paymentStatus: 'PAYMENT_PENDING',
        estimatedAmountCents: null,
        paidAmountCents: null,
        paymentMethod: null,
        paymentDate: null,
        paymentNotes: undefined,
      })
    })
  })
})

// ─── on success ───────────────────────────────────────────────────────────────

describe('on success', () => {
  beforeEach(() => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  })

  it('calls onUpdated with the updated appointment', async () => {
    const updated = makeAppointment({ id: 'appt-1', paymentStatus: 'PAYMENT_PENDING' })
    vi.mocked(updateAppointmentPayment).mockResolvedValue(updated)
    const onUpdated = vi.fn()
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAID' })}
        onUpdated={onUpdated}
      />,
    )
    await requestAndConfirm('Marcar como pendente')
    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(updated))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('shows a success alert', async () => {
    vi.mocked(updateAppointmentPayment).mockResolvedValue(makeAppointment())
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAID' })}
        onUpdated={vi.fn()}
      />,
    )
    await requestAndConfirm('Marcar como pendente')
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith({
        title: 'Pagamento atualizado',
        description: 'As informações de pagamento foram salvas.',
        tone: 'success',
      })
    })
  })
})

// ─── on error ─────────────────────────────────────────────────────────────────

describe('on error', () => {
  it('shows an error alert when the service call fails', async () => {
    vi.mocked(updateAppointmentPayment).mockRejectedValue(new Error('fail'))
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAID' })}
        onUpdated={vi.fn()}
      />,
    )
    await requestAndConfirm('Marcar como pendente')
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith({
        title: 'Erro ao atualizar pagamento',
        description: 'fail',
        tone: 'error',
      })
    })
    // The confirmation stays open so the user can retry or go back.
    expect(screen.getByRole('dialog', { name: 'Marcar pagamento como pendente?' })).toBeVisible()
  })

  it('falls back to a generic message when the error has no text', async () => {
    vi.mocked(updateAppointmentPayment).mockRejectedValue(null)
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAID' })}
        onUpdated={vi.fn()}
      />,
    )
    await requestAndConfirm('Marcar como pendente')
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Não foi possível atualizar o pagamento. Tente novamente.',
        }),
      ),
    )
  })
})

// ─── loading state ────────────────────────────────────────────────────────────

describe('loading state', () => {
  it('disables submit buttons while the service call is pending and re-enables after resolve', async () => {
    let resolve!: (appt: Appointment) => void
    vi.mocked(updateAppointmentPayment).mockImplementation(
      () =>
        new Promise<Appointment>((r) => {
          resolve = r
        }),
    )
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAID' })}
        onUpdated={vi.fn()}
      />,
    )
    const confirmBtn = screen.getByRole('button', { name: /Confirmar pagamento/i })
    const pendingBtn = screen.getByRole('button', { name: /Marcar como pendente/i })

    expect(confirmBtn).not.toBeDisabled()
    expect(pendingBtn).not.toBeDisabled()

    await requestAndConfirm('Marcar como pendente')

    await waitFor(() => {
      expect(confirmBtn).toBeDisabled()
      expect(pendingBtn).toBeDisabled()
      expect(screen.getByRole('button', { name: /Aguarde/ })).toBeDisabled()
    })

    await act(async () => {
      resolve(makeAppointment())
    })

    expect(confirmBtn).not.toBeDisabled()
    expect(pendingBtn).not.toBeDisabled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ─── conditional buttons ──────────────────────────────────────────────────────

describe('conditional buttons', () => {
  it('does not show "Marcar como pendente" when paymentStatus is PAYMENT_PENDING', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAYMENT_PENDING' })}
        onUpdated={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /Marcar como pendente/i })).not.toBeInTheDocument()
  })
})

describe('payment editing workflow', () => {
  beforeEach(() => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    vi.mocked(updateAppointmentPayment).mockReset().mockResolvedValue(makeAppointment())
  })

  it('validates partial payments, preserves entered values on failure and retries', async () => {
    vi.mocked(updateAppointmentPayment).mockRejectedValueOnce(new Error('offline'))
    const onUpdated = vi.fn()
    render(<AppointmentPaymentSection appointment={makeAppointment()} onUpdated={onUpdated} />)
    const user = userEvent.setup()
    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(screen.getByRole('option', { name: 'Pago parcialmente' }))
    await user.click(screen.getByRole('button', { name: 'Salvar pagamento parcial' }))
    expect(updateAppointmentPayment).not.toHaveBeenCalled()
    expect(mockShowAlert).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: 'Valor obrigatório' }),
    )
    const estimated = screen.getByLabelText(/Valor previsto/)
    const paid = screen.getByLabelText(/Valor pago/)
    fireEvent.change(estimated, { target: { value: '250,00' } })
    fireEvent.change(paid, { target: { value: '125,50' } })
    await user.click(screen.getAllByRole('combobox')[1])
    await user.click(screen.getByRole('option', { name: 'PIX' }))
    fireEvent.change(screen.getByPlaceholderText('Observações sobre o pagamento...'), {
      target: { value: '  Primeira parcela  ' },
    })
    await user.click(screen.getByRole('button', { name: 'Salvar pagamento parcial' }))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenLastCalledWith(
        expect.objectContaining({ title: 'Erro ao atualizar pagamento' }),
      ),
    )
    expect(onUpdated).not.toHaveBeenCalled()
    expect(paid).toHaveValue('125,50')
    await user.click(screen.getByRole('button', { name: 'Salvar pagamento parcial' }))
    await waitFor(() => expect(onUpdated).toHaveBeenCalledOnce())
    expect(updateAppointmentPayment).toHaveBeenLastCalledWith('appt-1', {
      paymentStatus: 'PARTIALLY_PAID',
      estimatedAmountCents: 25000,
      paidAmountCents: 12550,
      paymentMethod: 'PIX',
      paymentDate: undefined,
      paymentNotes: 'Primeira parcela',
    })
  })

  it('cancels collection for a canceled appointment', async () => {
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ status: 'CANCELED' })}
        onUpdated={vi.fn()}
      />,
    )
    await requestAndConfirm('Cancelar cobrança')
    await waitFor(() =>
      expect(updateAppointmentPayment).toHaveBeenCalledWith(
        'appt-1',
        expect.objectContaining({ paymentStatus: 'CANCELED' }),
      ),
    )
  })

  it('explains that cancelling collection clears the paid amount and can be dismissed', async () => {
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ status: 'CANCELED', patientName: 'Ana Souza' })}
        onUpdated={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar cobrança' }))
    const dialog = await screen.findByRole('dialog', { name: 'Cancelar cobrança?' })
    expect(dialog).toHaveTextContent('Ana Souza')
    expect(dialog).toHaveTextContent(
      'o valor pago, a data e a forma de pagamento registrados serão removidos',
    )
    expect(dialog).toHaveTextContent('lançamento financeiro vinculado, se houver, será cancelado')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Voltar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(updateAppointmentPayment).not.toHaveBeenCalled()
  })

  it('reads a thousands-separated amount as cents (regression: "1.250,00" was 125 cents)', async () => {
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAYMENT_PENDING' })}
        onUpdated={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText(/Valor pago/), { target: { value: '125000' } })
    expect(screen.getByLabelText(/Valor pago/)).toHaveValue('1.250,00')
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
    await waitFor(() =>
      expect(updateAppointmentPayment).toHaveBeenCalledWith(
        'appt-1',
        expect.objectContaining({ paymentStatus: 'PAID', paidAmountCents: 125000 }),
      ),
    )
  })

  it('clears a stored estimate and payment method by sending null', async () => {
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({
          paymentStatus: 'PAID',
          paidAmountCents: 10000,
          estimatedAmountCents: 25000,
          paymentMethod: 'PIX',
        })}
        onUpdated={vi.fn()}
      />,
    )
    const user = userEvent.setup()
    expect(screen.getByLabelText(/Valor previsto/)).toHaveValue('250,00')
    fireEvent.change(screen.getByLabelText(/Valor previsto/), { target: { value: '' } })
    await user.click(screen.getByRole('combobox', { name: /Forma de pagamento/ }))
    await user.click(screen.getByRole('option', { name: 'Não informado' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
    await waitFor(() =>
      expect(updateAppointmentPayment).toHaveBeenCalledWith(
        'appt-1',
        expect.objectContaining({ estimatedAmountCents: null, paymentMethod: null }),
      ),
    )
  })

  it('labels every field and caps the financial note at 500 characters', () => {
    render(<AppointmentPaymentSection appointment={makeAppointment()} onUpdated={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: /Status de pagamento/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/Valor previsto/)).toHaveAttribute('inputMode', 'numeric')
    expect(screen.getByLabelText(/Valor pago/)).toHaveAttribute('inputMode', 'numeric')
    expect(screen.getByRole('combobox', { name: /Forma de pagamento/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/Observação financeira/)).toHaveAttribute('maxLength', '500')
  })

  it('reseeds the form when the appointment is updated elsewhere', () => {
    const { rerender } = render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ estimatedAmountCents: 10000, updatedAt: 'v1' })}
        onUpdated={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/Valor previsto/)).toHaveValue('100,00')
    rerender(
      <AppointmentPaymentSection
        appointment={makeAppointment({ estimatedAmountCents: 30000, updatedAt: 'v2' })}
        onUpdated={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/Valor previsto/)).toHaveValue('300,00')
  })

  it('saves a refunded status without requiring a paid amount', async () => {
    render(<AppointmentPaymentSection appointment={makeAppointment()} onUpdated={vi.fn()} />)
    const user = userEvent.setup()
    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(screen.getByRole('option', { name: 'Reembolsado' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
    await waitFor(() =>
      expect(updateAppointmentPayment).toHaveBeenCalledWith(
        'appt-1',
        expect.objectContaining({ paymentStatus: 'REFUNDED', paidAmountCents: undefined }),
      ),
    )
  })

  it('shows payment details to the dentist without exposing editable controls', () => {
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({
          estimatedAmountCents: 25000,
          paidAmountCents: 0,
          paymentMethod: 'PIX',
          paymentDate: '2026-05-26',
          paymentNotes: 'Conferido',
        })}
        onUpdated={vi.fn()}
      />,
    )
    expect(screen.getByText('R$ 250,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument()
    expect(screen.getByText('PIX')).toBeInTheDocument()
    expect(screen.getByText('26/05/2026')).toBeInTheDocument()
    expect(screen.getByText('Conferido')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

// ─── clearing a settled payment (no bypass) ───────────────────────────────────

describe('clearing a settled payment', () => {
  const settled = () =>
    makeAppointment({
      id: 'appt-7',
      status: 'CANCELED',
      patientName: 'Ana Souza',
      paymentStatus: 'PAID',
      paidAmountCents: 25000,
      paymentMethod: 'PIX',
      paymentDate: '2026-09-10',
    })

  beforeEach(() => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  })

  async function chooseStatus(label: string) {
    await userEvent.click(screen.getByLabelText('Status de pagamento'))
    await userEvent.click(await screen.findByRole('option', { name: label }))
  }

  it.each(['Pagamento pendente', 'Cancelado'])(
    'confirms %s selected through the primary action activated by keyboard',
    async (label) => {
      vi.mocked(updateAppointmentPayment).mockResolvedValue(makeAppointment())
      render(<AppointmentPaymentSection appointment={settled()} onUpdated={vi.fn()} />)
      await chooseStatus(label)
      screen.getByRole('button', { name: 'Confirmar pagamento' }).focus()
      await userEvent.keyboard('{Enter}')
      const dialog = await screen.findByRole('dialog')
      expect(updateAppointmentPayment).not.toHaveBeenCalled()
      const action = label === 'Cancelado' ? 'Cancelar cobrança' : 'Marcar como pendente'
      await userEvent.click(within(dialog).getByRole('button', { name: action }))
      expect(updateAppointmentPayment).toHaveBeenCalledWith(
        'appt-7',
        expect.objectContaining({
          paymentStatus: label === 'Cancelado' ? 'CANCELED' : 'PAYMENT_PENDING',
          paidAmountCents: null,
          paymentMethod: null,
          paymentDate: null,
        }),
      )
    },
  )

  it('asks for confirmation when Cancelado is chosen in the select and the main button is used', async () => {
    vi.mocked(updateAppointmentPayment).mockResolvedValue(makeAppointment())
    render(<AppointmentPaymentSection appointment={settled()} onUpdated={vi.fn()} />)
    await chooseStatus('Cancelado')
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))

    const dialog = await screen.findByRole('dialog', { name: 'Cancelar cobrança?' })
    expect(dialog).toHaveTextContent('Ana Souza')
    expect(updateAppointmentPayment).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar cobrança' }))
    await waitFor(() =>
      expect(updateAppointmentPayment).toHaveBeenCalledWith('appt-7', {
        paymentStatus: 'CANCELED',
        estimatedAmountCents: null,
        paidAmountCents: null,
        paymentMethod: null,
        paymentDate: null,
        paymentNotes: undefined,
      }),
    )
  })

  it('clears amount, date and method through the dedicated "Marcar como pendente" action', async () => {
    vi.mocked(updateAppointmentPayment).mockResolvedValue(makeAppointment())
    render(<AppointmentPaymentSection appointment={settled()} onUpdated={vi.fn()} />)
    await requestAndConfirm('Marcar como pendente')
    await waitFor(() =>
      expect(updateAppointmentPayment).toHaveBeenCalledWith(
        'appt-7',
        expect.objectContaining({
          paymentStatus: 'PAYMENT_PENDING',
          paidAmountCents: null,
          paymentMethod: null,
          paymentDate: null,
        }),
      ),
    )
  })

  it('keeps the settled values and sends nothing when the confirmation is dismissed', async () => {
    render(<AppointmentPaymentSection appointment={settled()} onUpdated={vi.fn()} />)
    await chooseStatus('Cancelado')
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
    const dialog = await screen.findByRole('dialog', { name: 'Cancelar cobrança?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Voltar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(updateAppointmentPayment).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/Valor pago/)).toHaveValue('250,00')
  })

  it('sends a single request when the confirmation is clicked repeatedly on a slow request', async () => {
    let resolve!: (appt: Appointment) => void
    vi.mocked(updateAppointmentPayment).mockImplementation(
      () =>
        new Promise<Appointment>((r) => {
          resolve = r
        }),
    )
    render(<AppointmentPaymentSection appointment={settled()} onUpdated={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar cobrança' }))
    const dialog = await screen.findByRole('dialog')
    const confirm = within(dialog).getByRole('button', { name: 'Cancelar cobrança' })
    fireEvent.click(confirm)
    fireEvent.click(confirm)

    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: /Aguarde/ })).toBeDisabled(),
    )
    fireEvent.click(within(dialog).getByRole('button', { name: /Aguarde/ }))
    expect(updateAppointmentPayment).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolve(makeAppointment())
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps the dialog open and usable when the API rejects the change', async () => {
    vi.mocked(updateAppointmentPayment).mockRejectedValue(new Error('Falha ao salvar.'))
    const onUpdated = vi.fn()
    render(<AppointmentPaymentSection appointment={settled()} onUpdated={onUpdated} />)
    await requestAndConfirm('Marcar como pendente')

    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'error', description: 'Falha ao salvar.' }),
      ),
    )
    const dialog = screen.getByRole('dialog', { name: 'Marcar pagamento como pendente?' })
    expect(within(dialog).getByRole('button', { name: 'Marcar como pendente' })).toBeEnabled()
    expect(within(dialog).getByRole('button', { name: 'Voltar' })).toBeEnabled()
    expect(onUpdated).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/Valor pago/)).toHaveValue('250,00')
  })

  it('saves directly, without confirmation, when the status is already canceled', async () => {
    vi.mocked(updateAppointmentPayment).mockResolvedValue(makeAppointment())
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ id: 'appt-8', paymentStatus: 'CANCELED' })}
        onUpdated={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pagamento' }))
    await waitFor(() =>
      expect(updateAppointmentPayment).toHaveBeenCalledWith(
        'appt-8',
        expect.objectContaining({ paymentStatus: 'CANCELED', paidAmountCents: null }),
      ),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
