import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Fragment, useState } from 'react'

import { Button } from '@/components/ui/button'
import { getPlanCardFeatures } from '@/features/marketing/config/features'
import {
  MARKETING_PLAN_ICONS,
  PRICING_TRUST_ITEMS,
} from '@/features/marketing/config/marketing-pricing.constants'
import { cn } from '@/lib/utils'

import { landingPlans } from '../data/landing-content'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import { AnnualAvailabilityNote } from './AnnualAvailabilityNote'
import { type BillingPeriod, BillingPeriodToggle } from './BillingPeriodToggle'
import { PlanFeatureRow } from './PlanFeatureRow'

export function PricingSection() {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.1)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual')

  return (
    <section
      ref={ref}
      id="planos"
      className="relative overflow-hidden bg-slate-950 py-24 lg:py-32"
      aria-labelledby="pricing-heading"
    >
      {/* ── Edge glows ─────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-72 top-1/3 h-[600px] w-[600px] rounded-full bg-blue-600/[0.06] blur-3xl" />
        <div className="absolute -right-72 bottom-1/3 h-[600px] w-[600px] rounded-full bg-blue-600/[0.06] blur-3xl" />
      </div>

      {/* ── Emerald glow (behind Professional card) ───────────────── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-24 flex justify-center"
        aria-hidden="true"
      >
        <div className="h-[520px] w-[520px] rounded-full bg-emerald-500/[0.07] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        {/* ── Section header ────────────────────────────────────────── */}
        <div
          className={cn(
            'mx-auto max-w-2xl text-center transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
          )}
        >
          <span className="inline-flex items-center rounded-full border border-emerald-500/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Planos
          </span>

          <h2
            id="pricing-heading"
            className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-4xl"
          >
            O plano certo para <span className="text-emerald-400">transformar sua clínica</span>
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-400">
            Comece com 7 dias grátis. Sem cartão de crédito, cancele quando quiser.
          </p>
        </div>

        {/* ── Billing period toggle ─────────────────────────────────── */}
        <div
          className={cn(
            'mt-10 flex flex-col items-center gap-2.5 transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          )}
          style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}
        >
          <BillingPeriodToggle value={billingPeriod} onChange={setBillingPeriod} variant="dark" />
          <AnnualAvailabilityNote visible={billingPeriod === 'annual'} variant="dark" />
        </div>

        {/* ── Plan cards ────────────────────────────────────────────── */}
        <div className="mt-10 grid gap-6 md:grid-cols-3 lg:items-center">
          {landingPlans.map((plan, index) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              index={index}
              isVisible={isVisible}
              billingPeriod={billingPeriod}
            />
          ))}
        </div>

        {/* ── Trust bar ─────────────────────────────────────────────── */}
        <div
          className={cn(
            'mt-12 flex justify-center transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
          )}
          style={{ transitionDelay: isVisible ? '500ms' : '0ms' }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 lg:rounded-full lg:px-8 lg:py-3.5">
            {PRICING_TRUST_ITEMS.map((item, i) => (
              <Fragment key={item}>
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  {item}
                </span>
                {i < PRICING_TRUST_ITEMS.length - 1 && (
                  <span className="hidden h-3.5 w-px bg-white/10 lg:block" aria-hidden="true" />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* ── Comparativo link ──────────────────────────────────────── */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Quer comparar todas as funcionalidades?{' '}
          <Link
            to="/planos"
            className="font-semibold text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Ver comparativo completo
          </Link>
        </p>
      </div>
    </section>
  )
}

// ── Plan card ──────────────────────────────────────────────────────────────────

type PlanCardProps = {
  plan: (typeof landingPlans)[number]
  index: number
  isVisible: boolean
  billingPeriod: BillingPeriod
}

function PlanCard({ plan, index, isVisible, billingPeriod }: PlanCardProps) {
  const PlanIcon = MARKETING_PLAN_ICONS[plan.key]
  const { sectionLabel, features, upgradeHints } = getPlanCardFeatures(plan.key)
  const isAnnual = billingPeriod === 'annual'

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-3xl border p-7',
        'transition-all duration-500',
        'motion-safe:hover:-translate-y-1',
        'motion-reduce:translate-y-0 motion-reduce:opacity-100',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        plan.isRecommended
          ? 'z-10 border-emerald-500/40 bg-slate-900 shadow-[0_0_60px_-10px_rgba(16,185,129,0.22)] lg:scale-105'
          : 'border-white/[0.08] bg-white/[0.03]',
      )}
      style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
    >
      {/* Floating RECOMENDADO badge */}
      {plan.isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="whitespace-nowrap rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/30">
            Recomendado
          </span>
        </div>
      )}

      {/* Plan icon */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          plan.isRecommended ? 'bg-emerald-500/15' : 'bg-white/[0.07]',
        )}
      >
        <PlanIcon
          className={cn('h-5 w-5', plan.isRecommended ? 'text-emerald-400' : 'text-slate-300')}
          aria-hidden="true"
        />
      </div>

      {/* Plan name + tagline */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
        <p className="mt-1 text-sm text-slate-400">{plan.tagline}</p>
      </div>

      {/* Pricing */}
      <div className="mt-5">
        {isAnnual ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Plano anual · {plan.savingsLabel}
            </p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-4xl font-bold',
                  plan.isRecommended ? 'text-emerald-400' : 'text-white',
                )}
              >
                {plan.priceAnnualMonthly}
              </span>
              <span className="text-sm text-slate-500">/mês</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {plan.priceAnnualTotal} cobrado anualmente
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Primeiro mês
            </p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-4xl font-bold',
                  plan.isRecommended ? 'text-emerald-400' : 'text-white',
                )}
              >
                {plan.priceMonthly}
              </span>
              <span className="text-sm text-slate-500">/mês</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Depois {plan.normalMonthly}/mês</p>
          </>
        )}
      </div>

      {/* Features */}
      <ul className="mt-6 flex-1 space-y-2.5" aria-label={`Funcionalidades do plano ${plan.name}`}>
        {sectionLabel && (
          <li className="pb-0.5 pt-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {sectionLabel}
            </span>
          </li>
        )}
        {features.map((feature) => (
          <PlanFeatureRow
            key={feature.label}
            label={feature.label}
            type={feature.availability}
            variant="dark"
          />
        ))}
        {upgradeHints.length > 0 && (
          <>
            <li className="pb-0.5 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                No Professional
              </span>
            </li>
            {upgradeHints.map((hint) => (
              <PlanFeatureRow
                key={hint.label}
                label={hint.label}
                type="not_included"
                variant="dark"
              />
            ))}
          </>
        )}
      </ul>

      {/* CTA */}
      <div className="mt-8">
        {plan.isRecommended ? (
          <Button
            size="lg"
            className="w-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 focus-visible:ring-emerald-500"
            asChild
          >
            <Link to="/acessar" search={{ mode: 'register' }}>
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" variant="inverse" className="w-full" asChild>
            <Link to="/acessar" search={{ mode: 'register' }}>
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </article>
  )
}
