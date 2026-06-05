import { render, screen } from '@/test-utils/render-utils'

import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'

describe('HomeDashboardHeader — content', () => {
  it('renders the title as h1', () => {
    render(<HomeDashboardHeader title="Minha clínica" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Minha clínica' })).toBeInTheDocument()
  })

  it('renders the eyebrow when provided', () => {
    render(<HomeDashboardHeader title="Minha clínica" eyebrow="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('does not render eyebrow when omitted', () => {
    render(<HomeDashboardHeader title="Minha clínica" />)
    // No uppercase label element
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(
      <HomeDashboardHeader
        title="Operação da clínica"
        description="quinta-feira, 4 de junho de 2026"
      />,
    )
    expect(screen.getByText('quinta-feira, 4 de junho de 2026')).toBeInTheDocument()
  })

  it('renders a badge next to the title when provided', () => {
    render(
      <HomeDashboardHeader
        title="Minha clínica"
        badge={<span data-testid="trial-badge">5 dias restantes</span>}
      />,
    )
    expect(screen.getByTestId('trial-badge')).toBeInTheDocument()
  })

  it('renders actions when provided', () => {
    render(
      <HomeDashboardHeader
        title="Minha clínica"
        actions={<button type="button">Novo agendamento</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Novo agendamento' })).toBeInTheDocument()
  })

  it('does not render actions area when omitted', () => {
    render(<HomeDashboardHeader title="Minha clínica" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('HomeDashboardHeader — personalized titles', () => {
  it('supports greeting-style titles for DENTIST', () => {
    render(<HomeDashboardHeader title="Olá, Dra. Silva" eyebrow="Hoje" />)
    expect(screen.getByRole('heading', { name: 'Olá, Dra. Silva' })).toBeInTheDocument()
  })

  it('supports plain titles for OWNER', () => {
    render(<HomeDashboardHeader title="Minha clínica" />)
    expect(screen.getByRole('heading', { name: 'Minha clínica' })).toBeInTheDocument()
  })
})
