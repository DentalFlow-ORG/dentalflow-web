import { ArrowRight, BadgeCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'
import { formatCurrencyBR } from '@/lib/number-formatters'
import { cn } from '@/lib/utils'

import { BillingStatusBadge } from './BillingStatusBadge'
import { PlanFeatureList } from './PlanFeatureList'
import type { BillingInterval, BillingPlan, CurrentBillingStatus } from '../types/billing.types'
import type { PlanCtaAction, PlanCtaState } from '../utils/billing-cta-utils'

const PLAN_TAGLINES: Record<string, string> = {
  starter: 'Ideal para clínicas em fase inicial',
  professional: 'Para clínicas em crescimento',
  premium: 'Para clínicas com maior volume',
}

type Props = {
  plan: BillingPlan
  billingInterval: BillingInterval
  features: string[]
  isAvailable: boolean
  isCurrentPlan: boolean
  isRecommended: boolean
  billingStatus: CurrentBillingStatus | null
  ctaState: PlanCtaState
  checkingOutPlanKey: string | null
  startingTrialPlanKey: string | null
  changingPlanKey: string | null
  onStartTrial: (planKey: string) => void
  onCheckout: (planKey: string) => void
  onChangePlan: (planKey: string) => void
}

export function PricingCard({
  plan,
  billingInterval,
  features,
  isAvailable,
  isCurrentPlan,
  isRecommended,
  billingStatus,
  ctaState,
  checkingOutPlanKey,
  startingTrialPlanKey,
  changingPlanKey,
  onStartTrial,
  onCheckout,
  onChangePlan,
}: Props) {
  const price = billingInterval === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly
  const monthlyEquivalent = billingInterval === 'YEARLY' ? price / 12 : price
  const isCheckingOut = checkingOutPlanKey === plan.slug
  const isStartingTrial = startingTrialPlanKey === plan.slug
  const isChangingPlan = changingPlanKey === plan.slug
  const showLaunchPrice =
    billingInterval === 'MONTHLY' &&
    plan.campaign.enabled &&
    plan.campaign.promotionalPriceMonthly != null

  const tagline = plan.description ?? PLAN_TAGLINES[plan.slug] ?? null

  return (
    <PanelCard
      className={cn(
        'relative flex h-full flex-col overflow-hidden p-0',
        isCurrentPlan && 'border-primary ring-2 ring-primary/20',
        isRecommended && !isCurrentPlan && 'border-primary shadow-sm',
      )}
    >
      <PlanStateBanner isCurrentPlan={isCurrentPlan} isRecommended={isRecommended} />

      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-950">{plan.name}</h3>
              {plan.campaign.enabled && (
                <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  Oferta de lançamento
                </span>
              )}
            </div>
            {tagline && (
              <p className="mt-2 text-sm leading-5 text-slate-600">{tagline}</p>
            )}
          </div>
          {isCurrentPlan && (
            <BillingStatusBadge status={billingStatus?.status ?? 'active'} />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {isAvailable ? (
          <div className="space-y-3">
            {showLaunchPrice ? (
              <LaunchPriceBlock plan={plan} />
            ) : (
              <RegularPriceBlock
                price={price}
                monthlyEquivalent={monthlyEquivalent}
                billingInterval={billingInterval}
              />
            )}

            {billingStatus?.currentPeriodEnd && isCurrentPlan && (
              <p className="text-xs font-medium text-slate-500">
                Próxima cobrança: {formatDateBR(billingStatus.currentPeriodEnd)}
              </p>
            )}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Sem preço {billingInterval === 'MONTHLY' ? 'mensal' : 'anual'} disponível.
          </p>
        )}

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Incluído no plano
          </p>
          <PlanFeatureList features={features} />
        </div>

        <div className="mt-auto space-y-2 pt-6">
          <CtaButton
            state={ctaState.primary}
            isRecommended={isRecommended}
            loading={getLoadingState(ctaState.primary.actionType, {
              isCheckingOut,
              isStartingTrial,
              isChangingPlan,
            })}
            onClick={() =>
              runAction(ctaState.primary.actionType, plan.slug, {
                onStartTrial,
                onCheckout,
                onChangePlan,
              })
            }
          />

          {ctaState.secondary && (
            <CtaButton
              state={ctaState.secondary}
              isRecommended={false}
              loading={getLoadingState(ctaState.secondary.actionType, {
                isCheckingOut,
                isStartingTrial,
                isChangingPlan,
              })}
              onClick={() =>
                runAction(ctaState.secondary!.actionType, plan.slug, {
                  onStartTrial,
                  onCheckout,
                  onChangePlan,
                })
              }
            />
          )}

          <p className="min-h-5 text-center text-xs leading-5 text-slate-500">
            {ctaState.secondary?.helperText ?? ctaState.primary.helperText}
          </p>
        </div>
      </div>
    </PanelCard>
  )
}

function PlanStateBanner({
  isCurrentPlan,
  isRecommended,
}: {
  isCurrentPlan: boolean
  isRecommended: boolean
}) {
  if (isCurrentPlan) {
    return (
      <div className="flex min-h-9 items-center justify-center gap-1.5 bg-primary px-4 py-2 text-xs font-semibold text-white">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Plano atual
      </div>
    )
  }

  if (isRecommended) {
    return (
      <div className="flex min-h-9 items-center justify-center gap-1.5 bg-primary px-4 py-2 text-xs font-semibold text-white">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Plano recomendado
      </div>
    )
  }

  return <div className="min-h-9" aria-hidden="true" />
}

function LaunchPriceBlock({ plan }: { plan: BillingPlan }) {
  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">
        Primeiro mês promocional
      </p>
      {plan.campaign.compareAtPriceMonthly != null && (
        <p className="mt-2 text-sm font-medium text-slate-500">
          De{' '}
          <span className="line-through">
            {formatCurrencyBR(plan.campaign.compareAtPriceMonthly / 100)}
          </span>
        </p>
      )}
      <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span className="text-3xl font-bold text-slate-950 sm:text-4xl">
          {formatCurrencyBR((plan.campaign.promotionalPriceMonthly ?? 0) / 100)}
        </span>
        <span className="text-sm font-medium text-slate-600">/mês</span>
      </div>
      <p className="mt-2 text-xs font-medium leading-5 text-orange-700">
        Depois, valor regular do plano.
      </p>
    </div>
  )
}

function RegularPriceBlock({
  price,
  monthlyEquivalent,
  billingInterval,
}: {
  price: number
  monthlyEquivalent: number
  billingInterval: BillingInterval
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span className="text-3xl font-bold text-slate-950 sm:text-4xl">
          {formatCurrencyBR(monthlyEquivalent / 100)}
        </span>
        <span className="text-sm font-medium text-slate-600">/mês</span>
      </div>
      {billingInterval === 'YEARLY' ? (
        <p className="text-xs leading-5 text-slate-500">
          Cobrança anual de {formatCurrencyBR(price / 100)}.
        </p>
      ) : (
        <p className="text-xs leading-5 text-slate-500">Cobrança mensal, sem fidelidade.</p>
      )}
    </div>
  )
}

function CtaButton({
  state,
  isRecommended,
  loading,
  onClick,
}: {
  state: PlanCtaState['primary']
  isRecommended: boolean
  loading: boolean
  onClick: () => void
}) {
  const isProminentCta = isRecommended && !state.disabled && state.variant === 'default'

  return (
    <Button
      type="button"
      className={cn('w-full', isProminentCta ? 'h-12 text-base' : 'h-11')}
      variant={state.variant}
      disabled={state.disabled}
      onClick={onClick}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        getButtonIcon(state.actionType)
      )}
      {loading ? getLoadingLabel(state.actionType) : state.label}
    </Button>
  )
}

