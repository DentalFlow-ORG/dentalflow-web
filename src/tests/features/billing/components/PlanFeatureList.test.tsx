import { render, screen } from '@/test-utils/render-utils'

import { PlanFeatureList } from '@/features/billing/components/PlanFeatureList'
import type { PlanCardFeature } from '@/features/marketing/config/features'

const FEATURES: PlanCardFeature[] = [
  { label: 'Agenda', availability: 'included' },
  { label: 'IA de gestão', availability: 'soon' },
  { label: 'Suporte 24/7', availability: 'not_included' },
]

describe('PlanFeatureList', () => {
  it('renders every feature label', () => {
    render(<PlanFeatureList features={FEATURES} />)
    expect(screen.getByText('Agenda')).toBeInTheDocument()
    expect(screen.getByText('IA de gestão')).toBeInTheDocument()
    expect(screen.getByText('Suporte 24/7')).toBeInTheDocument()
  })

  it('shows the "(em breve)" hint only for soon-availability features', () => {
    render(<PlanFeatureList features={FEATURES} />)
    expect(screen.getByText('(em breve)')).toBeInTheDocument()
  })

  it('applies a custom className', () => {
    const { container } = render(<PlanFeatureList features={FEATURES} className="custom" />)
    expect(container.querySelector('ul')).toHaveClass('custom')
  })
})
