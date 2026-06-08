import { CalendarDays } from 'lucide-react'

import { render, screen } from '@/test-utils/render-utils'

import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'

describe('HomeKpiCard — content', () => {
  it('renders the label', () => {
    render(<HomeKpiCard label="Consultas hoje" value="12" />)
    expect(screen.getByText('Consultas hoje')).toBeInTheDocument()
  })

  it('renders the value', () => {
    render(<HomeKpiCard label="Consultas hoje" value="12" />)
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<HomeKpiCard label="Receita" value="R$ 1.250,00" description="vs. R$ 800,00 ontem" />)
    expect(screen.getByText('vs. R$ 800,00 ontem')).toBeInTheDocument()
  })

  it('does not render description when omitted', () => {
    render(<HomeKpiCard label="Receita" value="R$ 1.250,00" />)
    expect(screen.queryByText(/vs\./)).not.toBeInTheDocument()
  })

  it('renders the icon when provided', () => {
    render(<HomeKpiCard label="Consultas" value="5" icon={CalendarDays} />)
    // Icon container is aria-hidden — check it exists in DOM
    const { container } = render(<HomeKpiCard label="Consultas" value="5" icon={CalendarDays} />)
    const iconWrapper = container.querySelector('[aria-hidden="true"]')
    expect(iconWrapper).toBeTruthy()
  })

  it('does not render icon container when icon is omitted', () => {
    const { container } = render(<HomeKpiCard label="Consultas" value="5" />)
    // No icon wrapper div with aria-hidden
    const iconDiv = container.querySelector('.h-8.w-8')
    expect(iconDiv).toBeNull()
  })

  it('handles long values without breaking layout', () => {
    render(<HomeKpiCard label="Faturamento" value="R$ 99.999.999,99" />)
    expect(screen.getByText('R$ 99.999.999,99')).toBeInTheDocument()
  })
})

describe('HomeKpiCard — loading state', () => {
  it('shows a loading placeholder when isLoading is true', () => {
    render(<HomeKpiCard label="Consultas" value="5" isLoading />)
    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument()
  })

  it('does not show the value when isLoading is true', () => {
    render(<HomeKpiCard label="Consultas" value="5" isLoading />)
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('does not show the description when isLoading is true', () => {
    render(<HomeKpiCard label="Consultas" value="5" description="detalhes" isLoading />)
    expect(screen.queryByText('detalhes')).not.toBeInTheDocument()
  })

  it('shows the value (and description) when isLoading is false', () => {
    render(<HomeKpiCard label="Consultas" value="7" description="hoje" isLoading={false} />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('hoje')).toBeInTheDocument()
  })
})

describe('HomeKpiCard — tones', () => {
  it('accepts all valid tones without error', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    tones.forEach((tone) => {
      const { unmount } = render(<HomeKpiCard label="Test" value="0" tone={tone} />)
      expect(screen.getByText('Test')).toBeInTheDocument()
      unmount()
    })
  })
})
