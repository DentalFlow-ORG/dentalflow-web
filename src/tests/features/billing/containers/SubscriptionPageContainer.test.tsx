import { render, screen } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

vi.mock('@/features/billing/components/PricingCard', () => ({
  PricingCard: ({ plan }: { plan: { slug: string; name: string } }) => (
    <div data-testid={`pricing-card-${plan.slug}`}>{plan.name}</div>
  ),
}))

const mockUseSubscriptionPage = vi.fn()
vi.mock('@/features/billing/hooks/useSubscriptionPage', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/billing/hooks/useSubscriptionPage')
  >('@/features/billing/hooks/useSubscriptionPage')
  return {
    ...actual,
    useSubscriptionPage: () => mockUseSubscriptionPage(),
  }
})

import { SubscriptionPageContainer } from '@/features/billing/containers/SubscriptionPageContainer'
import { makeBillingPlan, makeBillingStatus } from '@/test-utils/factories/billing.factory'
import { makeAssistantUser, makeOwnerUser } from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'

function baseHookState(overrides: Partial<ReturnType<typeof defaultState>> = {}) {
  return { ...defaultState(), ...overrides }
}

function defaultState() {
  return {
    plans: [] as ReturnType<typeof makeBillingPlan>[],
    campaign: null,
    billingStatus: null as ReturnType<typeof makeBillingStatus> | null,
    isLoadingPlans: false,
    isLoadingBillingStatus: false,
    plansError: null as string | null,
    billingStatusError: null as string | null,
    billingInterval: 'YEARLY' as const,
    setBillingInterval: vi.fn(),
    checkingOutPlanKey: null,
    startingTrialPlanKey: null,
    changingPlanKey: null,
    isOpeningPortal: false,
    showCancelDialog: false,
    setShowCancelDialog: vi.fn(),
    isCanceling: false,
    canCancel: false,
    isAnyActionPending: false,
    anyPlanHasMonthly: false,
    anyPlanHasYearly: true,
    showIntervalToggle: false,
    handleStartTrial: vi.fn(),
    handleCheckout: vi.fn(),
    handleChangePlan: vi.fn(),
    handlePortal: vi.fn(),
    handleCancelConfirm: vi.fn(),
  }
}

describe('SubscriptionPageContainer', () => {
  beforeEach(() => {
    resetAuthMocks()
    setMockAuthState({ user: makeOwnerUser() })
    mockUseSubscriptionPage.mockReturnValue(baseHookState())
  })

  it('shows the loading state for plans', () => {
    mockUseSubscriptionPage.mockReturnValue(baseHookState({ isLoadingPlans: true }))
    render(<SubscriptionPageContainer />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando planos...')
  })

  it('shows a plans error message', () => {
    mockUseSubscriptionPage.mockReturnValue(baseHookState({ plansError: 'Falha ao carregar' }))
    render(<SubscriptionPageContainer />)
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument()
  })

  it('shows an empty state when there are no plans', () => {
    mockUseSubscriptionPage.mockReturnValue(baseHookState({ plans: [] }))
    render(<SubscriptionPageContainer />)
    expect(screen.getByText('Nenhum plano disponível.')).toBeInTheDocument()
  })

  it('renders a PricingCard for each plan', () => {
    const plans = [
      makeBillingPlan({ id: 'p1', slug: 'starter', name: 'Starter' }),
      makeBillingPlan({ id: 'p2', slug: 'professional', name: 'Professional' }),
    ]
    mockUseSubscriptionPage.mockReturnValue(baseHookState({ plans }))
    render(<SubscriptionPageContainer />)
    expect(screen.getByTestId('pricing-card-starter')).toBeInTheDocument()
    expect(screen.getByTestId('pricing-card-professional')).toBeInTheDocument()
  })

  it('renders the interval toggle only when showIntervalToggle is true', () => {
    const { rerender } = render(<SubscriptionPageContainer />)
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()

    mockUseSubscriptionPage.mockReturnValue(baseHookState({ showIntervalToggle: true }))
    rerender(<SubscriptionPageContainer />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('shows the suspended-access warning with the billingStatus message for an owner', () => {
    mockUseSubscriptionPage.mockReturnValue(
      baseHookState({
        billingStatus: makeBillingStatus({ accessAllowed: false, message: 'Pagamento falhou.' }),
      }),
    )
    render(<SubscriptionPageContainer />)
    expect(screen.getByText('Pagamento falhou.')).toBeInTheDocument()
  })

  it('shows the default suspended-access message when there is no billingStatus.message', () => {
    mockUseSubscriptionPage.mockReturnValue(
      baseHookState({
        billingStatus: makeBillingStatus({ accessAllowed: false, message: '' }),
      }),
    )
    render(<SubscriptionPageContainer />)
    expect(
      screen.getByText(/sua assinatura precisa ser regularizada para continuar/i),
    ).toBeInTheDocument()
  })

  it('shows the non-owner suspended-access message for a non-owner', () => {
    setMockAuthState({ user: makeAssistantUser() })
    mockUseSubscriptionPage.mockReturnValue(
      baseHookState({
        billingStatus: makeBillingStatus({ accessAllowed: false }),
      }),
    )
    render(<SubscriptionPageContainer />)
    expect(screen.getByText(/entre em contato com o proprietário da clínica/i)).toBeInTheDocument()
  })

  it('shows the "view only" notice for non-owners when access is allowed', () => {
    setMockAuthState({ user: makeAssistantUser() })
    mockUseSubscriptionPage.mockReturnValue(
      baseHookState({ billingStatus: makeBillingStatus({ accessAllowed: true }) }),
    )
    render(<SubscriptionPageContainer />)
    expect(
      screen.getByText(/apenas o proprietário da clínica pode iniciar teste grátis/i),
    ).toBeInTheDocument()
  })

  it('does not show the "view only" notice for owners', () => {
    render(<SubscriptionPageContainer />)
    expect(
      screen.queryByText(/apenas o proprietário da clínica pode iniciar teste grátis/i),
    ).not.toBeInTheDocument()
  })

  it('opens the cancel dialog when the current subscription card requests it', async () => {
    mockUseSubscriptionPage.mockReturnValue(
      baseHookState({
        canCancel: true,
        billingStatus: makeBillingStatus({ status: 'active' }),
      }),
    )
    render(<SubscriptionPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar assinatura/i }))
    expect(mockUseSubscriptionPage().setShowCancelDialog).toHaveBeenCalledWith(true)
  })

  it('shows the cancel confirm dialog when showCancelDialog is true', () => {
    mockUseSubscriptionPage.mockReturnValue(baseHookState({ showCancelDialog: true }))
    render(<SubscriptionPageContainer />)
    expect(screen.getByText('Cancelar assinatura')).toBeInTheDocument()
  })

  it('calls handleCancelConfirm when the confirm dialog is confirmed', async () => {
    const handleCancelConfirm = vi.fn()
    mockUseSubscriptionPage.mockReturnValue(
      baseHookState({ showCancelDialog: true, handleCancelConfirm }),
    )
    render(<SubscriptionPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar cancelamento' }))
    expect(handleCancelConfirm).toHaveBeenCalledOnce()
  })
})
