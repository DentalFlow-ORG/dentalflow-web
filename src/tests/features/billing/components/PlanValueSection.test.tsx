import { render, screen } from '@/test-utils/render-utils'

import { PlanValueSection } from '@/features/billing/components/PlanValueSection'

describe('PlanValueSection', () => {
  it('renders all four value items', () => {
    render(<PlanValueSection />)
    expect(screen.getByText('Agenda digital')).toBeInTheDocument()
    expect(screen.getByText('Financeiro organizado')).toBeInTheDocument()
    expect(screen.getByText('Prontuário digital')).toBeInTheDocument()
    expect(screen.getByText('Suporte na implantação')).toBeInTheDocument()
  })
})
