import { render, screen } from '@/test-utils/render-utils'

import { MetricCard } from '@/components/common/MetricCard'

describe('MetricCard', () => {
  it('renders value and label', () => {
    render(<MetricCard value="42" label="Pacientes ativos" />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Pacientes ativos')).toBeInTheDocument()
  })

  it.each(['neutral', 'success', 'danger', 'warning', 'info', 'primary'] as const)(
    'renders the %s tone without crashing',
    (tone) => {
      render(<MetricCard value="10" label="Métrica" tone={tone} />)
      expect(screen.getByText('10')).toBeInTheDocument()
    },
  )
})
