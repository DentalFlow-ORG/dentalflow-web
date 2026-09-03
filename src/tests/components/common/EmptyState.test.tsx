import { AlertTriangle } from 'lucide-react'

import { render, screen } from '@/test-utils/render-utils'

import { EmptyState } from '@/components/common/EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={AlertTriangle} title="Nada aqui" description="Sem dados ainda." />)
    expect(screen.getByText('Nada aqui')).toBeInTheDocument()
    expect(screen.getByText('Sem dados ainda.')).toBeInTheDocument()
  })

  it('does not render an action wrapper when no action is provided', () => {
    const { container } = render(
      <EmptyState icon={AlertTriangle} title="Nada aqui" description="Sem dados ainda." />,
    )
    expect(container.querySelector('.mt-6')).not.toBeInTheDocument()
  })

  it('renders the action when provided', () => {
    render(
      <EmptyState
        icon={AlertTriangle}
        title="Nada aqui"
        description="Sem dados ainda."
        action={<button type="button">Criar</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })
})
