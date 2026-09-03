import { render, screen } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/components/common/BrandLogo', () => ({
  BrandLogo: () => <img alt="logo" />,
}))

import { BrandLink } from '@/components/brand/BrandLink'

describe('BrandLink', () => {
  const originalLocation = window.location

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      configurable: true,
      writable: true,
    })
  })

  it('renders the company trade name and links to "/" by default', () => {
    render(<BrandLink />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
    expect(screen.getByText('DentalFlow')).toBeInTheDocument()
  })

  it('shows the tagline by default and hides it when compact', () => {
    const { rerender } = render(<BrandLink />)
    expect(screen.getByText('Gestão para clínicas odontológicas')).toBeInTheDocument()

    rerender(<BrandLink compact />)
    expect(screen.queryByText('Gestão para clínicas odontológicas')).not.toBeInTheDocument()
  })

  it('links to a custom destination', () => {
    render(<BrandLink to="/app" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/app')
  })

  it('scrolls to top instead of navigating when already on "/" and `to` is "/"', async () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/' },
      configurable: true,
      writable: true,
    })
    const scrollToSpy = vi.fn()
    window.scrollTo = scrollToSpy

    render(<BrandLink />)
    await userEvent.click(screen.getByRole('link'))
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('does not intercept the click when `to` is not "/"', async () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/' },
      configurable: true,
      writable: true,
    })
    const scrollToSpy = vi.fn()
    window.scrollTo = scrollToSpy

    render(<BrandLink to="/app" />)
    await userEvent.click(screen.getByRole('link'))
    expect(scrollToSpy).not.toHaveBeenCalled()
  })

  it('does not intercept the click when not currently on "/"', async () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/app/pacientes' },
      configurable: true,
      writable: true,
    })
    const scrollToSpy = vi.fn()
    window.scrollTo = scrollToSpy

    render(<BrandLink />)
    await userEvent.click(screen.getByRole('link'))
    expect(scrollToSpy).not.toHaveBeenCalled()
  })
})
