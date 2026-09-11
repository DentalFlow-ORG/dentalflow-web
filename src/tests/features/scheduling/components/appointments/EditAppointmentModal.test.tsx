import userEvent from '@testing-library/user-event'

import { EditAppointmentModal } from '@/features/scheduling/components/appointments/EditAppointmentModal'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { act, fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'

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
  patientPhone: '11987654321',
  appointmentDate: '2030-12-31',
  startTime: '1970-01-01T10:00:00.000Z',
  estimatedAmountCents: 10000,
  profile: { id: 'prof-1', displayName: 'Dr. Silva', userId: null },
})

beforeEach(() => {
  vi.clearAllMocks()
  mockUpdateAppointment.mockReset().mockResolvedValue(FUTURE_APPOINTMENT)
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

describe('EditAppointmentModal — form lifecycle', () => {
  it('submits edited future appointment fields and disables controls until completion', async () => {
    let resolveUpdate!: (appointment: typeof FUTURE_APPOINTMENT) => void
    mockUpdateAppointment.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve
        }),
    )
    const { onClose, onUpdated } = renderModal()
    await screen.findByRole('button', { name: '10:00' })
    fireEvent.change(screen.getByLabelText('Paciente'), { target: { value: '  Ana Silva  ' } })
    fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText(/Telefone/), { target: { value: '21987654321' } })
    fireEvent.change(screen.getByLabelText(/Observações/), { target: { value: '  Retorno  ' } })
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled()
    expect(screen.getByLabelText('Paciente')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(onUpdated).not.toHaveBeenCalled()
    await act(async () => resolveUpdate(FUTURE_APPOINTMENT))
    expect(mockUpdateAppointment).toHaveBeenCalledWith(
      'appt-1',
      expect.objectContaining({
        patientName: 'Ana Silva',
        patientEmail: 'ana@example.com',
        patientPhone: '(21) 98765-4321',
        notes: 'Retorno',
        estimatedAmountCents: 10000,
      }),
    )
    expect(onUpdated).toHaveBeenCalledWith(FUTURE_APPOINTMENT)
    expect(onClose).toHaveBeenCalledOnce()
    expect(mockShowAlert).toHaveBeenCalledWith({ title: 'Agendamento atualizado', tone: 'success' })
  })

  it('rejects an invalid WhatsApp phone before calling the API', async () => {
    renderModal()
    await screen.findByRole('button', { name: '10:00' })
    fireEvent.change(screen.getByLabelText(/Telefone/), { target: { value: '123' } })
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Telefone obrigatório' }),
    )
    expect(mockUpdateAppointment).not.toHaveBeenCalled()
  })

  it('rejects a date before today even if a slot is supplied', async () => {
    renderModal()
    fireEvent.change(screen.getByTestId('date-picker-input'), { target: { value: '2019-12-31' } })
    await userEvent.click(await screen.findByRole('button', { name: '10:00' }))
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Data inválida' }))
    expect(mockUpdateAppointment).not.toHaveBeenCalled()
  })

  it('preserves edits on a non-Error failure and allows retry', async () => {
    mockUpdateAppointment.mockRejectedValueOnce('offline')
    const { onClose } = renderModal()
    await screen.findByRole('button', { name: '10:00' })
    fireEvent.change(screen.getByLabelText('Paciente'), { target: { value: 'Ana Silva' } })
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Erro ao atualizar agendamento',
      description: undefined,
      tone: 'error',
    })
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Paciente')).toHaveValue('Ana Silva')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(mockUpdateAppointment).toHaveBeenCalledTimes(2)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('resets unsaved fields when another appointment is selected and accepts nullable fields', async () => {
    const { rerender } = render(
      <EditAppointmentModal
        appointment={FUTURE_APPOINTMENT}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Paciente'), { target: { value: 'Unsaved edit' } })
    const next = makeAppointment({
      ...FUTURE_APPOINTMENT,
      id: 'next',
      patientName: 'Bruno',
      patientEmail: null,
      patientPhone: null,
      notes: null,
      estimatedAmountCents: null,
      serviceId: null,
      profile: undefined,
    })
    rerender(<EditAppointmentModal appointment={next} onClose={vi.fn()} onUpdated={vi.fn()} />)
    expect(screen.getByLabelText('Paciente')).toHaveValue('Bruno')
    expect(screen.getByLabelText(/E-mail/)).toHaveValue('')
    expect(screen.getByLabelText(/Telefone/)).toHaveValue('')
    expect(screen.getByLabelText(/Observações/)).toHaveValue('')
    expect(screen.getByText('Profissional não informado')).toBeInTheDocument()
    await screen.findByRole('button', { name: '10:00' })
  })
})

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
