import { render, screen } from '@/test-utils/render-utils'

import { AppPage } from '@/components/layout/AppPage'

describe('AppPage', () => {
  it('renders children', () => {
    render(
      <AppPage>
        <p>Conteúdo</p>
      </AppPage>,
    )
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  it('uses normal spacing by default', () => {
    const { container } = render(
      <AppPage>
        <p>x</p>
      </AppPage>,
    )
    expect(container.firstChild).toHaveClass('space-y-6')
  })

  it('uses loose spacing when specified', () => {
    const { container } = render(
      <AppPage spacing="loose">
        <p>x</p>
      </AppPage>,
    )
    expect(container.firstChild).toHaveClass('space-y-8')
  })

  it('applies a custom className', () => {
    const { container } = render(
      <AppPage className="custom">
        <p>x</p>
      </AppPage>,
    )
    expect(container.firstChild).toHaveClass('custom')
  })
})
