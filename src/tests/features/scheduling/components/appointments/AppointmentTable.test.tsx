import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { AppointmentTable } from '@/features/scheduling/components/appointments/AppointmentTable'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'

describe('AppointmentTable — empty state', () => {
  it('shows the default empty message when there are no appointments', () => {
    render(
      <AppointmentTable
        appointments={[]}
        isActionLoading={false}
        onRowClick={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByText('Nenhum agendamento encontrado')).toBeInTheDocument()
  })

  it('shows a custom empty description', () => {
    render(
      <AppointmentTable
        appointments={[]}
        isActionLoading={false}
        emptyDescription="Sem resultados para os filtros aplicados."
        onRowClick={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByText('Sem resultados para os filtros aplicados.')).toBeInTheDocument()
  })
})

describe('AppointmentTable — rows', () => {
  it('renders patient name, optional email, professional fallback, and service', () => {
    const appt = makeAppointment({
      patientName: 'Ana Souza',
      patientEmail: 'ana@example.com',
      profile: null,
      service: {
        id: 'svc-1',
        name: 'Limpeza',
        durationMinutes: 30,
        priceFrom: null,
        priceTo: null,
      },
    })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getAllByText('Ana Souza')[0]).toBeInTheDocument()
    expect(screen.getAllByText('ana@example.com')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Profissional não informado')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Limpeza')[0]).toBeInTheDocument()
  })

  it('does not render an email line when patientEmail is null', () => {
    const appt = makeAppointment({ patientEmail: null })
    const { container } = render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(container.textContent).not.toContain('@')
  })

  it('shows the profile display name when present', () => {
    const appt = makeAppointment({
      profile: { id: 'p1', displayName: 'Dra. Ana', userId: 'u1' },
    })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getAllByText('Dra. Ana')[0]).toBeInTheDocument()
  })

  it('calls onRowClick when a row is clicked', async () => {
    const onRowClick = vi.fn()
    const appt = makeAppointment({ patientName: 'Ana Souza' })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={onRowClick}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    await userEvent.click(
      screen.getAllByRole('button', { name: /abrir detalhes de ana souza/i })[0],
    )
    expect(onRowClick).toHaveBeenCalledWith(appt)
  })

  it('calls onRowClick on Enter/Space keydown on the row itself', () => {
    const onRowClick = vi.fn()
    const appt = makeAppointment({ patientName: 'Ana Souza' })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={onRowClick}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    const [row] = screen.getAllByRole('button', { name: /abrir detalhes de ana souza/i })
    row.focus()
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(onRowClick).toHaveBeenCalledWith(appt)
  })

  it('ignores keydown bubbling up from a child element', () => {
    const onRowClick = vi.fn()
    const appt = makeAppointment({ patientName: 'Ana Souza' })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={onRowClick}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    const [row] = screen.getAllByRole('button', { name: /abrir detalhes de ana souza/i })
    const child = row.querySelector('td') as HTMLElement
    child.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('ignores other keydown keys', () => {
    const onRowClick = vi.fn()
    const appt = makeAppointment({ patientName: 'Ana Souza' })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={onRowClick}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    const [row] = screen.getAllByRole('button', { name: /abrir detalhes de ana souza/i })
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('does not trigger onRowClick when clicking the status/actions cells', async () => {
    const onRowClick = vi.fn()
    const appt = makeAppointment({ patientName: 'Ana Souza', status: 'COMPLETED' })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={onRowClick}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    await userEvent.click(screen.getAllByText('—')[0])
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('renders the mobile card view with the same data', () => {
    const appt = makeAppointment({
      patientName: 'Ana Souza',
      service: {
        id: 'svc-1',
        name: 'Limpeza',
        durationMinutes: 30,
        priceFrom: null,
        priceTo: null,
      },
    })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    // Both desktop row and mobile card render "Ana Souza" and "Limpeza"
    expect(screen.getAllByText('Ana Souza')).toHaveLength(2)
    expect(screen.getAllByText('Limpeza')).toHaveLength(2)
  })

  it('calls onClick on the mobile card and supports Enter keydown', async () => {
    const onRowClick = vi.fn()
    const appt = makeAppointment({ patientName: 'Ana Souza' })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading={false}
        onRowClick={onRowClick}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    const cards = screen.getAllByRole('button', { name: /abrir detalhes de ana souza/i })
    await userEvent.click(cards[1])
    expect(onRowClick).toHaveBeenCalledTimes(1)

    cards[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    expect(onRowClick).toHaveBeenCalledTimes(2)
  })

  it('passes allowedTransitions and isActionLoading through to the status menu', () => {
    const appt = makeAppointment({ status: 'PENDING' })
    render(
      <AppointmentTable
        appointments={[appt]}
        isActionLoading
        allowedTransitions={['CONFIRMED']}
        onRowClick={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    // Buttons render but should be disabled while isActionLoading is true
    const confirmButtons = screen.getAllByRole('button', { name: /confirmar/i })
    for (const button of confirmButtons) {
      expect(button).toBeDisabled()
    }
  })
})
