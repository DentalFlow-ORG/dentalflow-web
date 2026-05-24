import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  MessageCircle,
  Package,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { PublicLayout } from '../components/PublicLayout'
import { usePageMeta } from '../hooks/usePageMeta'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import {
  COMMERCIAL_PLAN_LABELS,
  type CommercialFeatureCategory,
  PLAN_ORDER,
  type PlanFeatureAvailability,
  getFeatureAvailability,
  getFeaturesByCategory,
} from '../config/features'

// ── Navigation data ────────────────────────────────────────────────────────────

type FeatureModule = {
  id: string
  label: string
  description: string
  href: string
  icon: typeof CalendarDays
}

const FEATURED_MODULES: FeatureModule[] = [
  {
    id: 'agenda',
    label: 'Agenda inteligente',
    description: 'Gerencie consultas, horários e status. Sincronize com Google Calendar.',
    href: '/funcionalidades/agenda',
    icon: CalendarDays,
  },
  {
    id: 'prontuarios',
    label: 'Prontuário eletrônico',
    description: 'Histórico clínico completo, modelos e evoluções por paciente.',
    href: '/funcionalidades/prontuarios',
    icon: ClipboardList,
  },
  {
    id: 'financeiro',
    label: 'Gestão financeira',
    description: 'Receitas, despesas, fluxo de caixa e categorias organizadas.',
    href: '/funcionalidades/financeiro',
    icon: CreditCard,
  },
  {
    id: 'pacientes',
    label: 'Pacientes e leads',
    description: 'Cadastro centralizado, histórico de relacionamento e CRM de leads.',
    href: '/funcionalidades/pacientes',
    icon: Users,
  },
  {
    id: 'relatorios',
    label: 'Relatórios e indicadores',
    description: 'Indicadores gerenciais, metas e desempenho operacional da clínica.',
    href: '/funcionalidades/relatorios',
    icon: TrendingUp,
  },
  {
    id: 'ia',
    label: 'IA de gestão',
    description: 'Análises baseadas nos dados da clínica para apoiar decisões.',
    href: '/funcionalidades/ia',
    icon: Bot,
  },
]

const OTHER_MODULES: FeatureModule[] = [
  {
    id: 'estoque',
    label: 'Controle de estoque',
    description: 'Produtos, movimentações e alertas de reposição.',
    href: '/funcionalidades/estoque',
    icon: Package,
  },
  {
    id: 'leads',
    label: 'CRM de leads',
    description: 'Acompanhe potenciais pacientes do primeiro contato à conversão.',
    href: '/funcionalidades/leads',
    icon: Target,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp e notificações',
    description: 'Lembretes e confirmações automáticas via WhatsApp para pacientes.',
    href: '/funcionalidades/whatsapp',
    icon: MessageCircle,
  },
  {
    id: 'controle-fiscal',
    label: 'Controle fiscal',
    description: 'Organização interna de dados fiscais, rascunhos e acompanhamento.',
    href: '/funcionalidades/controle-fiscal',
    icon: FileText,
  },
]

