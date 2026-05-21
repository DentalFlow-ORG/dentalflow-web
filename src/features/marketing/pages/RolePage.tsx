import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { PublicLayout } from '../components/PublicLayout'
import type { RoleContent } from '../data/public-content'

type RolePageProps = {
  content: RoleContent
}

export function RolePage({ content }: RolePageProps) {
  const Icon = content.icon

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pb-14 pt-28 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">
            <div className="max-w-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {content.role}
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                {content.tagline}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-500">{content.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/acessar" search={{ mode: 'register' }}>
                    {content.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/planos">Ver planos</Link>
                </Button>
              </div>
            </div>

            {/* Modules card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg lg:min-w-64">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Módulos utilizados
              </p>
              <ul className="mt-4 space-y-2.5" role="list">
                {content.modules.map((module) => (
                  <li key={module} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-700">{module}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            Como o DentalFlow ajuda{' '}
            <span className="text-primary">{content.role.toLowerCase()}</span>
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {content.benefits.map((benefit) => {
              const BenIcon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BenIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-800">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-semibold text-white">
            Experimente por 7 dias gratuitamente
          </h2>
          <p className="mt-3 text-blue-200">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/acessar" search={{ mode: 'register' }}>
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/funcionalidades">Ver funcionalidades</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
