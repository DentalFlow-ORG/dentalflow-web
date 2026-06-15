import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

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
      {/* Single, subtle ambient glow — calm and premium, no waves */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
        aria-hidden="true"
      >
        <div
          className="h-[360px] w-[900px] max-w-[130%] rounded-[100%] blur-2xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(56,189,248,0.08), transparent 70%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        {/* ── Section header ────────────────────────────────────────── */}
        <div
          className={cn(
            'mx-auto max-w-2xl text-center transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
          )}
        >
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">
            Planos e preços
          </span>

          <h2
            id="pricing-heading"
            className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-4xl"
          >
            Escolha o plano ideal para{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              a sua clínica
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-400">
            Comece com 7 dias grátis. Sem cartão de crédito e sem fidelidade — cancele quando
            quiser.
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

        {/* ── Plan cards (equal height, aligned — no scale) ─────────── */}
        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
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
            'mt-12 transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
          )}
          style={{ transitionDelay: isVisible ? '450ms' : '0ms' }}
        >
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4">
            {PRICING_TRUST_ITEMS.map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Comparativo link ──────────────────────────────────────── */}
        <p className="mt-6 text-center text-sm text-slate-500">
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
  const recommended = plan.isRecommended

  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-3xl border p-7 transition-all duration-500',
        'motion-reduce:translate-y-0 motion-reduce:opacity-100',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        recommended
          ? 'border-emerald-500/40 bg-white/[0.045] shadow-[0_24px_70px_-30px_rgba(16,185,129,0.45)] ring-1 ring-emerald-500/20'
          : 'border-white/10 bg-white/[0.02]',
      )}
      style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
    >
      {recommended && (
        <>
          {/* Subtle emerald accent line at the very top of the card */}
          <span
            className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="whitespace-nowrap rounded-full bg-emerald-500 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/30">
              Recomendado
            </span>
          </div>
        </>
      )}

      {/* Plan icon + name */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            recommended ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-slate-300',
          )}
        >
          <PlanIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{plan.tagline}</p>

      {/* Pricing */}
      <div className="mt-6">
        {isAnnual ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Plano anual · {plan.savingsLabel}
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-[2.5rem] font-bold leading-none tracking-tight',
                  recommended ? 'text-emerald-400' : 'text-white',
                )}
              >
                {plan.priceAnnualMonthly}
              </span>
              <span className="text-sm font-medium text-slate-500">/mês</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {plan.priceAnnualTotal} cobrado anualmente
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Primeiro mês
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-[2.5rem] font-bold leading-none tracking-tight',
                  recommended ? 'text-emerald-400' : 'text-white',
                )}
              >
                {plan.priceMonthly}
              </span>
              <span className="text-sm font-medium text-slate-500">/mês</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Depois {plan.normalMonthly}/mês</p>
          </>
        )}
      </div>

      {/* Features */}
      <div className="mt-6 flex-1 border-t border-white/[0.08] pt-6">
        <ul className="space-y-3" aria-label={`Funcionalidades do plano ${plan.name}`}>
          {sectionLabel && (
            <li>
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
              <li className="pt-2">
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
      </div>

      {/* CTA — bottom-aligned across all cards */}
      <div className="mt-8">
        <Button
          size="lg"
          variant={recommended ? 'default' : 'inverse'}
          className={cn(
            'w-full',
            recommended &&
              'border-transparent bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 focus-visible:ring-emerald-500',
          )}
          asChild
        >
          <Link to="/acessar" search={{ mode: 'register' }}>
            Começar agora
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  )
}