function getButtonIcon(actionType: PlanCtaAction) {
  if (actionType === 'current_plan') {
    return <BadgeCheck className="h-4 w-4" aria-hidden="true" />
  }

  if (actionType === 'checkout' || actionType === 'change_plan' || actionType === 'reactivate') {
    return <ArrowRight className="h-4 w-4" aria-hidden="true" />
  }

  return null
}

function getLoadingLabel(actionType: PlanCtaAction) {
  if (actionType === 'start_trial') return 'Iniciando teste...'
  if (actionType === 'change_plan') return 'Alterando plano...'
  return 'Redirecionando...'
}

function getLoadingState(
  actionType: PlanCtaAction,
  state: {
    isCheckingOut: boolean
    isStartingTrial: boolean
    isChangingPlan: boolean
  },
) {
  if (actionType === 'start_trial') return state.isStartingTrial
  if (actionType === 'change_plan') return state.isChangingPlan
  if (actionType === 'checkout' || actionType === 'reactivate') return state.isCheckingOut
  return false
}

function runAction(
  actionType: PlanCtaAction,
  planKey: string,
  actions: {
    onStartTrial: (planKey: string) => void
    onCheckout: (planKey: string) => void
    onChangePlan: (planKey: string) => void
  },
) {
  if (actionType === 'start_trial') actions.onStartTrial(planKey)
  if (actionType === 'checkout' || actionType === 'reactivate') actions.onCheckout(planKey)
  if (actionType === 'change_plan') actions.onChangePlan(planKey)
}
