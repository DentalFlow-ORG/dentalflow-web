import { Fragment, useId, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  RefreshCw,
  Server,
  Shield,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  COMMERCIAL_PLAN_LABELS,
  PLAN_ORDER,
  type CommercialPlanKey,
  getFeatureAvailability,
  getFeaturesByCategory,
  getPlanCardFeatures,
} from '@/features/marketing/config/features'
import {
  MARKETING_PLAN_ICONS,
  PRICING_TRUST_ITEMS,
} from '@/features/marketing/config/marketing-pricing.constants'
import { cn } from '@/lib/utils'

import { PublicLayout } from '../components/PublicLayout'
import { usePageMeta } from '../hooks/usePageMeta'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import { landingPlans } from '../data/landing-content'
import { faqItems } from '../data/public-content'
import { AvailabilityIndicator } from '../components/AvailabilityIndicator'
import { AnnualAvailabilityNote } from '../components/AnnualAvailabilityNote'
import { BillingPeriodToggle, type BillingPeriod } from '../components/BillingPeriodToggle'
import { PlanFeatureRow } from '../components/PlanFeatureRow'

// ── Plan-card content ──────────────────────────────────────────────────────────

// ── Trust / security data ──────────────────────────────────────────────────────

const SECURITY_ITEMS = [
  {
    Icon: Shield,
    title: 'Segurança e privacidade',
    description: 'Dados protegidos e estrutura em conformidade com a LGPD.',
  },
  {
    Icon: Server,
    title: 'Tudo na nuvem',
    description: 'Acesse de qualquer dispositivo, sem instalação local.',
  },
  {
    Icon: RefreshCw,
    title: 'Backup automático',
    description: 'Seus dados são salvos continuamente, sem esforço manual.',
  },
  {
    Icon: MessageCircle,
    title: 'Suporte especializado',
    description: 'Equipe pronta para ajudar na implantação e no dia a dia.',
  },
]

// ── FAQ: select the most conversion-relevant items ────────────────────────────

const PLANS_FAQ_QUESTIONS = new Set([
  'Preciso de cartão de crédito para testar?',
  'Posso cancelar quando quiser?',
  'O que cada plano inclui?',
  'O DentalFlow serve para clínica pequena?',
  'Consigo migrar de outro software?',
  'O sistema é seguro?',
  'Funciona no celular?',
])

const plansFaqItems = faqItems.filter((item) => PLANS_FAQ_QUESTIONS.has(item.question))

// ── Page ───────────────────────────────────────────────────────────────────────

