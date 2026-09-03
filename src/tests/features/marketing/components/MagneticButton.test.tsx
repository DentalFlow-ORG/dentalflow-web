import { fireEvent, render, screen } from '@/test-utils/render-utils'

let mockReduced = false
vi.mock('@/features/marketing/lib/motion', async () => {
  const actual = await vi.importActual<typeof import('@/features/marketing/lib/motion')>(
    '@/features/marketing/lib/motion',
  )
  return {
    ...actual,
    usePrefersReducedMotion: () => mockReduced,
  }
})

import { MagneticButton } from '@/features/marketing/components/landing/MagneticButton'

describe('MagneticButton', () => {
  beforeEach(() => {
    mockReduced = false
  })

  it('renders its children', () => {
    render(
      <MagneticButton>
        <button type="button">Começar agora</button>
      </MagneticButton>,
    )
    expect(screen.getByRole('button', { name: 'Começar agora' })).toBeInTheDocument()
  })

  it('applies a custom className to the wrapper', () => {
    const { container } = render(
      <MagneticButton className="custom-wrap">
        <span>x</span>
      </MagneticButton>,
    )
    expect(container.firstChild).toHaveClass('custom-wrap')
  })

  it('does not throw on pointer move / leave when motion is enabled', () => {
    const { container } = render(
      <MagneticButton>
        <span>x</span>
      </MagneticButton>,
    )
    const wrapper = container.firstChild as Element
    expect(() => {
      fireEvent.pointerMove(wrapper, { clientX: 120, clientY: 80 })
      fireEvent.pointerLeave(wrapper)
    }).not.toThrow()
  })

  it('does not throw on pointer move when reduced motion is preferred', () => {
    mockReduced = true
    const { container } = render(
      <MagneticButton>
        <span>x</span>
      </MagneticButton>,
    )
    const wrapper = container.firstChild as Element
    expect(() => {
      fireEvent.pointerMove(wrapper, { clientX: 120, clientY: 80 })
    }).not.toThrow()
  })

  it('accepts a custom strength prop without crashing', () => {
    const { container } = render(
      <MagneticButton strength={0.8}>
        <span>x</span>
      </MagneticButton>,
    )
    const wrapper = container.firstChild as Element
    expect(() => fireEvent.pointerMove(wrapper, { clientX: 50, clientY: 50 })).not.toThrow()
  })
})