const CATEGORY_DETAIL_ROUTES: Partial<Record<CommercialFeatureCategory, string>> = {
  agenda: '/funcionalidades/agenda',
  patients: '/funcionalidades/pacientes',
  finance: '/funcionalidades/financeiro',
  inventory: '/funcionalidades/estoque',
  fiscal: '/funcionalidades/controle-fiscal',
  intelligence: '/funcionalidades/relatorios',
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function FeaturesPage() {
  usePageMeta(
    'DentalFlow | Funcionalidades por plano',
    'Compare todos os recursos do DentalFlow por plano. Veja o que está incluído em Starter, Professional e Premium.',
  )
  const featureGroups = getFeaturesByCategory()
  const { ref: heroRef, isVisible: heroVisible } = useRevealOnScroll<HTMLElement>(0.05)
  const { ref: ctaRef, isVisible: ctaVisible } = useRevealOnScroll<HTMLElement>(0.1)

  return (
    <PublicLayout darkHero>
      {/* ── Dark hero ──────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-slate-950 pb-44 pt-28 lg:pb-52 lg:pt-36"
        aria-labelledby="features-heading"
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-72 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/[0.07] blur-3xl" />
          <div className="absolute -right-72 bottom-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.06] blur-3xl" />
          <div className="absolute inset-x-0 top-1/3 flex justify-center">
            <div className="h-[400px] w-[800px] rounded-full bg-blue-500/[0.04] blur-3xl" />
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div
            className={cn(
              'text-center transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
              heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              <Zap className="h-3 w-3" aria-hidden="true" />
              Funcionalidades
            </span>

            <h1
              id="features-heading"
              className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Toda a gestão da sua clínica{' '}
              <span className="text-emerald-400">em um só lugar</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Do agendamento ao financeiro, do prontuário à inteligência artificial —
              DentalFlow cobre todas as áreas da sua operação.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
                <Link to="/planos">
                  Ver planos e preços
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lift wrapper ─────────────────────────────────────────────────────── */}
      <div className="-mt-16 rounded-t-[2rem] bg-white lg:-mt-24">

        {/* ── Main feature modules ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pt-14 lg:px-8 lg:pt-20" aria-label="Módulos principais">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Módulos principais
            </h2>
            <p className="mt-2 text-base text-slate-500">
              As ferramentas mais usadas no dia a dia de uma clínica odontológica moderna.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_MODULES.map((module) => {
              const Icon = module.icon
              return (
                <Link
                  key={module.id}
                  to={module.href}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 transition-colors group-hover:bg-emerald-100">
                    <Icon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{module.label}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-500">{module.description}</p>
                  <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 transition-colors group-hover:text-emerald-700">
                    Saiba mais
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Additional modules ───────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 lg:px-8 lg:pt-16" aria-label="Módulos adicionais">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Funcionalidades adicionais
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Recursos especializados disponíveis nos planos Professional e Premium.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OTHER_MODULES.map((module) => {
              const Icon = module.icon
              return (
                <Link
                  key={module.id}
                  to={module.href}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 transition-colors group-hover:bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-slate-800">{module.label}</h3>
                  <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{module.description}</p>
                  <span className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-700">
                    Ver detalhes
                    <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Comparison matrix ───────────────────────────────────────────── */}
        <section
          className="border-t border-slate-100 bg-slate-50 px-6 py-16 lg:px-8 lg:py-20"
          aria-labelledby="comparison-heading"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <h2
                id="comparison-heading"
                className="text-2xl font-semibold text-slate-900 sm:text-3xl"
              >
                Comparativo por plano
              </h2>
              <p className="mt-2 text-base text-slate-500">
                Veja exatamente o que está incluído em cada plano antes de decidir.
              </p>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <div className="min-w-[60rem]">
                  {/* Header */}
                  <div className="grid grid-cols-[minmax(24rem,1fr)_12rem_12rem_12rem] border-b border-slate-200 bg-slate-50">
                    <div className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Funcionalidade
                    </div>
                    {PLAN_ORDER.map((plan) => (
                      <div
                        key={plan}
                        className={cn(
                          'px-6 py-4 text-center text-sm font-semibold',
                          plan === 'professional'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-700',
                        )}
                      >
                        {COMMERCIAL_PLAN_LABELS[plan]}
                        {plan === 'professional' && (
                          <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            Popular
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {featureGroups.map((group) => (
                    <div key={group.category}>
                      {/* Category header */}
                      <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {group.label}
                          </h3>
                          {CATEGORY_DETAIL_ROUTES[group.category] && (
                            <Link
                              to={CATEGORY_DETAIL_ROUTES[group.category] as string}
                              className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                            >
                              Saiba mais →
                            </Link>
                          )}
                        </div>
                      </div>

                      {group.features.map((feature) => (
                        <div
                          key={feature.id}
                          className="grid grid-cols-[minmax(24rem,1fr)_12rem_12rem_12rem] border-b border-slate-100 last:border-b-0"
                        >
                          <div className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-800">{feature.title}</p>
                            <p className="mt-0.5 text-sm leading-5 text-slate-500">
                              {feature.description}
                            </p>
                            {feature.clientFriendlyExplanation && (
                              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                                {feature.clientFriendlyExplanation}
                              </p>
                            )}
                          </div>

                          {PLAN_ORDER.map((plan) => (
                            <div
                              key={plan}
                              className={cn(
                                'flex items-center justify-center border-l border-slate-100 px-5 py-4',
                                plan === 'professional' && 'bg-emerald-50/40',
                              )}
                            >
                              <AvailabilityIndicator
                                availability={getFeatureAvailability(feature, plan)}
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
            <div className="space-y-5 lg:hidden">
              {featureGroups.map((group) => (
                <div
                  key={group.category}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 bg-slate-50 px-4 py-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {group.label}
                    </h3>
                    {CATEGORY_DETAIL_ROUTES[group.category] && (
                      <Link
                        to={CATEGORY_DETAIL_ROUTES[group.category] as string}
                        className="text-xs font-medium text-emerald-600 hover:underline"
                      >
                        Saiba mais →
                      </Link>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 p-4">
                    {group.features.map((feature) => (
                      <article key={feature.id} className="py-4 first:pt-0 last:pb-0">
                        <p className="text-sm font-medium text-slate-800">{feature.title}</p>
                        <p className="mt-0.5 text-sm leading-5 text-slate-500">
                          {feature.description}
                        </p>
                        {feature.clientFriendlyExplanation && (
                          <p className="mt-1.5 text-xs leading-5 text-slate-400">
                            {feature.clientFriendlyExplanation}
                          </p>
                        )}
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {PLAN_ORDER.map((plan) => (
                            <div
                              key={plan}
                              className={cn(
                                'flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-center',
                                plan === 'professional'
                                  ? 'border-emerald-200 bg-emerald-50'
                                  : 'border-slate-200 bg-slate-50',
                              )}
                            >
                              <span
                                className={cn(
                                  'text-xs font-semibold',
                                  plan === 'professional' ? 'text-emerald-700' : 'text-slate-500',
                                )}
                              >
                                {COMMERCIAL_PLAN_LABELS[plan]}
                              </span>
                              <AvailabilityIndicator
                                availability={getFeatureAvailability(feature, plan)}
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
            <div className="mt-8 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-6">
              <h3 className="text-sm font-semibold text-amber-800">Observações importantes</h3>
              <div className="mt-3 grid gap-2 text-xs leading-6 text-amber-700 sm:grid-cols-2">
                <p>
                  Financeiro SaaS é uma área interna da administração do DentalFlow e não aparece
                  como funcionalidade comercial da clínica.
                </p>
                <p>
                  Controle interno de notas organiza dados fiscais, rascunhos e acompanhamento.
                  Não promete emissão fiscal automática ou real sem provedor e configuração adequados.
                </p>
                <p>
                  Assistente IA apoia análises baseadas nos dados registrados no sistema. Ele não
                  toma decisões administrativas, contábeis ou clínicas.
                </p>
                <p>
                  Recursos marcados como "Em breve" representam evolução planejada ou controlada e
                  não devem ser tratados como entrega imediata.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section
          ref={ctaRef}
          className="bg-slate-950 px-6 py-20 lg:px-8 lg:py-28"
          aria-label="Chamada para ação"
        >
          <div
            className={cn(
              'mx-auto max-w-2xl text-center transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
              ctaVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Pronto para organizar sua clínica?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Comece com 7 dias grátis. Sem cartão de crédito, cancele quando quiser.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
                <Link to="/planos">
                  Comparar planos
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}

// ── Availability indicator ─────────────────────────────────────────────────────

function AvailabilityIndicator({ availability }: { availability: PlanFeatureAvailability }) {
  if (availability === 'included') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <Check className="h-3 w-3" aria-hidden="true" />
        Incluído
      </span>
    )
  }

  if (availability === 'soon') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
        <Clock3 className="h-3 w-3" aria-hidden="true" />
        Em breve
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400 ring-1 ring-slate-200">
      <X className="h-3 w-3" aria-hidden="true" />
      Não incl.
    </span>
  )
}
