import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { ListPageShell } from '@/components/common/ListPageShell'

describe('ListPageShell', () => {
  it('renders children when not loading, no error, and not empty', () => {
    render(
      <ListPageShell isLoading={false}>
        <p>Conteúdo da lista</p>
      </ListPageShell>,
    )
    expect(screen.getByText('Conteúdo da lista')).toBeInTheDocument()
  })

  it('shows the loading state and hides children', () => {
    render(
      <ListPageShell isLoading loadingMessage="Buscando pacientes...">
        <p>Conteúdo da lista</p>
      </ListPageShell>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Buscando pacientes...')
    expect(screen.queryByText('Conteúdo da lista')).not.toBeInTheDocument()
  })

  it('uses the default loading message', () => {
    render(
      <ListPageShell isLoading>
        <p>x</p>
      </ListPageShell>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Carregando...')
  })

  it('shows the empty state when isEmpty and not loading', () => {
    render(
      <ListPageShell isLoading={false} isEmpty emptyState={<p>Nada encontrado</p>}>
        <p>Conteúdo da lista</p>
      </ListPageShell>,
    )
    expect(screen.getByText('Nada encontrado')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo da lista')).not.toBeInTheDocument()
  })

  it('falls back to children when isEmpty is true but no emptyState is provided', () => {
    render(
      <ListPageShell isLoading={false} isEmpty>
        <p>Conteúdo da lista</p>
      </ListPageShell>,
    )
    expect(screen.getByText('Conteúdo da lista')).toBeInTheDocument()
  })

  it('shows an error message without a retry button when onRetry is not provided', () => {
    render(
      <ListPageShell isLoading={false} error="Falha ao carregar">
        <p>Conteúdo</p>
      </ListPageShell>,
    )
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /tentar novamente/i })).not.toBeInTheDocument()
  })

  it('shows a retry button that calls onRetry when clicked', async () => {
    const onRetry = vi.fn()
    render(
      <ListPageShell isLoading={false} error="Falha ao carregar" onRetry={onRetry}>
        <p>Conteúdo</p>
      </ListPageShell>,
    )
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('does not show the error while loading', () => {
    render(
      <ListPageShell isLoading error="Falha ao carregar">
        <p>Conteúdo</p>
      </ListPageShell>,
    )
    expect(screen.queryByText('Falha ao carregar')).not.toBeInTheDocument()
  })
})
