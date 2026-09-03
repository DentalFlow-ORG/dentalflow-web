import { render, screen } from '@/test-utils/render-utils'

import { BackButton } from '@/components/common/BackButton'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

describe('BackButton', () => {
  it('renders the default label and links to the fallback destination', () => {
    render(<BackButton />)
    const link = screen.getByRole('link', { name: /voltar/i })
    expect(link).toHaveAttribute('href', '/app')
  })

  it('links to `to` when provided, ignoring fallbackTo', () => {
    render(<BackButton to="/app/pacientes" fallbackTo="/app" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/app/pacientes')
  })

  it('links to fallbackTo when `to` is not provided', () => {
    render(<BackButton fallbackTo="/app/financeiro" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/app/financeiro')
  })

  it('renders a custom label', () => {
    render(<BackButton label="Voltar para pacientes" />)
    expect(screen.getByRole('link', { name: /voltar para pacientes/i })).toBeInTheDocument()
  })
})
