import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/components/common/BrandLogo', () => ({
  BrandLogo: () => <img alt="logo" />,
}))

import { AuthHeader } from '@/features/auth/components/AuthHeader'

describe('AuthHeader', () => {
  it('renders the brand link and a back-to-site button', () => {
    render(<AuthHeader />)
    expect(screen.getByText('DentalFlow')).toBeInTheDocument()
    const backLink = screen.getByRole('link', { name: /voltar ao site/i })
    expect(backLink).toHaveAttribute('href', '/')
  })
})
