import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Headphones, ShieldCheck, XCircle, Zap } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { landingPlans } from '../data/landing-content'

export function PricingSection() {
  return (
    <section id="planos" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Planos"
            title="Escolha o plano ideal para sua clínica."
            description="Todos os planos incluem 7 dias de teste grátis. Sem cartão de crédito, sem compromisso."
            align="center"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {landingPlans.map((plan) => (
            <PlanCard key={plan.key} plan={plan} />
          ))}
        </div>

        {/* Scarcity signal */}
        <div className="mt-8 flex justify-center">
          <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <Zap className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            Preços de lançamento disponíveis enquanto durarem as vagas iniciais.
          </p>
        </div>

        {/* Trust footer */}
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
            Sem contrato de fidelidade
          </span>
          <span className="hidden text-slate-300 sm:inline" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <XCircle className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            Cancele quando quiser
          </span>
          <span className="hidden text-slate-300 sm:inline" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <Headphones className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Suporte incluso em todos os planos
          </span>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Quer comparar todas as funcionalidades?{' '}
          <Link
            to="/funcionalidades"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Ver comparativo completo
          </Link>
        </p>
      </div>
    </section>
  )
}

type PlanCardProps = {
  plan: (typeof landingPlans)[number]
}

function PlanCard({ plan }: PlanCardProps) {
  return (
    <article
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200',
        plan.isRecommended
          ? 'border-primary shadow-md motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg'
          : 'border-slate-200 motion-safe:hover:shadow-md',
      )}
    >
      <div
        className={cn(
          'flex min-h-9 items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold',
          plan.isRecommended ? 'bg-primary text-white' : 'bg-transparent',
        )}
      >
        {plan.isRecommended && (
          <>
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Mais contratado esta semana
          </>
        )}
        {!plan.isRecommended && <div aria-hidden="true" />}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
        </div>

        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-slate-500">
            De{' '}
            <span className="line-through text-slate-400">{plan.compareAtMonthly}</span>
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              oferta de lançamento · encerra em breve
            </span>
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-slate-900">{plan.priceMonthly}</span>
            <span className="text-sm font-medium text-slate-500">/mês</span>
          </div>
          <p className="mt-1.5 text-xs font-medium text-emerald-700">
            7 dias grátis para começar
          </p>
        </div>

        <ul className="mt-6 space-y-2.5" aria-label={`Funcionalidades do plano ${plan.name}`}>
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
              <span className="text-sm text-slate-600">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-2 pt-8">
          <Button
            className={cn('w-full', plan.isRecommended && 'h-12 text-base')}
            variant={plan.isRecommended ? 'default' : 'outline'}
            asChild
          >
            <Link to="/acessar" search={{ mode: 'register' }}>
              Iniciar teste grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-center text-xs text-slate-400">
            7 dias grátis · Sem cartão de crédito
          </p>
        </div>
      </div>
    </article>
  )
}
