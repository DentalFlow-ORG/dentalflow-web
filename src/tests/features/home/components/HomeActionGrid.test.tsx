import { render, screen } from '@/test-utils/render-utils'

import { HomeActionGrid } from '@/features/home/components/HomeActionGrid'

describe('HomeActionGrid', () => {
  it('renders children', () => {
    render(
      <HomeActionGrid>
        <p>Item</p>
      </HomeActionGrid>,
    )
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  it('defaults to a 4-column layout on large viewports', () => {
    const { container } = render(
      <HomeActionGrid>
        <p>Item</p>
      </HomeActionGrid>,
    )
    expect(container.firstChild).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-4')
  })

  it('applies a 2-column layout', () => {
    const { container } = render(
      <HomeActionGrid columns={2}>
        <p>Item</p>
      </HomeActionGrid>,
    )
    expect(container.firstChild).toHaveClass('sm:grid-cols-2')
    expect(container.firstChild).not.toHaveClass('lg:grid-cols-3', 'lg:grid-cols-4')
  })

  it('applies a 3-column layout', () => {
    const { container } = render(
      <HomeActionGrid columns={3}>
        <p>Item</p>
      </HomeActionGrid>,
    )
    expect(container.firstChild).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3')
  })

  it('applies a custom className', () => {
    const { container } = render(
      <HomeActionGrid className="custom-class">
        <p>Item</p>
      </HomeActionGrid>,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
