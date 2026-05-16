import { Link } from '@tanstack/react-router'
import { Check, Clock3, X } from 'lucide-react'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  COMMERCIAL_PLAN_LABELS,
  PLAN_ORDER,
  type PlanFeatureAvailability,
  getFeatureAvailability,
  getFeaturesByCategory,
} from '../config/features'

export function FeaturesPage() {
  const featureGroups = getFeaturesByCategory()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLink />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Início</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/app/assinatura">Ver planos</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Comparativo DentalFlow
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Funcionalidades por plano
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Compare os recursos disponíveis em cada plano. A matriz abaixo é comercial e foi
              organizada para deixar claro o que está incluído, o que não está incluído e o que
              ainda está em evolução.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/app/assinatura">Ir para assinatura</Link>
          </Button>
        </section>

        <section className="mt-8 hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:block">
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
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h2>
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
        </section>

        <section className="mt-8 space-y-5 lg:hidden">
          {featureGroups.map((group) => (
            <div key={group.category} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h2>
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

        <section className="mt-8 rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Observações importantes</h2>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-2">
            <p>
              Financeiro SaaS é uma área interna da administração do DentalFlow e não aparece como
              funcionalidade comercial da clínica.
            </p>
            <p>
              Controle interno de notas organiza dados fiscais, rascunhos e acompanhamento. Não
              promete emissão fiscal automática ou real sem provedor e configuração adequados.
            </p>
            <p>
              Assistente IA apoia análises baseadas nos dados registrados no sistema. Ele não toma
              decisões administrativas, contábeis ou clínicas.
            </p>
            <p>
              Recursos marcados como “Em breve” representam evolução planejada ou controlada e não
              devem ser tratados como entrega imediata.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        DentalFlow - comparativo comercial de funcionalidades.
      </footer>
    </div>
  )
}

function AvailabilityIndicator({ availability }: { availability: PlanFeatureAvailability }) {
  if (availability === 'included') {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Incluído
      </span>
    )
  }

  if (availability === 'soon') {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900">
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
