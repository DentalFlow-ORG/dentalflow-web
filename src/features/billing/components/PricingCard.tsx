import { BadgeCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react'

import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'
import { formatCurrencyBR } from '@/lib/number-formatters'
import { cn } from '@/lib/utils'

import { BillingStatusBadge } from './BillingStatusBadge'
import { PlanFeatureList } from './PlanFeatureList'
import type { BillingInterval, BillingPlan, CurrentBillingStatus } from '../types/billing.types'
import type { PlanCtaAction, PlanCtaState } from '../utils/billing-cta-utils'

// Fallback taglines when plan.description is null
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
        isCurrentPlan && 'ring-2 ring-primary ring-offset-2',
        isRecommended && !isCurrentPlan && 'shadow-xl shadow-slate-200',
      )}
    >
      {/* Top accent band — always reserves height for grid alignment */}
      {isCurrentPlan ? (
        <div className="flex items-center justify-center gap-1.5 bg-primary px-4 py-2 text-xs font-bold text-white">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Plano atual
        </div>
      ) : isRecommended ? (
        <div className="flex items-center justify-center gap-1.5 bg-primary px-4 py-2 text-xs font-bold text-white">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Mais escolhido · Melhor custo-benefício
        </div>
      ) : (
        <div className="h-[33px]" aria-hidden="true" />
      )}

      <div className="flex flex-col gap-3 border-b border-slate-100 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-950">{plan.name}</h3>
              {plan.campaign.enabled && (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                  Oferta de lançamento
                </span>
              )}
            </div>
            {tagline && (
              <p className="mt-1.5 text-sm leading-5 text-slate-500">{tagline}</p>
            )}
          </div>
          {isCurrentPlan && (
            <BillingStatusBadge status={billingStatus?.status ?? 'active'} />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div>
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
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
              Sem preço {billingInterval === 'MONTHLY' ? 'mensal' : 'anual'} disponível.
            </p>
          )}
        </div>

        <PlanFeatureList features={features} className="mt-6 flex-1" />

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

          <p className="min-h-5 text-center text-xs text-slate-500">
            {ctaState.secondary?.helperText ?? ctaState.primary.helperText}
          </p>
        </div>
      </div>
    </PanelCard>
  )
}

function LaunchPriceBlock({ plan }: { plan: BillingPlan }) {
  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
        Primeiro mês promocional
      </p>
      {plan.campaign.compareAtPriceMonthly != null && (
        <p className="mt-2 text-sm font-medium text-slate-400">
          De{' '}
          <span className="line-through">
            {formatCurrencyBR(plan.campaign.compareAtPriceMonthly / 100)}
          </span>
        </p>
      )}
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-4xl font-black text-slate-950">
          {formatCurrencyBR((plan.campaign.promotionalPriceMonthly ?? 0) / 100)}
        </span>
        <span className="text-sm font-medium text-slate-500">/mês</span>
      </div>
      <p className="mt-2 text-xs font-medium text-orange-700">
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
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-slate-950">
          {formatCurrencyBR(monthlyEquivalent / 100)}
        </span>
        <span className="text-sm font-medium text-slate-500">/mês</span>
      </div>
      {billingInterval === 'YEARLY' ? (
        <p className="text-xs text-slate-500">
          Cobrança anual de {formatCurrencyBR(price / 100)}.
        </p>
      ) : (
        <p className="text-xs text-slate-500">Cobrança mensal, sem fidelidade.</p>
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
  return actionType === 'current_plan' ? (
    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
  ) : null
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
