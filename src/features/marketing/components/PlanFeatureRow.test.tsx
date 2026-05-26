import { render, screen } from '@/test/render-utils'

import { PlanFeatureRow } from './PlanFeatureRow'

describe('PlanFeatureRow', () => {
  it('renders the label and no "Em breve" badge when type="included"', () => {
    render(<PlanFeatureRow label="Agendamento online" type="included" />)
    expect(screen.getByText('Agendamento online')).toBeInTheDocument()
    expect(screen.queryByText('Em breve')).not.toBeInTheDocument()
  })

  it('renders the label and the "Em breve" badge when type="soon"', () => {
    render(<PlanFeatureRow label="Integração WhatsApp" type="soon" />)
    expect(screen.getByText('Integração WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Em breve')).toBeInTheDocument()
  })

  it('has an accessible "não incluído" indication when type="not_included"', () => {
    render(<PlanFeatureRow label="Relatórios avançados" type="not_included" />)
    expect(
      screen.getByRole('listitem', { name: 'Relatórios avançados: não incluído' }),
    ).toBeInTheDocument()
  })

  it('applies line-through to the label when type="not_included"', () => {
    render(<PlanFeatureRow label="Relatórios avançados" type="not_included" />)
    const label = screen.getByText('Relatórios avançados')
    expect(label).toHaveClass('line-through')
  })

  it('renders as an <li> element for all availability types', () => {
    const { rerender } = render(<PlanFeatureRow label="Feature" type="included" />)
    expect(screen.getByRole('listitem')).toBeInTheDocument()

    rerender(<PlanFeatureRow label="Feature" type="not_included" />)
    expect(screen.getByRole('listitem')).toBeInTheDocument()

    rerender(<PlanFeatureRow label="Feature" type="soon" />)
    expect(screen.getByRole('listitem')).toBeInTheDocument()
  })

  it('renders the label successfully with variant="dark"', () => {
    render(<PlanFeatureRow label="Prontuário digital" type="included" variant="dark" />)
    expect(screen.getByText('Prontuário digital')).toBeInTheDocument()
  })
})
