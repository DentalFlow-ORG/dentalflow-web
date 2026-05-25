import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Crown,
  Gem,
  Loader2,
  Rocket,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'
import { formatCurrencyBR } from '@/lib/number-formatters'
import { cn } from '@/lib/utils'

import type { PlanCardFeature } from '@/features/marketing/config/features'

import { BillingStatusBadge } from './BillingStatusBadge'
import { PlanFeatureList } from './PlanFeatureList'
import type { BillingInterval, BillingPlan, CurrentBillingStatus } from '../types/billing.types'
import type { PlanCtaAction, PlanCtaState } from '../utils/billing-cta-utils'

const PLAN_TAGLINES: Record<string, string> = {
  starter: 'Para organizar sua operação sem complexidade.',
  professional: 'Para clínicas que querem crescer com mais controle e previsibilidade.',
  premium: 'Para clínicas que querem uma experiência mais completa, automatizada e premium.',
}

const PLAN_ICONS: Record<string, LucideIcon> = {
  starter: Rocket,
  professional: Gem,
  premium: Crown,
}

const TRIAL_LABELS: Record<string, string> = {
  starter: 'Começar com Starter',
  professional: 'Escolher Professional',
  premium: 'Ativar Premium',
}

type Props = {
  plan: BillingPlan
  billingInterval: BillingInterval
  features: PlanCardFeature[]
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
    plan.campaign.promotionalPriceMonthly != null &&
    plan.campaign.promotionReady

  const tagline = plan.description ?? PLAN_TAGLINES[plan.slug] ?? null
  const PlanIcon = PLAN_ICONS[plan.slug] ?? Rocket

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-3xl border p-7 transition-all duration-500 motion-safe:hover:-translate-y-1',
        isCurrentPlan && 'border-primary/60 ring-2 ring-primary/10',
        isRecommended &&
          !isCurrentPlan &&
          'z-10 border-emerald-500/40 shadow-[0_0_60px_-10px_rgba(16,185,129,0.22)] lg:scale-105',
        !isRecommended && !isCurrentPlan && 'border-border',
      )}
    >
      {/* ── Floating badge ──────────────────────────────── */}
      {isCurrentPlan ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Plano atual
          </span>
        </div>
      ) : isRecommended ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="whitespace-nowrap rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/30">
            Recomendado
          </span>
        </div>
      ) : null}

      {/* ── Plan icon ──────────────────────────────────── */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          isRecommended ? 'bg-emerald-500/15' : 'bg-muted',
        )}
      >
        <PlanIcon
          className={cn('h-5 w-5', isRecommended ? 'text-emerald-400' : 'text-muted-foreground')}
          aria-hidden="true"
        />
      </div>

      {/* ── Plan name + tagline ─────────────────────────── */}
      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
          {isCurrentPlan && <BillingStatusBadge status={billingStatus?.status ?? 'active'} />}
        </div>
        {tagline && <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>}
      </div>

      {/* ── Price ────────────────────────────────────────── */}
      <div className="mt-5">
        {isAvailable ? (
          <>
            {showLaunchPrice ? (
              <LaunchPriceBlock plan={plan} />
            ) : (
              <RegularPriceBlock
                price={price}
                monthlyEquivalent={monthlyEquivalent}
                billingInterval={billingInterval}
                isRecommended={isRecommended}
              />
            )}
            {billingStatus?.currentPeriodEnd && isCurrentPlan && (
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                Próxima cobrança: {formatDateBR(billingStatus.currentPeriodEnd)}
              </p>
            )}
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
            Sem preço {billingInterval === 'MONTHLY' ? 'mensal' : 'anual'} disponível.
          </p>
        )}
      </div>

      {/* ── Features ─────────────────────────────────────── */}
      <div className="mt-6 flex-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Comparativo de recursos
        </p>
        <PlanFeatureList features={features} />
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div className="mt-8 space-y-2">
        <CtaButton
          state={ctaState.primary}
          planSlug={plan.slug}
          isRecommended={isRecommended}
          isPrimary
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
            planSlug={plan.slug}
            isRecommended={false}
            isPrimary={false}
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

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/funcionalidades">Ver todas as funcionalidades</Link>
        </Button>

        <p className="min-h-5 text-center text-xs leading-5 text-muted-foreground">
          {ctaState.secondary?.helperText ?? ctaState.primary.helperText}
        </p>
      </div>
    </article>
  )
}

function LaunchPriceBlock({ plan }: { plan: BillingPlan }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        Primeiro mês
      </p>
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span className="text-4xl font-bold text-foreground">
          {formatCurrencyBR((plan.campaign.promotionalPriceMonthly ?? 0) / 100)}
        </span>
        <span className="text-sm text-muted-foreground">/mês</span>
      </div>
      {plan.campaign.compareAtPriceMonthly != null && (
        <p className="text-xs text-muted-foreground">
          Depois {formatCurrencyBR(plan.campaign.compareAtPriceMonthly / 100)}/mês
        </p>
      )}
    </div>
  )
}

function RegularPriceBlock({
  price,
  monthlyEquivalent,
  billingInterval,
  isRecommended,
}: {
  price: number
  monthlyEquivalent: number
  billingInterval: BillingInterval
  isRecommended: boolean
}) {
  return (
    <div className="space-y-1.5">
      {billingInterval === 'YEARLY' && (
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {isRecommended ? 'Plano anual · 2 meses grátis' : 'Plano anual'}
        </p>
      )}
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span
          className={cn(
            'text-4xl font-bold',
            isRecommended ? 'text-emerald-500 dark:text-emerald-400' : 'text-foreground',
          )}
        >
          {formatCurrencyBR(monthlyEquivalent / 100)}
        </span>
        <span className="text-sm text-muted-foreground">/mês</span>
      </div>
      {billingInterval === 'YEARLY' ? (
        <p className="text-xs text-muted-foreground">
          Cobrado como {formatCurrencyBR(price / 100)} por ano.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Cobrança mensal, sem fidelidade.</p>
      )}
    </div>
  )
}

function CtaButton({
  state,
  planSlug,
  isRecommended,
  isPrimary,
  loading,
  onClick,
}: {
  state: PlanCtaState['primary']
  planSlug: string
  isRecommended: boolean
  isPrimary: boolean
  loading: boolean
  onClick: () => void
}) {
  const [rocketAnimating, setRocketAnimating] = useState(false)
  const isEmeraldCta = isPrimary && isRecommended && !state.disabled && state.variant === 'default'

  useEffect(() => {
    if (loading) setRocketAnimating(false)
  }, [loading])

  const handleClick = () => {
    if (state.actionType === 'start_trial') setRocketAnimating(true)
    onClick()
  }

  const icon = loading ? (
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
  ) : state.actionType === 'start_trial' ? (
    <Rocket
      className={cn('h-4 w-4', rocketAnimating && 'df-rocket-boost')}
      aria-hidden="true"
      onAnimationEnd={() => setRocketAnimating(false)}
    />
  ) : (
    getButtonIcon(state.actionType)
  )

  const displayLabel = loading
    ? getLoadingLabel(state.actionType)
    : state.actionType === 'start_trial' && TRIAL_LABELS[planSlug]
      ? TRIAL_LABELS[planSlug]
      : state.label

  return (
    <Button
      type="button"
      size={isPrimary ? 'lg' : 'default'}
      className={cn(
        'w-full font-semibold',
        isEmeraldCta &&
          'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 focus-visible:ring-emerald-500',
      )}
      variant={state.variant}
      disabled={state.disabled}
      onClick={handleClick}
    >
      {icon}
      {displayLabel}
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
