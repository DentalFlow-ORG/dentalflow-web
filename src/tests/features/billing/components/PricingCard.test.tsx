import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

import { PricingCard } from '@/features/billing/components/PricingCard'
import type { BillingPlan, CurrentBillingStatus } from '@/features/billing/types/billing.types'
import type { PlanCtaState } from '@/features/billing/utils/billing-cta-utils'
import type { PlanCardFeature } from '@/features/marketing/config/features'

function makePlan(overrides: Partial<BillingPlan> = {}): BillingPlan {
  return {
    id: 'plan-1',
    name: 'Professional',
    slug: 'professional',
    description: null,
    priceMonthly: 19900,
    priceYearly: 199000,
    hasMonthlyPrice: true,
    hasYearlyPrice: true,
    trialEligible: true,
    annualDiscountPercent: 15,
    maxProfiles: 5,
    maxLeadsPerMonth: 100,
    maxServicesPerProfile: 50,
    hasAppointments: true,
    hasAnalytics: true,
    hasCustomDomain: false,
    hasPrioritySupport: true,
    displayOrder: 1,
    campaign: {
      enabled: false,
      promotionalPriceMonthly: null,
      compareAtPriceMonthly: null,
      promotionReady: false,
      couponConfigured: false,
    },
    ...overrides,
  }
}

const FEATURES: PlanCardFeature[] = [{ label: 'Agenda inteligente', availability: 'included' }]

function makeCtaState(overrides: Partial<PlanCtaState> = {}): PlanCtaState {
  return {
    primary: {
      label: 'Assinar Professional',
      helperText: 'Cobrança recorrente via Stripe.',
      actionType: 'checkout',
      disabled: false,
      variant: 'default',
    },
    ...overrides,
  }
}

const baseProps = {
  billingInterval: 'MONTHLY' as const,
  features: FEATURES,
  isAvailable: true,
  isCurrentPlan: false,
  isRecommended: false,
  billingStatus: null as CurrentBillingStatus | null,
  checkingOutPlanKey: null,
  startingTrialPlanKey: null,
  changingPlanKey: null,
  onStartTrial: vi.fn(),
  onCheckout: vi.fn(),
  onChangePlan: vi.fn(),
}

