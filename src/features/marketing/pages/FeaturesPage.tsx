import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, Clock3, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { companyInfo } from '@/config/company'
import { cn } from '@/lib/utils'

import { PublicLayout } from '../components/PublicLayout'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  COMMERCIAL_PLAN_LABELS,
  type CommercialFeatureCategory,
  PLAN_ORDER,
  type PlanFeatureAvailability,
  getFeatureAvailability,
  getFeaturesByCategory,
} from '../config/features'

const CATEGORY_DETAIL_ROUTES: Partial<Record<CommercialFeatureCategory, string>> = {
  agenda: '/funcionalidades/agenda',
  patients: '/funcionalidades/pacientes',
  finance: '/funcionalidades/financeiro',
  inventory: '/funcionalidades/estoque',
  fiscal: '/funcionalidades/controle-fiscal',
  intelligence: '/funcionalidades/relatorios',
}

export function FeaturesPage() {
  usePageMeta(
    'DentalFlow | Funcionalidades por plano',
    'Compare todos os recursos do DentalFlow por plano. Veja o que está incluído em Starter, Professional e Premium.',
  )
  const featureGroups = getFeaturesByCategory()

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white pb-10 pt-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Comparativo DentalFlow
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Funcionalidades por plano
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Compare os recursos disponíveis em cada plano. A matriz organiza o que está incluído, o que não está incluído e o que ainda está em evolução.
              </p>
              <p className="mt-3 text-sm italic text-slate-400">{companyInfo.brandSlogan}</p>
            </div>
            <Button asChild className="shrink-0">
              <Link to="/planos">
                Ver planos e preços
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Feature matrix ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Desktop table */}
        <section className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:block">
          <div className="overflow-x-auto">
            <div className="min-w-[60rem]">
              <div className="grid grid-cols-[minmax(24rem,1fr)_12rem_12rem_12rem] border-b border-border bg-muted/60">
                <div className="px-5 py-4 text-sm font-semibold text-foreground">Funcionalidade</div>
                {PLAN_ORDER.map((plan) => (
                  <div key={plan} className="px-5 py-4 text-center text-sm font-semibold text-foreground">
                    {COMMERCIAL_PLAN_LABELS[plan]}
                  </div>
                ))}
              </div>

              {featureGroups.map((group) => (
                <div key={group.category}>
                  <div className="border-b border-border bg-background px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.label}
                      </h2>
                      {CATEGORY_DETAIL_ROUTES[group.category] && (
                        <Link
                          to={CATEGORY_DETAIL_ROUTES[group.category] as string}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Saiba mais →
                        </Link>
                      )}
                    </div>
                  </div>

                  {group.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="grid grid-cols-[minmax(24rem,1fr)_12rem_12rem_12rem] border-b border-border last:border-b-0"
                    >
                      <div className="px-5 py-4">
                        <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                          {feature.description}
                        </p>
                        {feature.clientFriendlyExplanation && (
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {feature.clientFriendlyExplanation}
                          </p>
                        )}
                      </div>

                      {PLAN_ORDER.map((plan) => (
                        <div
                          key={plan}
                          className="flex items-center justify-center border-l border-border px-5 py-4"
                        >
                          <AvailabilityIndicator availability={getFeatureAvailability(feature, plan)} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile cards */}
        <section className="space-y-5 lg:hidden">
          {featureGroups.map((group) => (
            <div key={group.category} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h2>
                {CATEGORY_DETAIL_ROUTES[group.category] && (
                  <Link
                    to={CATEGORY_DETAIL_ROUTES[group.category] as string}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Saiba mais →
                  </Link>
                )}
              </div>
              <div className="mt-4 space-y-4">
                {group.features.map((feature) => (
                  <article key={feature.id} className="rounded-md border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{feature.description}</p>
                    {feature.clientFriendlyExplanation && (
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {feature.clientFriendlyExplanation}
                      </p>
                    )}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {PLAN_ORDER.map((plan) => (
                        <div
                          key={plan}
                          className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border border-border bg-card px-2 py-3 text-center"
                        >
                          <span className="text-xs font-semibold text-muted-foreground">
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
        </section>

        {/* Notes */}
        <section className="mt-8 rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Observações importantes</h2>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-2">
            <p>
              Financeiro SaaS é uma área interna da administração do DentalFlow e não aparece como funcionalidade comercial da clínica.
            </p>
            <p>
              Controle interno de notas organiza dados fiscais, rascunhos e acompanhamento. Não promete emissão fiscal automática ou real sem provedor e configuração adequados.
            </p>
            <p>
              Assistente IA apoia análises baseadas nos dados registrados no sistema. Ele não toma decisões administrativas, contábeis ou clínicas.
            </p>
            <p>
              Recursos marcados como "Em breve" representam evolução planejada ou controlada e não devem ser tratados como entrega imediata.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}

function AvailabilityIndicator({ availability }: { availability: PlanFeatureAvailability }) {
  if (availability === 'included') {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Incluído
      </span>
    )
  }

  if (availability === 'soon') {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
        Em breve
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-border',
      )}
    >
      <X className="h-3.5 w-3.5" aria-hidden="true" />
      Não incluído
    </span>
  )
}
