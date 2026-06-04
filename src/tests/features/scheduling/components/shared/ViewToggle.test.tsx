import { render, screen, userEvent } from '@/test-utils/render-utils'

import { ViewToggle } from '@/features/scheduling/components/shared/ViewToggle'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ViewToggle — aria-label', () => {
  it('calendar button has aria-label "Calendário semanal"', () => {
    render(<ViewToggle view="calendar" onChange={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: 'Calendário semanal' }),
    ).toBeInTheDocument()
  })

  it('list button has aria-label "Lista"', () => {
    render(<ViewToggle view="calendar" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Lista' })).toBeInTheDocument()
  })
})

describe('ViewToggle — aria-pressed (selected state)', () => {
  it('calendar button is aria-pressed=true when view is calendar', () => {
    render(<ViewToggle view="calendar" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Calendário semanal' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('list button is aria-pressed=false when view is calendar', () => {
    render(<ViewToggle view="calendar" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Lista' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('list button is aria-pressed=true when view is table', () => {
    render(<ViewToggle view="table" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Lista' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('calendar button is aria-pressed=false when view is table', () => {
    render(<ViewToggle view="table" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Calendário semanal' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})

describe('ViewToggle — interaction', () => {
  it('calls onChange with "calendar" when calendar button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ViewToggle view="table" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Calendário semanal' }))
    expect(onChange).toHaveBeenCalledWith('calendar')
  })

  it('calls onChange with "table" when list button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ViewToggle view="calendar" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Lista' }))
    expect(onChange).toHaveBeenCalledWith('table')
  })
})
