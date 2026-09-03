import { render, screen } from '@/test-utils/render-utils'

import { BillingStatusBadge } from '@/features/billing/components/BillingStatusBadge'

describe('BillingStatusBadge', () => {
  it('renders the label for a known status', () => {
    render(<BillingStatusBadge status="active" />)
    expect(screen.getByText('Ativa')).toBeInTheDocument()
  })

  it('renders the "cancelamento agendado" label when cancelAtPeriodEnd is true, regardless of status', () => {
    render(<BillingStatusBadge status="active" cancelAtPeriodEnd />)
    expect(screen.getByText('Cancelamento agendado')).toBeInTheDocument()
  })

  it('defaults cancelAtPeriodEnd to false', () => {
    render(<BillingStatusBadge status="past_due" />)
    expect(screen.getByText('Pagamento pendente')).toBeInTheDocument()
  })
})
