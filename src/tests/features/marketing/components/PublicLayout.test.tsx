import { act, render, screen } from '@/test-utils/render-utils'

vi.mock('@/features/marketing/components/PublicHeader', () => ({
  PublicHeader: ({ isScrolled, isDarkHero }: { isScrolled?: boolean; isDarkHero?: boolean }) => (
    <div
      data-testid="public-header"
      data-scrolled={String(Boolean(isScrolled))}
      data-darkhero={String(Boolean(isDarkHero))}
    />
  ),
}))

vi.mock('@/components/layout/SiteFooter', () => ({
  SiteFooter: () => <div data-testid="site-footer" />,
}))

const mockUseForceLightTheme = vi.fn()
vi.mock('@/features/theme/useForceLightTheme', () => ({
  useForceLightTheme: () => mockUseForceLightTheme(),
}))

import { PublicLayout } from '@/features/marketing/components/PublicLayout'

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true })
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('PublicLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true })
  })

  it('forces the light theme for public pages', () => {
    render(
      <PublicLayout>
        <p>conteúdo</p>
      </PublicLayout>,
    )
    expect(mockUseForceLightTheme).toHaveBeenCalled()
  })

  it('renders the skip link, header, main content and footer', () => {
    render(
      <PublicLayout>
        <p>conteúdo</p>
      </PublicLayout>,
    )
    expect(screen.getByRole('link', { name: 'Ir ao conteúdo principal' })).toHaveAttribute(
      'href',
      '#main-content',
    )
    expect(screen.getByTestId('public-header')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveTextContent('conteúdo')
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
  })

  it('uses the default white background when no bgClassName is given', () => {
    const { container } = render(
      <PublicLayout>
        <p>conteúdo</p>
      </PublicLayout>,
    )
    expect(container.firstChild).toHaveClass('bg-white', 'min-h-screen', 'overflow-x-hidden')
  })

  it('uses the supplied bgClassName instead of the default background', () => {
    const { container } = render(
      <PublicLayout bgClassName="bg-slate-950 text-white">
        <p>conteúdo</p>
      </PublicLayout>,
    )
    expect(container.firstChild).toHaveClass('bg-slate-950', 'text-white', 'overflow-x-hidden')
    expect(container.firstChild).not.toHaveClass('bg-white')
  })

  it('marks the header as scrolled only past 16px', () => {
    render(
      <PublicLayout>
        <p>conteúdo</p>
      </PublicLayout>,
    )
    expect(screen.getByTestId('public-header')).toHaveAttribute('data-scrolled', 'false')
    scrollTo(16)
    expect(screen.getByTestId('public-header')).toHaveAttribute('data-scrolled', 'false')
    scrollTo(17)
    expect(screen.getByTestId('public-header')).toHaveAttribute('data-scrolled', 'true')
  })

  it('keeps dark-hero mode until the page scrolls past 70px', () => {
    render(
      <PublicLayout darkHero>
        <p>conteúdo</p>
      </PublicLayout>,
    )
    expect(screen.getByTestId('public-header')).toHaveAttribute('data-darkhero', 'true')
    scrollTo(69)
    expect(screen.getByTestId('public-header')).toHaveAttribute('data-darkhero', 'true')
    scrollTo(70)
    expect(screen.getByTestId('public-header')).toHaveAttribute('data-darkhero', 'false')
  })

  it('never enters dark-hero mode when darkHero is not requested', () => {
    render(
      <PublicLayout>
        <p>conteúdo</p>
      </PublicLayout>,
    )
    expect(screen.getByTestId('public-header')).toHaveAttribute('data-darkhero', 'false')
  })

  it('removes the scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(
      <PublicLayout>
        <p>conteúdo</p>
      </PublicLayout>,
    )
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    removeSpy.mockRestore()
  })
})
