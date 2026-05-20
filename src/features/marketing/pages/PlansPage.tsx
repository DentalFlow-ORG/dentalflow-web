import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, Clock3, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  COMMERCIAL_PLAN_LABELS,
  PLAN_ORDER,
  type PlanFeatureAvailability,
  getFeatureAvailability,
  getFeaturesByCategory,
} from '@/features/marketing/config/features'
import { cn } from '@/lib/utils'

import { PublicLayout } from '../components/PublicLayout'
import { usePageMeta } from '../hooks/usePageMeta'
import { landingPlans } from '../data/landing-content'

export function PlansPage() {
  usePageMeta(
    'DentalFlow | Planos e preços para clínicas odontológicas',
    'Compare os planos Starter, Professional e Premium. Veja o que está incluído em cada plano e escolha o ideal para sua clínica.',
  )
  const featureGroups = getFeaturesByCategory()

  return (
    <PublicLayout showAnnouncement={false}>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white pb-12 pt-28 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Planos e preços
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Escolha o plano ideal para sua clínica
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-500">
            7 dias de teste gratuito em todos os planos. Sem cartão de crédito, sem compromisso.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section className="bg-white pb-16 pt-4">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {landingPlans.map((plan) => (
              <div
                key={plan.key}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-7',
                  plan.isRecommended
                    ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20'
                    : 'border-slate-200 bg-white',
                )}
              >
                {plan.isRecommended && (
                  <span className="absolute right-5 top-5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
                    Mais popular
                  </span>
                )}

                <p
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider',
                    plan.isRecommended ? 'text-blue-200' : 'text-primary',
                  )}
                >
                  {plan.name}
                </p>
                <p
                  className={cn(
                    'mt-1 text-sm',
                    plan.isRecommended ? 'text-blue-200' : 'text-slate-500',
                  )}
                >
                  {plan.tagline}
                </p>

                <div className="mt-5 flex items-end gap-1.5">
                  <span
                    className={cn(
                      'text-3xl font-bold',
                      plan.isRecommended ? 'text-white' : 'text-slate-900',
                    )}
                  >
                    {plan.priceMonthly}
                  </span>
                  <span
                    className={cn(
                      'mb-0.5 text-sm',
                      plan.isRecommended ? 'text-blue-200' : 'text-slate-400',
                    )}
                  >
                    /mês
                  </span>
                </div>
                {plan.compareAtMonthly && (
                  <p
                    className={cn(
                      'mt-1 text-sm line-through',
                      plan.isRecommended ? 'text-blue-300/70' : 'text-slate-400',
                    )}
                  >
                    {plan.compareAtMonthly}
                  </p>
                )}

                <Button
                  variant={plan.isRecommended ? 'secondary' : 'default'}
                  className="mt-6 w-full"
                  asChild
                >
                  <Link to="/acessar" search={{ mode: 'register' }}>
                    Começar teste grátis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <ul className="mt-6 space-y-2.5" role="list" aria-label={`Recursos do plano ${plan.name}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          plan.isRecommended ? 'text-emerald-300' : 'text-emerald-500',
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          'text-sm',
                          plan.isRecommended ? 'text-blue-100' : 'text-slate-600',
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Todos os planos incluem 7 dias de teste grátis, sem cartão de crédito. Cancele a qualquer momento.
          </p>
        </div>
      </section>

      {/* ── Feature comparison ── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">Comparativo detalhado</h2>
            <p className="mt-2 text-sm text-slate-500">
              Veja exatamente o que está incluído em cada plano.
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="grid grid-cols-[minmax(22rem,1fr)_10rem_10rem_10rem] border-b border-slate-200 bg-slate-50">
              <div className="px-5 py-4 text-sm font-semibold text-slate-700">Funcionalidade</div>
              {PLAN_ORDER.map((plan) => (
                <div key={plan} className="px-4 py-4 text-center text-sm font-semibold text-slate-700">
                  {COMMERCIAL_PLAN_LABELS[plan]}
                </div>
              ))}
            </div>

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
                        className="flex items-center justify-center border-l border-slate-100 px-4 py-3.5"
                      >
                        <AvailabilityIndicator availability={getFeatureAvailability(feature, plan)} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="space-y-4 lg:hidden">
            {featureGroups.map((group) => (
              <div key={group.category} className="rounded-xl border border-slate-200 bg-white p-4">
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
                            className="flex flex-col items-center gap-1.5 rounded-md border border-slate-100 py-2 text-center"
                          >
                            <span className="text-[10px] font-semibold text-slate-500">
                              {COMMERCIAL_PLAN_LABELS[plan]}
                            </span>
                            <AvailabilityIndicator availability={getFeatureAvailability(feature, plan)} />
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 px-4 shadow-sm sm:px-6 lg:px-8">
          <h3 className="text-sm font-semibold text-slate-800">Observações importantes</h3>
          <div className="mt-3 grid gap-2.5 text-xs leading-6 text-slate-500 sm:grid-cols-2">
            <p>O assistente de IA apoia análises baseadas nos dados registrados. Não toma decisões administrativas ou clínicas.</p>
            <p>Controle fiscal organiza dados internamente. Emissão de NFS-e depende de provedor homologado (em desenvolvimento).</p>
            <p>Notificações via WhatsApp requerem conta Business aprovada pela Meta e configuração de templates.</p>
            <p>Recursos marcados "Em breve" representam evolução planejada e não garantem entrega imediata.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-semibold text-white">
            Pronto para organizar sua clínica?
          </h2>
          <p className="mt-4 text-blue-200">
            Comece hoje com 7 dias gratuitos. Sem cartão de crédito.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/acessar" search={{ mode: 'register' }}>
                Começar teste grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/perguntas-frequentes">
                Ver perguntas frequentes
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

function AvailabilityIndicator({ availability }: { availability: PlanFeatureAvailability }) {
  if (availability === 'included') {
    return <Check className="h-4 w-4 text-emerald-500" aria-label="Incluído" />
  }
  if (availability === 'soon') {
    return <Clock3 className="h-4 w-4 text-amber-400" aria-label="Em breve" />
  }
  return <X className="h-4 w-4 text-slate-300" aria-label="Não incluído" />
}
