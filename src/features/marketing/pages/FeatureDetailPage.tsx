import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { PublicLayout } from '../components/PublicLayout'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import type { FeatureDetailContent } from '../data/public-content'
import { FeatureMockup } from './FeatureMockups'

// ── Related features (6 main dropdown modules) ────────────────────────────────

const MAIN_FEATURES = [
  {
    id: 'agenda',
    label: 'Agenda inteligente',
    href: '/funcionalidades/agenda',
    icon: CalendarDays,
  },
  {
    id: 'prontuarios',
    label: 'Prontuário eletrônico',
    href: '/funcionalidades/prontuarios',
    icon: ClipboardList,
  },
  {
    id: 'financeiro',
    label: 'Gestão financeira',
    href: '/funcionalidades/financeiro',
    icon: CreditCard,
  },
  {
    id: 'pacientes',
    label: 'Pacientes e leads',
    href: '/funcionalidades/pacientes',
    icon: Users,
  },
  {
    id: 'relatorios',
    label: 'Relatórios e indicadores',
    href: '/funcionalidades/relatorios',
    icon: TrendingUp,
  },
  { id: 'ia', label: 'IA de gestão', href: '/funcionalidades/ia', icon: Bot },
]

// Maps role label strings to public role pages
const ROLE_ROUTES: Record<string, string> = {
  'Secretária / Recepção': '/para-secretarias',
  'Dentista': '/para-dentistas',
  'Gestor / Proprietário': '/para-gestores',
  'Gestor/Proprietário': '/para-gestores',
}

// ── Page ──────────────────────────────────────────────────────────────────────

type FeatureDetailPageProps = {
  content: FeatureDetailContent
}

