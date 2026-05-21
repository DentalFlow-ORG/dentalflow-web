import { Link } from '@tanstack/react-router'
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { PublicLayout } from '../components/PublicLayout'
import type { FeatureDetailContent } from '../data/public-content'

type FeatureDetailPageProps = {
  content: FeatureDetailContent
}

export function FeatureDetailPage({ content }: FeatureDetailPageProps) {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pb-14 pt-28 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {content.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            {content.hero}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-500">
            {content.heroSub}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link to="/acessar" search={{ mode: 'register' }}>
                Testar grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/planos">Ver planos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                O desafio
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                {content.problemTitle}
              </h2>
              <ul className="mt-6 space-y-3" role="list">
                {content.problems.map((problem) => (
                  <li key={problem} className="flex items-start gap-3">
                    <span
                      className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100"
                      aria-hidden="true"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    </span>
                    <span className="text-sm leading-6 text-slate-600">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution items */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                A solução DentalFlow
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                {content.solutionTitle}
              </h2>
              <div className="mt-6 space-y-4">
                {content.solutionItems.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <ItemIcon className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
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

      {/* Benefits */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-slate-900">Principais benefícios</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {content.benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span className="text-sm leading-6 text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-slate-900">Como funciona na prática</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.workflow.map((step, idx) => (
              <div
                key={step.step}
                className={cn(
                  'rounded-xl border p-5',
                  idx === 0
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-slate-200 bg-white',
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {step.step}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-800">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-slate-900">Quem usa este módulo</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.roles.map((role) => (
              <div
                key={role.role}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {role.role}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{role.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan note + disclaimer */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <p className="text-sm text-emerald-800">
                <span className="font-semibold">Disponibilidade: </span>
                {content.planNote}
              </p>
            </div>
            {content.disclaimer && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                <p className="text-sm text-amber-800">{content.disclaimer}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-semibold text-white">
            Experimente {content.title.toLowerCase()} grátis por 7 dias
          </h2>
          <p className="mt-3 text-blue-200">Sem cartão de crédito. Cancele quando quiser.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/acessar" search={{ mode: 'register' }}>
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="inverse" asChild>
              <Link to="/planos">Ver todos os planos</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
