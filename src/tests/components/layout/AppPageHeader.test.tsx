import { render, screen } from '@/test-utils/render-utils'

import { AppPageHeader } from '@/components/layout/AppPageHeader'

describe('AppPageHeader', () => {
  it('renders the title', () => {
    render(<AppPageHeader title="Pacientes" />)
    expect(screen.getByRole('heading', { name: 'Pacientes' })).toBeInTheDocument()
  })

  it('does not render eyebrow, description or action when omitted', () => {
    const { container } = render(<AppPageHeader title="Pacientes" />)
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })

  it('renders the eyebrow when provided', () => {
    render(<AppPageHeader title="Pacientes" eyebrow="Gestão" />)
    expect(screen.getByText('Gestão')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<AppPageHeader title="Pacientes" description="Lista de pacientes ativos" />)
    expect(screen.getByText('Lista de pacientes ativos')).toBeInTheDocument()
  })

  it('renders the action when provided', () => {
    render(<AppPageHeader title="Pacientes" action={<button type="button">Novo</button>} />)
    expect(screen.getByRole('button', { name: 'Novo' })).toBeInTheDocument()
  })
})
