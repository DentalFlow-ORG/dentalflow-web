import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, LayoutDashboard, Stethoscope } from 'lucide-react'

import { CheckBadge } from '@/components/common/CheckBadge'
import { Eyebrow } from '@/components/common/Eyebrow'
import { MetricCard } from '@/components/common/MetricCard'
import { Button } from '@/components/ui/button'

import {
  heroMetrics,
  quickActions,
  trialHighlights,
} from '../data/landing-content'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20">
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(90deg,rgba(30,58,138,0.12),rgba(16,185,129,0.08),rgba(99,102,241,0.12))] blur-3xl" />
      <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <Eyebrow icon={Stethoscope}>
            Plataforma premium para crescimento odontológico
          </Eyebrow>

          <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.02] text-slate-950 sm:text-6xl lg:text-7xl">
            Crescimento digital mais organizado para clínicas odontológicas.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            O DentalFlow estrutura presença digital, aquisição de pacientes,
            rotina comercial e indicadores para clínicas que querem crescer com
            consistência e imagem premium.
          </p>

          <div className="mt-7 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            Teste grátis da plataforma
            <span className="hidden h-4 w-px bg-emerald-200 sm:block" />
            <span>sem cartão de crédito</span>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="xl" asChild>
              <Link to="/acessar" search={{ mode: 'register' }}>
                Começar teste grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="xl">
              Conhecer estrutura
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {trialHighlights.map((item) => (
              <CheckBadge key={item}>{item}</CheckBadge>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <MetricCard key={metric.value} {...metric} />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Visão executiva
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    Performance comercial
                  </h2>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-primary">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              {quickActions.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-6 mb-6 rounded-lg bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Estrutura pensada para conversão, autoridade e previsibilidade.
              </div>
              <div className="mt-5 h-2 rounded-full bg-slate-800">
                <div className="h-2 w-[78%] rounded-full bg-secondary" />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-400">Maturidade digital</span>
                <span className="font-semibold text-white">78%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
