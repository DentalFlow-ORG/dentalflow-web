import type { ReactNode } from 'react'

import { render, screen } from '@/test-utils/render-utils'

let mockHash = ''
vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ hash: mockHash }),
}))

vi.mock('@/features/marketing/components/PublicLayout', () => ({
  PublicLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/marketing/components/AnimatedImpactSection', () => ({
  AnimatedImpactSection: () => <div>AnimatedImpactSection</div>,
}))
vi.mock('@/features/marketing/components/DataMigrationSection', () => ({
  DataMigrationSection: () => <div>DataMigrationSection</div>,
}))
vi.mock('@/features/marketing/components/LandingIntegrationsSection', () => ({
  LandingIntegrationsSection: () => <div>LandingIntegrationsSection</div>,
}))
vi.mock('@/features/marketing/components/PricingSection', () => ({
  PricingSection: () => <div>PricingSection</div>,
}))
vi.mock('@/features/marketing/components/SectionDivider', () => ({
  SectionDivider: () => <div />,
}))
vi.mock('@/features/marketing/components/TrialCtaSection', () => ({
  TrialCtaSection: () => <div>TrialCtaSection</div>,
}))
vi.mock('@/features/marketing/components/VideoSection', () => ({
  VideoSection: () => <div>VideoSection</div>,
}))
vi.mock('@/features/marketing/components/landing/DentalArchSection', () => ({
  DentalArchSection: () => <div>DentalArchSection</div>,
}))
vi.mock('@/features/marketing/components/landing/LandingHero', () => ({
  LandingHero: () => <div>LandingHero</div>,
}))
vi.mock('@/features/marketing/components/landing/LandingImageCarouselSection', () => ({
  LandingImageCarouselSection: () => <div>LandingImageCarouselSection</div>,
}))
vi.mock('@/features/marketing/components/landing/ModulesSection', () => ({
  ModulesSection: () => <div id="agenda">ModulesSection</div>,
}))
vi.mock('@/features/marketing/components/landing/ProblemSection', () => ({
  ProblemSection: () => <div>ProblemSection</div>,
}))
vi.mock('@/features/marketing/components/landing/ProductShowcaseSection', () => ({
  ProductShowcaseSection: () => <div>ProductShowcaseSection</div>,
}))
vi.mock('@/features/marketing/components/landing/SolutionSection', () => ({
  SolutionSection: () => <div>SolutionSection</div>,
}))

const mockUsePageMeta = vi.fn()
vi.mock('@/features/marketing/hooks/usePageMeta', () => ({
  usePageMeta: (...args: unknown[]) => mockUsePageMeta(...args),
}))

import { LandingPage } from '@/features/marketing/pages/LandingPage'

describe('LandingPage', () => {
  beforeEach(() => {
    mockHash = ''
    mockUsePageMeta.mockClear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders every section', () => {
    render(<LandingPage />)
    expect(screen.getByText('LandingHero')).toBeInTheDocument()
    expect(screen.getByText('ProblemSection')).toBeInTheDocument()
    expect(screen.getByText('DentalArchSection')).toBeInTheDocument()
    expect(screen.getByText('ModulesSection')).toBeInTheDocument()
    expect(screen.getByText('LandingImageCarouselSection')).toBeInTheDocument()
    expect(screen.getByText('ProductShowcaseSection')).toBeInTheDocument()
    expect(screen.getByText('LandingIntegrationsSection')).toBeInTheDocument()
    expect(screen.getByText('AnimatedImpactSection')).toBeInTheDocument()
    expect(screen.getByText('SolutionSection')).toBeInTheDocument()
    expect(screen.getByText('DataMigrationSection')).toBeInTheDocument()
    expect(screen.getByText('PricingSection')).toBeInTheDocument()
    expect(screen.getByText('VideoSection')).toBeInTheDocument()
    expect(screen.getByText('TrialCtaSection')).toBeInTheDocument()
  })

  it('sets the page title and description via usePageMeta', () => {
    render(<LandingPage />)
    expect(mockUsePageMeta).toHaveBeenCalledWith(
      'DentalFlow | Sistema para clínicas odontológicas',
      expect.stringContaining('Centralize agenda'),
    )
  })

  it('scrolls to the hash target after mount when a hash is present', () => {
    mockHash = '#agenda'
    const target = document.createElement('div')
    target.id = 'agenda'
    const scrollIntoViewSpy = vi.fn()
    target.scrollIntoView = scrollIntoViewSpy
    document.body.appendChild(target)

    render(<LandingPage />)
    vi.advanceTimersByTime(250)

    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: 'start' })
    document.body.removeChild(target)
  })

  it('does not attempt to scroll when there is no hash', () => {
    mockHash = ''
    render(<LandingPage />)
    expect(() => vi.advanceTimersByTime(250)).not.toThrow()
  })

  it('clears the scroll timeout on unmount', () => {
    mockHash = '#agenda'
    const { unmount } = render(<LandingPage />)
    expect(() => unmount()).not.toThrow()
  })
})
