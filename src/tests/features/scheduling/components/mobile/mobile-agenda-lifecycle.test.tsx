import { MobileAgendaList } from '@/features/scheduling/components/mobile/MobileAgendaList'
import { MobileAgendaTimeline } from '@/features/scheduling/components/mobile/MobileAgendaTimeline'
import type { Appointment } from '@/features/scheduling/types/scheduling.types'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { fireEvent, render, screen } from '@/test-utils/render-utils'

describe.each([
  ['list', MobileAgendaList],
  ['timeline', MobileAgendaTimeline],
] as const)('%s date lifecycle', (_, Agenda) => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T15:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('chooses the first day outside the current week and returns to today when appropriate', () => {
    const props = { appointments: [], onAppointmentClick: vi.fn() }
    const { rerender } = render(<Agenda {...props} weekStart={new Date(2026, 5, 1)} />)
    expect(screen.getByRole('button', { name: /seg 1/i })).toHaveAttribute('aria-pressed', 'true')
    rerender(<Agenda {...props} weekStart={new Date(2026, 4, 25)} />)
    expect(screen.getByRole('button', { name: /ter 26/i })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: /qua 27/i }))
    expect(screen.getByRole('button', { name: /qua 27/i })).toHaveAttribute('aria-pressed', 'true')
    rerender(<Agenda {...props} weekStart={new Date(2026, 5, 1)} />)
    expect(screen.getByRole('button', { name: /seg 1/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('identifies a controlled date outside the displayed week', () => {
    render(
      <Agenda
        appointments={[]}
        onAppointmentClick={vi.fn()}
        weekStart={new Date(2026, 4, 25)}
        selectedDate="2026-06-15"
      />,
    )
    expect(screen.getByText('2026-06-15')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma consulta agendada neste dia.')).toBeInTheDocument()
  })

  it('keeps incomplete appointment times usable and identifies canceled consultations', () => {
    const incomplete = makeAppointment({ id: 'missing', patientName: 'Sem horário' })
    const second = makeAppointment({ id: 'missing-two', patientName: 'Outro sem horário' })
    const canceled = makeAppointment({
      id: 'canceled',
      patientName: 'Ana cancelada',
      status: 'CANCELED',
      service: {
        id: 'clean',
        name: 'Limpeza',
        durationMinutes: 30,
        priceFrom: null,
        priceTo: null,
      },
      profile: { id: 'prof', displayName: 'Dra. Maria', userId: null },
    })
    // Simulate an incomplete runtime response while preserving the production contract.
    const appointments = [
      { ...incomplete, startTime: undefined, endTime: undefined },
      { ...canceled, endTime: undefined },
      { ...second, startTime: undefined, endTime: undefined },
    ] as unknown as Appointment[]
    const onAppointmentClick = vi.fn()
    render(
      <Agenda
        appointments={appointments}
        onAppointmentClick={onAppointmentClick}
        weekStart={new Date(2026, 4, 25)}
      />,
    )
    expect(screen.getByText('Sem horário')).toBeInTheDocument()
    expect(screen.getByText('Outro sem horário')).toBeInTheDocument()
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
    expect(screen.getByText('Limpeza')).toBeInTheDocument()
    expect(screen.getByText('Dra. Maria')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Ana cancelada'))
    expect(onAppointmentClick).toHaveBeenCalledWith(appointments[1])
  })
})
