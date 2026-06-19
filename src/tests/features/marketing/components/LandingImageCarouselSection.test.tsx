import { LazyMotion, domAnimation } from 'motion/react'

import { render, screen, userEvent } from '@/test-utils/render-utils'

import { LandingImageCarouselSection } from '@/features/marketing/components/landing/LandingImageCarouselSection'

vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: true }),
}))

function renderSection() {
  return render(
    <LazyMotion features={domAnimation}>
      <LandingImageCarouselSection />
    </LazyMotion>,
  )
}

describe('LandingImageCarouselSection', () => {
  it('renders the section heading', () => {
    renderSection()
    expect(screen.getByRole('heading', { name: /veja o dentalflow em ação/i })).toBeInTheDocument()
  })

  it('renders images with honest illustrative alt text', () => {
    renderSection()
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(1)
    for (const img of images) {
      expect(img).toHaveAttribute('alt', expect.stringMatching(/prévia visual/i))
    }
  })

  it('renders previous and next navigation buttons', () => {
    renderSection()
    expect(screen.getByRole('button', { name: /slide anterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /próximo slide/i })).toBeInTheDocument()
  })

  it('renders dot navigation tabs for each slide', () => {
    renderSection()
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(3)
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('advances to the next slide when Next is clicked', async () => {
    const user = userEvent.setup()
    renderSection()

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')

    await user.click(screen.getByRole('button', { name: /próximo slide/i }))

    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('goes back to the previous slide when Prev is clicked', async () => {
    const user = userEvent.setup()
    renderSection()

    // Advance once then go back.
    await user.click(screen.getByRole('button', { name: /próximo slide/i }))
    await user.click(screen.getByRole('button', { name: /slide anterior/i }))

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('navigates to a specific slide via dot button', async () => {
    const user = userEvent.setup()
    renderSection()

    const tabs = screen.getAllByRole('tab')
    await user.click(tabs[2])
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('shows the honest disclaimer text', () => {
    renderSection()
    expect(screen.getByText(/imagens ilustrativas da experiência dentalflow/i)).toBeInTheDocument()
  })
})
