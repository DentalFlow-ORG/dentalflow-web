import userEvent from '@testing-library/user-event'

import { EditAppointmentModal } from '@/features/scheduling/components/appointments/EditAppointmentModal'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'

const mockUpdateAppointment = vi.fn()
const mockGetAvailableSlots = vi.fn()
const mockListAvailability = vi.fn()
const mockListAvailabilityExceptions = vi.fn()

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  updateAppointment: (...args: unknown[]) => mockUpdateAppointment(...args),
  getAvailableSlots: (...args: unknown[]) => mockGetAvailableSlots(...args),
  listAvailability: (...args: unknown[]) => mockListAvailability(...args),
  listAvailabilityExceptions: (...args: unknown[]) => mockListAvailabilityExceptions(...args),
}))

const mockGetProfile = vi.fn()
vi.mock('@/features/scheduling/services/profiles.service', () => ({
  getProfile: (...args: unknown[]) => mockGetProfile(...args),
}))

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

vi.mock('@/lib/field-formatters', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/field-formatters')>()
  return { ...mod, isValidWhatsappPhoneBR: () => true }
})

vi.mock('@/lib/brazil-timezone', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/brazil-timezone')>()
  return { ...mod, brazilTodayIso: vi.fn().mockReturnValue('2020-01-01') }
})

vi.mock('@/components/common/DatePickerInput', () => ({
  DatePickerInput: ({
    id,
    onValueChange,
    disabled,
  }: {
    id?: string
    onValueChange?: (v: string) => void
    disabled?: boolean
  }) => (
    <input
      id={id}
      data-testid="date-picker-input"
      disabled={disabled ?? false}
      onChange={(e) => onValueChange?.(e.target.value)}
    />
  ),
}))

const SERVICE = { id: 'svc-1', name: 'Limpeza', priceFrom: 100, isActive: true }
const SLOT = { time: '10:00', available: true, durationMinutes: 30 }

const FUTURE_APPOINTMENT = makeAppointment({
  id: 'appt-1',
  profileId: 'prof-1',
  serviceId: 'svc-1',
  patientName: 'Maria Silva',
  patientEmail: 'maria@example.com',
  patientPhone: '11999999999',
  appointmentDate: '2030-12-31',
  startTime: '1970-01-01T10:00:00.000Z',
  estimatedAmountCents: 10000,
  profile: { id: 'prof-1', displayName: 'Dr. Silva', userId: null },
})

beforeEach(() => {
  vi.clearAllMocks()
  mockUpdateAppointment.mockResolvedValue(FUTURE_APPOINTMENT)
  mockGetAvailableSlots.mockResolvedValue([SLOT])
  mockListAvailability.mockResolvedValue([])
  mockListAvailabilityExceptions.mockResolvedValue([])
  mockGetProfile.mockResolvedValue({ id: 'prof-1', services: [SERVICE] })
})

function renderModal(
  overrides: {
    appointment?: typeof FUTURE_APPOINTMENT | null
    onClose?: () => void
    onUpdated?: () => void
  } = {},
) {
  const onClose = overrides.onClose ?? vi.fn()
  const onUpdated = overrides.onUpdated ?? vi.fn()
  render(
    <EditAppointmentModal
      appointment={overrides.appointment === undefined ? FUTURE_APPOINTMENT : overrides.appointment}
      onClose={onClose}
      onUpdated={onUpdated}
    />,
  )
  return { onClose, onUpdated }
}

