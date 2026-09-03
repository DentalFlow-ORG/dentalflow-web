import { render, screen } from '@/test-utils/render-utils'

import { DayOfWeekLabel } from '@/features/scheduling/components/shared/DayOfWeekLabel'

describe('DayOfWeekLabel', () => {
  it('renders the full label for a known day', () => {
    render(<DayOfWeekLabel day={1} />)
    expect(screen.getByText('Segunda-feira')).toBeInTheDocument()
  })

  it('renders the short label when short is true', () => {
    render(<DayOfWeekLabel day={2} short />)
    expect(screen.getByText('Terça')).toBeInTheDocument()
  })

  it('renders a placeholder for an unknown day', () => {
    render(<DayOfWeekLabel day={9} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders the full label for Sunday (day 0)', () => {
    render(<DayOfWeekLabel day={0} />)
    expect(screen.getByText('Domingo')).toBeInTheDocument()
  })
})