export function PlansPage() {
  usePageMeta(
    'DentalFlow | Planos e preços para clínicas odontológicas',
    'Compare os planos Starter, Professional e Premium. Veja o que está incluído em cada plano e escolha o ideal para sua clínica.',
  )

  const featureGroups = getFeaturesByCategory()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual')

  const { ref: heroRef, isVisible: heroVisible } = useRevealOnScroll<HTMLElement>(0.05)
  const { ref: pricingRef, isVisible: pricingVisible } = useRevealOnScroll<HTMLDivElement>(0.05)
  const { ref: ctaRef, isVisible: ctaVisible } = useRevealOnScroll<HTMLElement>(0.1)

  return (
    <PublicLayout darkHero>

      {/* ── SECTION 1: Dark Premium Hero ──────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-slate-950 pb-52 pt-28 lg:pb-64 lg:pt-32"
        aria-labelledby="plans-hero-heading"
      >
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-72 top-1/3 h-140 w-140 rounded-full bg-blue-600/[0.07] blur-3xl" />
          <div className="absolute -right-72 bottom-0 h-125 w-125 rounded-full bg-blue-600/5 blur-3xl" />
          <div className="absolute left-1/3 top-1/4 h-105 w-105 rounded-full bg-emerald-500/[0.07] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left: copy */}
            <div
              className={cn(
                'transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
                heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
              )}
            >
              <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                Preço de lançamento · Condição especial para novas clínicas
              </span>

              <h1
                id="plans-hero-heading"
                className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl"
              >
                Planos feitos para{' '}
                <span className="text-emerald-400">impulsionar resultados</span>{' '}
                na sua clínica
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-400">
                Comece com 7 dias grátis e organize sua gestão desde o primeiro dia. Sem cartão de
                crédito, cancele quando quiser.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Comece com vantagem desde o primeiro mês — escolha hoje o plano ideal para acelerar
                sua gestão.
              </p>

              {/* Mini trust strip */}
              <div className="mt-7 flex flex-wrap gap-5">
                {PRICING_TRUST_ITEMS.slice(0, 3).map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-slate-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  size="lg"
                  className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 focus-visible:ring-emerald-500"
                  asChild
                >
                  <Link to="/acessar" search={{ mode: 'register' }}>
                    Começar teste grátis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: dashboard mockup — desktop only */}
            <div
              className={cn(
                'hidden lg:block',
                'transition-all duration-700 delay-200 motion-reduce:translate-y-0 motion-reduce:opacity-100',
                heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
              )}
              aria-hidden="true"
            >
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Lift wrapper: white content rises over dark hero ──────────────── */}
      <div className="relative -mt-24 lg:-mt-32">

        {/* ── SECTION 2: Pricing Cards ──────────────────────────────────────── */}
        <section
          className="rounded-t-[2rem] bg-white px-4 pb-12 pt-14 sm:px-6 lg:px-8"
          aria-labelledby="pricing-cards-heading"
        >
          <h2 id="pricing-cards-heading" className="sr-only">
            Planos e preços
          </h2>
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col items-center gap-2.5">
              <BillingPeriodToggle
                value={billingPeriod}
                onChange={setBillingPeriod}
                variant="light"
              />
              <AnnualAvailabilityNote visible={billingPeriod === 'annual'} />
            </div>
            <div
              ref={pricingRef}
              className="grid gap-6 md:grid-cols-3 lg:items-start"
            >
              {landingPlans.map((plan, index) => (
                <PlanCard
                  key={plan.key}
                  plan={plan}
                  index={index}
                  isVisible={pricingVisible}
                  billingPeriod={billingPeriod}
                />
              ))}
            </div>

            {/* Trust bar */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 lg:rounded-full">
              {PRICING_TRUST_ITEMS.map((item, i) => (
                <Fragment key={item}>
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-emerald-500"
                      aria-hidden="true"
                    />
                    {item}
                  </span>
                  {i < PRICING_TRUST_ITEMS.length - 1 && (
                    <span
                      className="hidden h-3.5 w-px bg-slate-200 lg:block"
                      aria-hidden="true"
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Feature Comparison ────────────────────────────────── */}
        <section className="bg-slate-50 py-20" aria-labelledby="comparison-heading">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Comparativo
              </span>
              <h2
                id="comparison-heading"
                className="mt-4 text-3xl font-bold text-slate-900"
              >
                Compare todos os recursos
              </h2>
              <p className="mt-3 text-base text-slate-500">
                Veja em detalhes o que cada plano oferece para encontrar o mais adequado à sua
                clínica.
              </p>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <div className="min-w-208">
                  {/* Header */}
                  <div className="grid grid-cols-[minmax(22rem,1fr)_10rem_10rem_10rem] border-b border-slate-200">
                    <div className="bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-600">
                      Funcionalidade
                    </div>
                    {PLAN_ORDER.map((plan) => (
                      <div
                        key={plan}
                        className={cn(
                          'px-4 py-4 text-center text-sm font-bold',
                          plan === 'professional'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-50 text-slate-700',
                        )}
                      >
                        {COMMERCIAL_PLAN_LABELS[plan]}
                        {plan === 'professional' && (
                          <span className="mt-0.5 block text-[10px] font-medium text-emerald-500">
                            ★ Recomendado
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Feature rows */}
                  {featureGroups.map((group) => (
                    <div key={group.category}>
                      <div className="border-b border-slate-100 bg-white px-5 py-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {group.label}
                        </h3>
                      </div>
                      {group.features.map((feature) => (
                        <div
                          key={feature.id}
                          className="grid grid-cols-[minmax(22rem,1fr)_10rem_10rem_10rem] border-b border-slate-100 last:border-b-0"
                        >
                          <div className="px-5 py-3.5">
                            <p className="text-sm font-medium text-slate-800">{feature.title}</p>
                            {feature.clientFriendlyExplanation && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {feature.clientFriendlyExplanation}
                              </p>
                            )}
                          </div>
                          {PLAN_ORDER.map((plan) => (
                            <div
                              key={plan}
                              className={cn(
                                'flex items-center justify-center border-l border-slate-100 px-4 py-3.5',
                                plan === 'professional' && 'bg-emerald-50/50',
                              )}
                            >
                              <AvailabilityIndicator
                                availability={getFeatureAvailability(feature, plan)}
                                variant="icon"
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 lg:hidden">
              {featureGroups.map((group) => (
                <div
                  key={group.category}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </h3>
                  <div className="mt-3 space-y-3">
                    {group.features.map((feature) => (
                      <article
                        key={feature.id}
                        className="rounded-lg border border-slate-100 p-3.5"
                      >
                        <p className="text-sm font-medium text-slate-800">{feature.title}</p>
                        {feature.clientFriendlyExplanation && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {feature.clientFriendlyExplanation}
                          </p>
                        )}
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {PLAN_ORDER.map((plan) => (
                            <div
                              key={plan}
                              className={cn(
                                'flex flex-col items-center gap-1.5 rounded-md border py-2 text-center',
                                plan === 'professional'
                                  ? 'border-emerald-200 bg-emerald-50/60'
                                  : 'border-slate-100',
                              )}
                            >
                              <span
                                className={cn(
                                  'text-[10px] font-semibold',
                                  plan === 'professional' ? 'text-emerald-600' : 'text-slate-500',
                                )}
                              >
                                {COMMERCIAL_PLAN_LABELS[plan]}
                              </span>
                              <AvailabilityIndicator
                                availability={getFeatureAvailability(feature, plan)}
                                variant="icon"
                              />
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">Observações importantes</h3>
              <div className="mt-3 grid gap-2.5 text-xs leading-6 text-slate-500 sm:grid-cols-2">
                <p>
                  O assistente de IA apoia análises baseadas nos dados registrados. Não toma
                  decisões administrativas ou clínicas.
                </p>
                <p>
                  Controle fiscal organiza dados internamente. Emissão de NFS-e depende de provedor
                  homologado (em desenvolvimento).
                </p>
                <p>
                  Notificações via WhatsApp requerem conta Business aprovada pela Meta e configuração
                  de templates.
                </p>
                <p>
                  Recursos marcados "Em breve" representam evolução planejada e não garantem entrega
                  imediata.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Security / Infrastructure trust block ──────────────── */}
        <section className="bg-white py-16" aria-labelledby="security-heading">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 id="security-heading" className="text-2xl font-bold text-slate-900">
                Infraestrutura pensada para clínicas
              </h2>
              <p className="mt-2 text-slate-500">
                Segurança, estabilidade e suporte para você focar no que importa.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SECURITY_ITEMS.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <Icon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-800">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 5: FAQ ────────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 id="faq-heading" className="text-3xl font-bold text-slate-900">
                Dúvidas frequentes
              </h2>
              <p className="mt-3 text-slate-500">
                Respostas para as principais perguntas antes de começar.
              </p>
            </div>
            <div className="space-y-3">
              {plansFaqItems.map((item, index) => (
                <FaqItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFaq === index}
                  onToggle={() => setOpenFaq(openFaq === index ? null : index)}
                />
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-slate-500">
              Tem mais dúvidas?{' '}
              <Link
                to="/perguntas-frequentes"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Ver todas as perguntas frequentes
              </Link>
            </p>
          </div>
        </section>

        {/* ── SECTION 6: Final CTA ──────────────────────────────────────────── */}
        <section
          ref={ctaRef}
          className="relative overflow-hidden bg-slate-950 py-24"
          aria-labelledby="final-cta-heading"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-1/4 top-0 h-105 w-105 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-105 w-105 translate-y-1/2 rounded-full bg-blue-600/8 blur-3xl" />
          </div>
          <div
            className={cn(
              'relative mx-auto max-w-2xl px-6 text-center lg:px-8',
              'transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
              ctaVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              7 dias grátis · Sem cartão de crédito
            </span>
            <h2
              id="final-cta-heading"
              className="mt-5 text-4xl font-bold text-white sm:text-5xl"
            >
              Transforme sua clínica{' '}
              <span className="text-emerald-400">hoje mesmo</span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Organize sua clínica antes que a rotina fique mais complexa. Comece agora e aproveite
              o melhor valor no momento.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 focus-visible:ring-emerald-500"
                asChild
              >
                <Link to="/acessar" search={{ mode: 'register' }}>
                  Começar teste grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="inverse" asChild>
                <Link to="/perguntas-frequentes">Ver perguntas frequentes</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Sem cartão de crédito · Cancele quando quiser · Suporte incluído
            </p>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

type PlanCardProps = {
  plan: (typeof landingPlans)[number]
  index: number
  isVisible: boolean
  billingPeriod: BillingPeriod
}

function PlanCard({ plan, index, isVisible, billingPeriod }: PlanCardProps) {
  const PlanIcon = MARKETING_PLAN_ICONS[plan.key]
  const { sectionLabel, features, upgradeHints } = getPlanCardFeatures(plan.key as CommercialPlanKey)
  const isAnnual = billingPeriod === 'annual'

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-3xl border bg-white p-7',
        'transition-all duration-500 motion-reduce:translate-y-0 motion-reduce:opacity-100',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        plan.isRecommended
          ? 'z-10 border-emerald-500/60 shadow-2xl shadow-emerald-500/10 lg:scale-[1.04]'
          : 'border-slate-200 shadow-sm',
      )}
      style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
    >
      {/* RECOMENDADO badge */}
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
          plan.isRecommended ? 'bg-emerald-100' : 'bg-slate-100',
        )}
      >
        <PlanIcon
          className={cn('h-5 w-5', plan.isRecommended ? 'text-emerald-600' : 'text-slate-500')}
          aria-hidden="true"
        />
      </div>

      {/* Name + subtitle */}
      <div className="mt-4">
        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
      </div>

      {/* Pricing */}
      <div className="mt-5 border-t border-slate-100 pt-5">
        {isAnnual ? (
          <>
            <p className="text-xs font-medium text-emerald-600">
              Plano anual · {plan.savingsLabel}
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={cn(
                  'text-4xl font-extrabold',
                  plan.isRecommended ? 'text-emerald-600' : 'text-slate-900',
                )}
              >
                {plan.priceAnnualMonthly}
              </span>
              <span className="text-sm text-slate-400">/mês</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {plan.priceAnnualTotal} cobrado anualmente
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
              Primeiro mês
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={cn(
                  'text-4xl font-extrabold',
                  plan.isRecommended ? 'text-emerald-600' : 'text-slate-900',
                )}
              >
                {plan.priceMonthly}
              </span>
              <span className="text-sm text-slate-400">/mês</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Depois {plan.normalMonthly}/mês
            </p>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="mt-6">
        {plan.isRecommended ? (
          <Button
            size="lg"
            className="w-full bg-emerald-500 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-400 focus-visible:ring-emerald-500"
            asChild
          >
            <Link to="/acessar" search={{ mode: 'register' }}>
              Começar teste grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" variant="default" className="w-full" asChild>
            <Link to="/acessar" search={{ mode: 'register' }}>
              Começar teste grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Feature list */}
      <ul
        className="mt-6 flex-1 space-y-2"
        role="list"
        aria-label={`Recursos do plano ${plan.name}`}
      >
        {sectionLabel && (
          <li className="pb-0.5 pt-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {sectionLabel}
            </span>
          </li>
        )}
        {features.map((feature) => (
          <PlanFeatureRow
            key={feature.label}
            label={feature.label}
            type={feature.availability}
            variant="light"
          />
        ))}
        {upgradeHints.length > 0 && (
          <>
            <li className="pb-0.5 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                No Professional
              </span>
            </li>
            {upgradeHints.map((hint) => (
              <PlanFeatureRow
                key={hint.label}
                label={hint.label}
                type="not_included"
                variant="light"
              />
            ))}
          </>
        )}
      </ul>
    </article>
  )
}

// ── FaqItem ────────────────────────────────────────────────────────────────────

type FaqItemProps = {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FaqItem({ question, answer, isOpen, onToggle }: FaqItemProps) {
  const uid = useId()
  const buttonId = `plans-faq-btn-${uid}`
  const panelId = `plans-faq-panel-${uid}`

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
      >
        <span className="text-sm font-semibold text-slate-800">{question}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="border-t border-slate-100 px-5 py-4"
        >
          <p className="text-sm leading-7 text-slate-500">{answer}</p>
        </div>
      )}
    </div>
  )
}


// ── DashboardMockup ────────────────────────────────────────────────────────────

function KpiCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-lg border border-white/6 bg-slate-800/60 p-3">
      <p className="text-[10px] leading-tight text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] text-emerald-400">{trend}</p>
    </div>
  )
}

function DashboardMockup() {
  const bars = [45, 60, 52, 78, 68, 88, 72]
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const appointments = [
    { time: '10:30', name: 'Ana Rodrigues', confirmed: true },
    { time: '11:00', name: 'Pedro Martins', confirmed: false },
    { time: '11:30', name: 'Carla Santos', confirmed: true },
  ]

  return (
    <div className="relative select-none">
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -inset-8 rounded-3xl bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -inset-8 rounded-3xl bg-blue-600/6 blur-2xl"
        aria-hidden="true"
      />

      {/* Main card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-slate-900/95 shadow-2xl">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-white/6 bg-slate-950/70 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-rose-400/60" />
          <div className="h-2 w-2 rounded-full bg-amber-400/60" />
          <div className="h-2 w-2 rounded-full bg-emerald-400/60" />
          <span className="ml-3 text-[10px] font-medium text-slate-500">
            DentalFlow · Painel da Clínica
          </span>
        </div>

        <div className="p-5">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2.5">
            <KpiCard label="Consultas hoje" value="14" trend="↑ +2 vs ontem" />
            <KpiCard label="Receita mensal" value="R$ 9,2k" trend="↑ 12% este mês" />
            <KpiCard label="Taxa de retorno" value="78%" trend="↑ meta atingida" />
          </div>

          {/* Bar chart */}
          <div className="mt-4 rounded-xl border border-white/6 bg-slate-800/50 p-3.5">
            <p className="mb-3 text-[10px] font-medium text-slate-500">
              Agendamentos — últimos 7 dias
            </p>
            <div className="flex items-end gap-1.5" style={{ height: '60px' }}>
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="relative flex-1 overflow-hidden rounded-sm"
                  style={{ height: '100%' }}
                >
                  <div
                    className={cn(
                      'absolute bottom-0 w-full rounded-sm',
                      i === 5 ? 'bg-emerald-500/80' : 'bg-slate-700',
                    )}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex">
              {days.map((d) => (
                <span key={d} className="flex-1 text-center text-[9px] text-slate-600">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className="mt-4 space-y-1.5">
            {appointments.map((apt) => (
              <div
                key={apt.time}
                className="flex items-center gap-2.5 rounded-lg bg-slate-800/40 px-3 py-1.5"
              >
                <span className="w-8 shrink-0 text-[10px] font-medium text-slate-500">
                  {apt.time}
                </span>
                <span className="flex-1 text-[11px] text-slate-300">{apt.name}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[9px] font-semibold',
                    apt.confirmed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400',
                  )}
                >
                  {apt.confirmed ? 'Confirmado' : 'Aguardando'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating stat card */}
      <div className="absolute -bottom-5 -right-5 rounded-xl border border-white/8 bg-slate-800 px-4 py-3 shadow-xl">
        <p className="text-[10px] text-slate-500">Novos pacientes</p>
        <p className="text-xl font-extrabold text-white">+23</p>
        <p className="text-[10px] font-medium text-emerald-400">↑ 18% este mês</p>
      </div>
    </div>
  )
}
