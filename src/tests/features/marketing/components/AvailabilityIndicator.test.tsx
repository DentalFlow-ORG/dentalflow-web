import { render, screen } from '@/test-utils/render-utils'

import { AvailabilityIndicator } from '@/features/marketing/components/AvailabilityIndicator'

describe('AvailabilityIndicator — pill variant (default)', () => {
  it('renders "Incluído" label for included', () => {
    render(<AvailabilityIndicator availability="included" />)
    expect(screen.getByText('Incluído')).toBeInTheDocument()
  })

  it('renders "Em breve" label for soon', () => {
    render(<AvailabilityIndicator availability="soon" />)
    expect(screen.getByText('Em breve')).toBeInTheDocument()
  })

  it('renders "Não incl." label for not_included', () => {
    render(<AvailabilityIndicator availability="not_included" />)
    expect(screen.getByText('Não incl.')).toBeInTheDocument()
  })
})

describe('AvailabilityIndicator — icon variant', () => {
  it('has accessible label "Incluído" for included', () => {
    render(<AvailabilityIndicator availability="included" variant="icon" />)
    expect(screen.getByLabelText('Incluído')).toBeInTheDocument()
  })

  it('has accessible label "Em breve" for soon', () => {
    render(<AvailabilityIndicator availability="soon" variant="icon" />)
    expect(screen.getByLabelText('Em breve')).toBeInTheDocument()
  })

  it('has accessible label "Não incluído" for not_included', () => {
    render(<AvailabilityIndicator availability="not_included" variant="icon" />)
    expect(screen.getByLabelText('Não incluído')).toBeInTheDocument()
  })
})