describe('PricingCard', () => {
  it('renders the plan name and features', () => {
    render(<PricingCard {...baseProps} plan={makePlan()} ctaState={makeCtaState()} />)
    expect(screen.getByRole('heading', { name: 'Professional' })).toBeInTheDocument()
    expect(screen.getByText('Agenda inteligente')).toBeInTheDocument()
  })

  it('shows the "Plano atual" badge and status badge when isCurrentPlan', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState()}
        isCurrentPlan
        billingStatus={{
          hasSubscription: true,
          status: 'active',
          planKey: 'professional',
          planName: 'Professional',
          billingInterval: 'monthly',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          trialEndsAt: null,
          currentPeriodEnd: '2026-07-15T00:00:00.000Z',
          cancelAtPeriodEnd: false,
          accessAllowed: true,
          requiresPlanSelection: false,
          requiresPayment: false,
          message: '',
        }}
      />,
    )
    expect(screen.getByText('Plano atual')).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(screen.getByText(/próxima cobrança/i)).toBeInTheDocument()
  })

  it('shows the "Recomendado" badge when isRecommended and not current', () => {
    render(<PricingCard {...baseProps} plan={makePlan()} ctaState={makeCtaState()} isRecommended />)
    expect(screen.getByText('Recomendado')).toBeInTheDocument()
  })

  it('shows a fallback message when the plan is not available for the selected interval', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState()}
        isAvailable={false}
      />,
    )
    expect(screen.getByText('Sem preço mensal disponível.')).toBeInTheDocument()
  })

  it('shows the yearly-billing copy when billingInterval is YEARLY', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState()}
        billingInterval="YEARLY"
      />,
    )
    expect(screen.getByText(/plano anual/i)).toBeInTheDocument()
    expect(screen.getByText(/cobrado como/i)).toBeInTheDocument()
  })

  it('shows the "2 meses grátis" copy for a recommended yearly plan', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState()}
        billingInterval="YEARLY"
        isRecommended
      />,
    )
    expect(screen.getByText(/2 meses grátis/i)).toBeInTheDocument()
  })

  it('shows the launch-price block when the campaign is active and promotion-ready', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan({
          campaign: {
            enabled: true,
            promotionalPriceMonthly: 9900,
            compareAtPriceMonthly: 19900,
            promotionReady: true,
            couponConfigured: true,
          },
        })}
        ctaState={makeCtaState()}
      />,
    )
    expect(screen.getByText('Primeiro mês')).toBeInTheDocument()
    expect(screen.getByText(/depois/i)).toBeInTheDocument()
  })

  it('calls onCheckout when the primary CTA is clicked', async () => {
    const onCheckout = vi.fn()
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState()}
        onCheckout={onCheckout}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /assinar professional/i }))
    expect(onCheckout).toHaveBeenCalledWith('professional')
  })

  it('calls onStartTrial for a start_trial action and uses the TRIAL_LABELS override', async () => {
    const onStartTrial = vi.fn()
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState({
          primary: {
            label: 'Iniciar teste',
            helperText: 'Sem cobrança nos primeiros dias.',
            actionType: 'start_trial',
            disabled: false,
            variant: 'default',
          },
        })}
        onStartTrial={onStartTrial}
      />,
    )
    const button = screen.getByRole('button', { name: /escolher professional/i })
    await userEvent.click(button)
    expect(onStartTrial).toHaveBeenCalledWith('professional')
  })

  it('calls onChangePlan for a change_plan action', async () => {
    const onChangePlan = vi.fn()
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState({
          primary: {
            label: 'Mudar de plano',
            helperText: 'Ajuste o valor cobrado.',
            actionType: 'change_plan',
            disabled: false,
            variant: 'outline',
          },
        })}
        onChangePlan={onChangePlan}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /mudar de plano/i }))
    expect(onChangePlan).toHaveBeenCalledWith('professional')
  })

  it('renders a disabled current_plan CTA with the BadgeCheck icon', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState({
          primary: {
            label: 'Plano atual',
            helperText: 'Este é o seu plano.',
            actionType: 'current_plan',
            disabled: true,
            variant: 'outline',
          },
        })}
      />,
    )
    expect(screen.getByRole('button', { name: 'Plano atual' })).toBeDisabled()
  })

  it('shows the loading label and disables interaction while checking out', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState()}
        checkingOutPlanKey="professional"
      />,
    )
    expect(screen.getByText('Redirecionando...')).toBeInTheDocument()
  })

  it('shows the loading label while starting a trial', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState({
          primary: {
            label: 'Iniciar teste',
            helperText: 'x',
            actionType: 'start_trial',
            disabled: false,
            variant: 'default',
          },
        })}
        startingTrialPlanKey="professional"
      />,
    )
    expect(screen.getByText('Iniciando teste...')).toBeInTheDocument()
  })

  it('shows the loading label while changing plan', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState({
          primary: {
            label: 'Mudar',
            helperText: 'x',
            actionType: 'change_plan',
            disabled: false,
            variant: 'default',
          },
        })}
        changingPlanKey="professional"
      />,
    )
    expect(screen.getByText('Alterando plano...')).toBeInTheDocument()
  })

  it('renders a secondary CTA button and its helper text when present', async () => {
    const onCheckout = vi.fn()
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan()}
        ctaState={makeCtaState({
          secondary: {
            label: 'Reativar assinatura',
            helperText: 'Retome de onde parou.',
            actionType: 'reactivate',
            disabled: false,
            variant: 'outline',
          },
        })}
        onCheckout={onCheckout}
      />,
    )
    expect(screen.getByText('Retome de onde parou.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reativar assinatura/i }))
    expect(onCheckout).toHaveBeenCalledWith('professional')
  })

  it('falls back to a generic tagline lookup when plan.description is null', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan({ slug: 'starter', description: null })}
        ctaState={makeCtaState()}
      />,
    )
    expect(screen.getByText('Para organizar sua operação sem complexidade.')).toBeInTheDocument()
  })

  it('uses the plan.description as tagline when present', () => {
    render(
      <PricingCard
        {...baseProps}
        plan={makePlan({ description: 'Descrição customizada.' })}
        ctaState={makeCtaState()}
      />,
    )
    expect(screen.getByText('Descrição customizada.')).toBeInTheDocument()
  })

  it('links "Ver todas as funcionalidades" to /funcionalidades', () => {
    render(<PricingCard {...baseProps} plan={makePlan()} ctaState={makeCtaState()} />)
    expect(screen.getByRole('link', { name: /ver todas as funcionalidades/i })).toHaveAttribute(
      'href',
      '/funcionalidades',
    )
  })
})
