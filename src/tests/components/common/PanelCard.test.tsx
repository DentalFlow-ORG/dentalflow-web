import { render, screen } from '@/test-utils/render-utils'

import { PanelCard } from '@/components/common/PanelCard'

describe('PanelCard', () => {
  it('renders children inside a section', () => {
    render(<PanelCard>Conteúdo</PanelCard>)
    expect(screen.getByText('Conteúdo').closest('section')).toBeInTheDocument()
  })

  it('applies a custom className', () => {
    render(<PanelCard className="custom-class">Conteúdo</PanelCard>)
    expect(screen.getByText('Conteúdo').closest('section')).toHaveClass('custom-class')
  })
})
