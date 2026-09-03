import { render, screen } from '@/test-utils/render-utils'

import { StatusBadge } from '@/components/common/StatusBadge'

describe('StatusBadge', () => {
  it('renders children', () => {
    render(<StatusBadge>Ativo</StatusBadge>)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it.each(['success', 'muted', 'warning', 'danger'] as const)(
    'renders the %s tone without crashing',
    (tone) => {
      render(<StatusBadge tone={tone}>Status</StatusBadge>)
      expect(screen.getByText('Status')).toBeInTheDocument()
    },
  )

  it('defaults to the muted tone', () => {
    render(<StatusBadge>Default</StatusBadge>)
    expect(screen.getByText('Default')).toHaveClass('bg-slate-100')
  })
})