export function FeatureDetailPage({ content }: FeatureDetailPageProps) {
  const { ref: heroRef, isVisible: heroVisible } = useRevealOnScroll<HTMLElement>(0.05)
  const { ref: ctaRef, isVisible: ctaVisible } = useRevealOnScroll<HTMLElement>(0.1)

  const relatedFeatures = MAIN_FEATURES.filter((f) => f.id !== content.id).slice(0, 3)

  return (
    <PublicLayout darkHero>
      {/* ── SECTION 1: Dark premium hero ──────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-slate-950 pb-44 pt-28 lg:pb-52 lg:pt-32"
        aria-labelledby="feature-hero-heading"
      >
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-72 top-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/[0.07] blur-3xl" />
          <div className="absolute -right-72 bottom-0 h-[450px] w-[450px] rounded-full bg-blue-600/[0.05] blur-3xl" />
          <div className="absolute left-1/3 top-1/4 h-[380px] w-[380px] rounded-full bg-emerald-500/[0.07] blur-3xl" />
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
                {content.eyebrow}
              </span>

              <h1
                id="feature-hero-heading"
                className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl"
              >
                {content.hero}
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-400">{content.heroSub}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 focus-visible:ring-emerald-500"
                  asChild
                >
                  <Link to="/acessar" search={{ mode: 'register' }}>
                    Testar grátis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="inverse" asChild>
                  <Link to="/planos">Ver planos</Link>
                </Button>
              </div>
            </div>

            {/* Right: generic product mockup — desktop only */}
            <div
              className={cn(
                'hidden lg:block',
                'transition-all duration-700 delay-200 motion-reduce:translate-y-0 motion-reduce:opacity-100',
                heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
              )}
              aria-hidden="true"
            >
              <FeatureMockup featureId={content.id} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Lift wrapper: white content rises over dark hero ─────────────── */}
      <div className="relative -mt-16 lg:-mt-24">

        {/* ── SECTION 2: Problem / Solution ────────────────────────────────── */}
        <section
          className="rounded-t-[2rem] bg-white px-4 py-16 sm:px-6 lg:px-8"
          aria-labelledby="problem-heading"
        >
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">

              {/* Problem column */}
              <div>
                <span className="inline-block rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600">
                  O desafio
                </span>
                <h2
                  id="problem-heading"
                  className="mt-4 text-2xl font-bold text-slate-900"
                >
                  {content.problemTitle}
                </h2>
                <ul className="mt-6 space-y-3" role="list">
                  {content.problems.map((problem) => (
                    <li key={problem} className="flex items-start gap-3">
                      <span
                        className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100"
                        aria-hidden="true"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      </span>
                      <span className="text-sm leading-7 text-slate-600">{problem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solution column */}
              <div>
                <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  A solução DentalFlow
                </span>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">{content.solutionTitle}</h2>
                <div className="mt-6 space-y-3">
                  {content.solutionItems.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                          <ItemIcon className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Benefits ───────────────────────────────────────────── */}
        <section
          className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8"
          aria-labelledby="benefits-heading"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <h2 id="benefits-heading" className="text-2xl font-bold text-slate-900">
                Principais benefícios
              </h2>
              <p className="mt-2 text-slate-500">
                O que muda quando sua clínica organiza {content.title.toLowerCase()}.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {content.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-7 text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Workflow ───────────────────────────────────────────── */}
        <section
          className="bg-white px-4 py-16 sm:px-6 lg:px-8"
          aria-labelledby="workflow-heading"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-10">
              <h2 id="workflow-heading" className="text-2xl font-bold text-slate-900">
                Como funciona na prática
              </h2>
              <p className="mt-2 text-slate-500">
                Da configuração ao resultado, em quatro etapas simples.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {content.workflow.map((step, idx) => (
                <div
                  key={step.step}
                  className={cn(
                    'rounded-2xl border p-6',
                    idx === 0
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-white shadow-sm',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                      idx === 0
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {step.step}
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-slate-800">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 5: Roles ──────────────────────────────────────────────── */}
        <section
          className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8"
          aria-labelledby="roles-heading"
        >
          <div className="mx-auto max-w-5xl">
            <h2 id="roles-heading" className="text-2xl font-bold text-slate-900">
              Quem usa este módulo
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.roles.map((role) => {
                const route = ROLE_ROUTES[role.role]
                const inner = (
                  <div
                    className={cn(
                      'h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
                      route && 'transition-all hover:border-primary/40 hover:shadow-md',
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-800">{role.role}</p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">{role.value}</p>
                    {route && (
                      <p className="mt-3 text-xs font-semibold text-primary">
                        Ver visão completa →
                      </p>
                    )}
                  </div>
                )
                return route ? (
                  <Link key={role.role} to={route as '/para-secretarias'}>
                    {inner}
                  </Link>
                ) : (
                  <div key={role.role}>{inner}</div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 6: Plan note + disclaimer ────────────────────────────── */}
        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col gap-4">
              {/* Plan availability */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Disponibilidade do módulo
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">{content.planNote}</p>
                  </div>
                </div>
                <div className="mt-4 pl-7">
                  <Link
                    to="/planos"
                    className="text-xs font-semibold text-emerald-700 underline-offset-4 hover:underline"
                  >
                    Ver planos e preços completos →
                  </Link>
                </div>
              </div>

              {/* Disclaimer */}
              {content.disclaimer && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-6 text-amber-800">{content.disclaimer}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SECTION 7: Related features ──────────────────────────────────── */}
        {relatedFeatures.length > 0 && (
          <section
            className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8"
            aria-labelledby="related-heading"
          >
            <div className="mx-auto max-w-5xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 id="related-heading" className="text-lg font-bold text-slate-900">
                  Explore outros módulos
                </h2>
                <Link
                  to="/funcionalidades"
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedFeatures.map((feature) => {
                  const FeatureIcon = feature.icon
                  return (
                    <Link key={feature.id} to={feature.href as '/funcionalidades/agenda'}>
                      <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-primary/10">
                          <FeatureIcon
                            className="h-4 w-4 text-slate-500 transition-colors group-hover:text-primary"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{feature.label}</p>
                          <p className="text-xs text-primary">Ver detalhes →</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 8: Final CTA ──────────────────────────────────────────── */}
        <section
          ref={ctaRef}
          className="relative overflow-hidden bg-slate-950 py-20 px-4 sm:px-6 lg:px-8"
          aria-labelledby="feature-cta-heading"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-1/4 top-0 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-emerald-500/[0.1] blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-[380px] w-[380px] translate-y-1/2 rounded-full bg-blue-600/[0.08] blur-3xl" />
          </div>
          <div
            className={cn(
              'relative mx-auto max-w-2xl text-center',
              'transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
              ctaVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              7 dias grátis · Sem cartão de crédito
            </span>
            <h2
              id="feature-cta-heading"
              className="mt-5 text-3xl font-bold text-white sm:text-4xl"
            >
              Comece a usar {content.title.toLowerCase()} hoje mesmo
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Teste grátis por 7 dias. Cancele quando quiser.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
                <Link to="/planos">Ver todos os planos</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}