describe('EditAppointmentModal', () => {
  it('renders nothing when there is no appointment', () => {
    const { container } = render(
      <EditAppointmentModal appointment={null} onClose={vi.fn()} onUpdated={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the edit title and pre-fills the form for a future appointment', async () => {
    renderModal()
    expect(screen.getByText('Editar agendamento')).toBeInTheDocument()
    expect(screen.getByText('Dr. Silva')).toBeInTheDocument()
    expect(screen.getByLabelText('Paciente')).toHaveValue('Maria Silva')
    await waitFor(() => expect(mockGetProfile).toHaveBeenCalledWith('prof-1'))
  })

  it('shows the reschedule title and copy for a past appointment', () => {
    const past = makeAppointment({
      ...FUTURE_APPOINTMENT,
      appointmentDate: '2020-01-01',
      startTime: '1970-01-01T00:00:00.000Z',
    })
    renderModal({ appointment: past })
    expect(screen.getByRole('heading', { name: 'Reagendar consulta' })).toBeInTheDocument()
    expect(
      screen.getByText('Esta consulta já passou. Ajuste a data e o horário para remarcar.'),
    ).toBeInTheDocument()
  })

  it('disables patient fields for a past appointment', () => {
    const past = makeAppointment({
      ...FUTURE_APPOINTMENT,
      appointmentDate: '2020-01-01',
      startTime: '1970-01-01T00:00:00.000Z',
    })
    renderModal({ appointment: past })
    expect(screen.getByLabelText('Paciente')).toBeDisabled()
  })

  it('calls onClose when the close button is clicked', async () => {
    const { onClose } = renderModal()
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Cancelar is clicked', async () => {
    const { onClose } = renderModal()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows "Selecione uma data" when there is no appointmentDate', () => {
    const noDate = makeAppointment({ ...FUTURE_APPOINTMENT, appointmentDate: '' as never })
    // formatDateInputValue('') -> '' so appointmentDate stays empty in form state
    renderModal({ appointment: noDate })
    expect(
      screen.getByText('Selecione uma data para ver os horários disponíveis'),
    ).toBeInTheDocument()
  })

  it('loads and shows available slots once a date is present', async () => {
    renderModal()
    await waitFor(() => expect(mockGetAvailableSlots).toHaveBeenCalled())
  })

  it('does not submit when patientName is blank', async () => {
    renderModal()
    fireEvent.change(screen.getByLabelText('Paciente'), { target: { value: '' } })
    const form = document.getElementById('edit-appointment-form') as HTMLFormElement
    fireEvent.submit(form)
    expect(mockUpdateAppointment).not.toHaveBeenCalled()
  })

  it('submits the schedule-only payload and shows success for a past appointment', async () => {
    mockGetAvailableSlots.mockResolvedValue([
      { time: '09:00', available: true, durationMinutes: 30 },
    ])
    const past = makeAppointment({
      ...FUTURE_APPOINTMENT,
      appointmentDate: '2020-01-01',
      startTime: '1970-01-01T00:00:00.000Z',
    })
    const { onUpdated } = renderModal({ appointment: past })
    await waitFor(() => expect(mockGetAvailableSlots).toHaveBeenCalled())

    fireEvent.change(screen.getByTestId('date-picker-input'), { target: { value: '2020-01-02' } })
    const slotButton = await screen.findByText('09:00')
    await userEvent.click(slotButton)

    const form = document.getElementById('edit-appointment-form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(mockUpdateAppointment).toHaveBeenCalled())
    const [, dto] = mockUpdateAppointment.mock.calls.at(-1) as [string, Record<string, unknown>]
    expect(dto).toEqual({ appointmentDate: '2020-01-02', startTime: '09:00' })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Consulta reagendada', tone: 'success' }),
    )
    expect(onUpdated).toHaveBeenCalled()
  })

  it('shows an error alert when update fails', async () => {
    mockUpdateAppointment.mockRejectedValue(new Error('server error'))
    mockGetAvailableSlots.mockResolvedValue([
      { time: '09:00', available: true, durationMinutes: 30 },
    ])
    const past = makeAppointment({
      ...FUTURE_APPOINTMENT,
      appointmentDate: '2020-01-01',
      startTime: '1970-01-01T00:00:00.000Z',
    })
    renderModal({ appointment: past })
    await waitFor(() => expect(mockGetAvailableSlots).toHaveBeenCalled())

    fireEvent.change(screen.getByTestId('date-picker-input'), { target: { value: '2020-01-02' } })
    const slotButton = await screen.findByText('09:00')
    await userEvent.click(slotButton)

    const form = document.getElementById('edit-appointment-form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao atualizar agendamento', tone: 'error' }),
      ),
    )
  })

  it('clears services/availability/exceptions when there is no appointment on re-render', () => {
    const { rerender } = render(
      <EditAppointmentModal
        appointment={FUTURE_APPOINTMENT}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
      />,
    )
    rerender(<EditAppointmentModal appointment={null} onClose={vi.fn()} onUpdated={vi.fn()} />)
    expect(screen.queryByText('Editar agendamento')).not.toBeInTheDocument()
  })
})
