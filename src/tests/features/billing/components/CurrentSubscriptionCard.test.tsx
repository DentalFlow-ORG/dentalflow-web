import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { CurrentSubscriptionCard } from '@/features/billing/components/CurrentSubscriptionCard'
import { makeBillingStatus } from '@/test-utils/factories/billing.factory'

const baseProps = {
  isLoading: false,
  error: null,
  canCancel: false,
  isOpeningPortal: false,
  isAnyActionPending: false,
  onOpenPortal: vi.fn(),
  onCancel: vi.fn(),
}

describe('CurrentSubscriptionCard', () => {
  it('shows a loading state', () => {
    render(<CurrentSubscriptionCard {...baseProps} billingStatus={null} isLoading />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando assinatura...')
  })

  it('shows an error state', () => {
    render(<CurrentSubscriptionCard {...baseProps} billingStatus={null} error="fail" />)
    expect(
      screen.getByText('Não foi possível carregar sua assinatura. Tente novamente.'),
    ).toBeInTheDocument()
  })

  it('shows an empty state when there is no billing status', () => {
    render(<CurrentSubscriptionCard {...baseProps} billingStatus={null} />)
    expect(screen.getByText('Nenhuma assinatura encontrada.')).toBeInTheDocument()
  })

  it('shows an empty state when status is "missing"', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({ status: 'missing' })}
      />,
    )
    expect(screen.getByText('Nenhuma assinatura encontrada.')).toBeInTheDocument()
  })

  it('renders plan name, billing interval, and access status', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({
          status: 'active',
          planName: 'Professional',
          billingInterval: 'annual',
          accessAllowed: true,
        })}
      />,
    )
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Anual')).toBeInTheDocument()
    expect(screen.getByText('Liberado')).toBeInTheDocument()
  })

  it('shows "Não definido" plan name when null', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({ status: 'active', planName: null })}
      />,
    )
    expect(screen.getByText('Não definido')).toBeInTheDocument()
  })

  it('shows "Mensal" for a monthly billing interval', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({ status: 'active', billingInterval: 'monthly' })}
      />,
    )
    expect(screen.getByText('Mensal')).toBeInTheDocument()
  })

  it('shows "Não definida" for a null billing interval', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({ status: 'active', billingInterval: null })}
      />,
    )
    expect(screen.getAllByText('Não definida').length).toBeGreaterThan(0)
  })

  it('shows "Bloqueado" when access is not allowed', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({ status: 'active', accessAllowed: false })}
      />,
    )
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
  })

  it('shows the trial-end date label while trialing', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({
          status: 'trialing',
          trialEndsAt: '2026-07-01',
          accessAllowed: true,
        })}
      />,
    )
    expect(screen.getByText('Teste até')).toBeInTheDocument()
    expect(screen.getByText(/seu teste grátis termina em/i)).toBeInTheDocument()
  })

  it('shows "Não definida" when trialEndsAt is null while trialing', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({
          status: 'trialing',
          trialEndsAt: null,
          accessAllowed: true,
        })}
      />,
    )
    expect(screen.getAllByText('Não definida').length).toBeGreaterThan(0)
  })

  it('shows the next-billing-date label when not trialing', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({ status: 'active', currentPeriodEnd: '2026-07-01' })}
      />,
    )
    expect(screen.getByText('Próxima cobrança')).toBeInTheDocument()
  })

  it('does not show the trial info box when access is not allowed even while trialing', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({
          status: 'trialing',
          trialEndsAt: '2026-07-01',
          accessAllowed: false,
        })}
      />,
    )
    expect(screen.queryByText(/seu teste grátis termina em/i)).not.toBeInTheDocument()
  })

  it('shows a cancellation-scheduled notice when cancelAtPeriodEnd is true', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({
          status: 'active',
          cancelAtPeriodEnd: true,
          currentPeriodEnd: '2026-08-01',
        })}
      />,
    )
    expect(screen.getByText(/o acesso continua até/i)).toBeInTheDocument()
  })

  it('shows the manage-subscription button only when there is a stripeCustomerId', () => {
    const { rerender } = render(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({ status: 'active', stripeCustomerId: null })}
      />,
    )
    expect(screen.queryByRole('button', { name: /gerenciar assinatura/i })).not.toBeInTheDocument()

    rerender(
      <CurrentSubscriptionCard
        {...baseProps}
        billingStatus={makeBillingStatus({ status: 'active', stripeCustomerId: 'cus_1' })}
      />,
    )
    expect(screen.getByRole('button', { name: /gerenciar assinatura/i })).toBeInTheDocument()
  })

  it('calls onOpenPortal when the manage button is clicked', async () => {
    const onOpenPortal = vi.fn()
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        onOpenPortal={onOpenPortal}
        billingStatus={makeBillingStatus({ status: 'active', stripeCustomerId: 'cus_1' })}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /gerenciar assinatura/i }))
    expect(onOpenPortal).toHaveBeenCalledOnce()
  })

  it('disables the manage button while any action is pending', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        isAnyActionPending
        billingStatus={makeBillingStatus({ status: 'active', stripeCustomerId: 'cus_1' })}
      />,
    )
    expect(screen.getByRole('button', { name: /gerenciar assinatura/i })).toBeDisabled()
  })

  it('shows a spinner instead of the external-link icon while opening the portal', () => {
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        isOpeningPortal
        billingStatus={makeBillingStatus({ status: 'active', stripeCustomerId: 'cus_1' })}
      />,
    )
    expect(
      screen.getByRole('button', { name: /gerenciar assinatura/i }).querySelector('svg'),
    ).toHaveClass('animate-spin')
  })

  it('shows the cancel button only when canCancel is true', () => {
    const { rerender } = render(
      <CurrentSubscriptionCard
        {...baseProps}
        canCancel={false}
        billingStatus={makeBillingStatus()}
      />,
    )
    expect(screen.queryByRole('button', { name: /cancelar assinatura/i })).not.toBeInTheDocument()

    rerender(
      <CurrentSubscriptionCard {...baseProps} canCancel billingStatus={makeBillingStatus()} />,
    )
    expect(screen.getByRole('button', { name: /cancelar assinatura/i })).toBeInTheDocument()
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <CurrentSubscriptionCard
        {...baseProps}
        canCancel
        onCancel={onCancel}
        billingStatus={makeBillingStatus()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /cancelar assinatura/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
