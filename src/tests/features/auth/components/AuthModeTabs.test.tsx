import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

import { AuthModeTabs } from '@/features/auth/components/AuthModeTabs'

describe('AuthModeTabs', () => {
  it('renders both tabs', () => {
    render(<AuthModeTabs mode="login" />)
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Criar conta' })).toBeInTheDocument()
  })

  it('highlights the login tab in white text when mode is login', () => {
    render(<AuthModeTabs mode="login" />)
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveClass('text-white')
    expect(screen.getByRole('link', { name: 'Criar conta' })).not.toHaveClass('text-white')
  })

  it('highlights the register tab in white text when mode is register', () => {
    render(<AuthModeTabs mode="register" />)
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveClass('text-white')
    expect(screen.getByRole('link', { name: 'Entrar' })).not.toHaveClass('text-white')
  })

  it('links to /acessar with the corresponding mode', () => {
    render(<AuthModeTabs mode="login" />)
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/acessar')
  })
})
