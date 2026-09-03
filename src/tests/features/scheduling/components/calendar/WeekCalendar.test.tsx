import userEvent from '@testing-library/user-event'

import { fireEvent, render, screen } from '@/test-utils/render-utils'

// CalendarAppointmentCard has its own dedicated test file. Mocking it here
// avoids a jsdom/css-tree parsing quirk with the calc()-based inline
// positioning styles WeekCalendar computes, which is unrelated to the logic
// under test (week navigation, filtering, day-status styling).
vi.mock('@/features/scheduling/components/calendar/CalendarAppointmentCard', () => ({
  CalendarAppointmentCard: ({
    appointment,
    onClick,
  }: {
    appointment: { id: string; patientName: string }
    onClick: (appointment: unknown) => void
  }) => (
    <button type="button" onClick={() => onClick(appointment)}>
      {appointment.patientName}
    </button>
  ),
}))

import { WeekCalendar } from '@/features/scheduling/components/calendar/WeekCalendar'
import { getBrazilWeekStart } from '@/features/scheduling/utils/time'
import { DEFAULT_APPT_DATE, makeAppointment } from '@/test-utils/factories/appointment.factory'
import { makeAvailability } from '@/test-utils/factories/availability.factory'

const weekStart = getBrazilWeekStart(DEFAULT_APPT_DATE)

describe('WeekCalendar — toolbar navigation', () => {
  it('calls onWeekChange with the previous week', async () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendar
        appointments={[]}
        weekStart={weekStart}
        onWeekChange={onWeekChange}
        onAppointmentClick={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Semana anterior' }))
    const arg = onWeekChange.mock.calls[0][0] as Date
    expect(arg.getTime()).toBeLessThan(weekStart.getTime())
  })

  it('calls onWeekChange with the next week', async () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendar
        appointments={[]}
        weekStart={weekStart}
        onWeekChange={onWeekChange}
        onAppointmentClick={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Próxima semana' }))
    const arg = onWeekChange.mock.calls[0][0] as Date
    expect(arg.getTime()).toBeGreaterThan(weekStart.getTime())
  })

  it('calls onWeekChange with the week containing today when "Hoje" is clicked', async () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendar
        appointments={[]}
        weekStart={weekStart}
        onWeekChange={onWeekChange}
        onAppointmentClick={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Hoje' }))
    expect(onWeekChange).toHaveBeenCalledOnce()
  })

  it('navigates to a manually entered date', async () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendar
        appointments={[]}
        weekStart={weekStart}
        onWeekChange={onWeekChange}
        onAppointmentClick={vi.fn()}
      />,
    )
    const input = screen.getByLabelText('Selecionar data')
    fireEvent.change(input, { target: { value: '01/06/2026' } })
    expect(onWeekChange).toHaveBeenCalled()
    const arg = onWeekChange.mock.calls.at(-1)?.[0] as Date
    expect(arg).toBeInstanceOf(Date)
  })

  it('renders the toolbarAction node when provided', () => {
    render(
      <WeekCalendar
        appointments={[]}
        weekStart={weekStart}
        toolbarAction={<button type="button">Ação extra</button>}
        onWeekChange={vi.fn()}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Ação extra' })).toBeInTheDocument()
  })
})

describe('WeekCalendar — empty vs populated week', () => {
  it('shows the empty-week message when there are no appointments in the visible week', () => {
    render(
      <WeekCalendar
        appointments={[]}
        weekStart={weekStart}
        onWeekChange={vi.fn()}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Nenhuma consulta agendada nesta semana.')).toBeInTheDocument()
  })

  it('filters out appointments outside the visible week', () => {
    const outside = makeAppointment({ id: 'outside', appointmentDate: '2020-01-01' })
    render(
      <WeekCalendar
        appointments={[outside]}
        weekStart={weekStart}
        onWeekChange={vi.fn()}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Nenhuma consulta agendada nesta semana.')).toBeInTheDocument()
  })

  it('renders an appointment card for an appointment within the visible week and handles clicks', async () => {
    const onAppointmentClick = vi.fn()
    const appt = makeAppointment({ patientName: 'Ana Souza' })
    render(
      <WeekCalendar
        appointments={[appt]}
        weekStart={weekStart}
        onWeekChange={vi.fn()}
        onAppointmentClick={onAppointmentClick}
      />,
    )
    expect(screen.queryByText('Nenhuma consulta agendada nesta semana.')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ana Souza' }))
    expect(onAppointmentClick).toHaveBeenCalledWith(expect.objectContaining({ id: appt.id }))
  })
})

describe('WeekCalendar — day status styling', () => {
  it('marks a day as a day off when there is no matching availability', () => {
    const availability = [
      makeAvailability({ id: 'a1', dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }),
    ]
    render(
      <WeekCalendar
        appointments={[]}
        weekStart={weekStart}
        profileAvailability={availability}
        onWeekChange={vi.fn()}
        onAppointmentClick={vi.fn()}
      />,
    )
    // At least one day should render the "Folga" (day-off) label given only
    // Monday has availability configured.
    expect(screen.getAllByText(/folga/i).length).toBeGreaterThan(0)
  })
})
