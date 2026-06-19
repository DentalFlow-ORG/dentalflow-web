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
import { act, fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'
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
    fireEvent.click(screen.getByRole('button', { name: /Marcar como pendente/i }))
    await waitFor(() => {
      expect(updateAppointmentPayment).toHaveBeenCalledWith('appt-42', {
        paymentStatus: 'PAYMENT_PENDING',
        estimatedAmountCents: undefined,
        paidAmountCents: undefined,
        paymentMethod: undefined,
        paymentDate: undefined,
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
    fireEvent.click(screen.getByRole('button', { name: /Marcar como pendente/i }))
    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(updated))
  })

  it('shows a success alert', async () => {
    vi.mocked(updateAppointmentPayment).mockResolvedValue(makeAppointment())
    render(
      <AppointmentPaymentSection
        appointment={makeAppointment({ paymentStatus: 'PAID' })}
        onUpdated={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Marcar como pendente/i }))
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
    fireEvent.click(screen.getByRole('button', { name: /Marcar como pendente/i }))
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Não foi possível atualizar o pagamento. Tente novamente.',
        tone: 'error',
      })
    })
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

    fireEvent.click(pendingBtn)

    await waitFor(() => {
      expect(confirmBtn).toBeDisabled()
      expect(pendingBtn).toBeDisabled()
    })

    await act(async () => {
      resolve(makeAppointment())
    })

    expect(confirmBtn).not.toBeDisabled()
    expect(pendingBtn).not.toBeDisabled()
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
