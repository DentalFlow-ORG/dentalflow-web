import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

import { NotFoundPage } from '@/components/common/NotFoundPage'

/**
 * The router used to fall back to its built-in component, which renders a bare
 * English "Not Found" with no layout and no navigation — on a pt-BR product
 * that reads as a broken page rather than a wrong address.
 */
describe('NotFoundPage', () => {
  it('states the problem in Portuguese', () => {
    render(<NotFoundPage />)

    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByText('Erro 404')).toBeInTheDocument()
  })

  it('never shows the English router fallback text', () => {
    render(<NotFoundPage />)

    expect(screen.queryByText('Not Found')).not.toBeInTheDocument()
  })

  it('offers a way out rather than dead-ending', () => {
    render(<NotFoundPage />)

    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Acessar a plataforma' })).toBeInTheDocument()
  })
})
