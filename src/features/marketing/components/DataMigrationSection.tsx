import { ArrowDown, ArrowRight, CheckCircle2, Monitor, Sparkles, Upload } from 'lucide-react'
import { Fragment } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Reveal } from './landing/Reveal'

const PIPELINE_STEPS = [
  {
    icon: Monitor,
    title: 'Seu sistema atual',
    caption: 'O que você já tem hoje',
    chips: ['Pacientes', 'Agenda', 'Histórico', 'Serviços'],
    accent: false,
  },
  {
    icon: Upload,
    title: 'Exportação dos dados',
    caption: 'Em formatos comuns',
    chips: ['CSV', 'XLSX', 'PDF'],
    accent: false,
  },
  {
    icon: Sparkles,
    title: 'Pronto no DentalFlow',
    caption: 'Tudo organizado para usar',
    chips: ['Agenda', 'Pacientes', 'Financeiro'],
    accent: true,
  },
] as const

const BENEFITS = [
  'Migração gratuita após a contratação',
  'Processo assistido pela equipe',
  'Menos retrabalho para sua clínica',
  'Mais segurança na transição',
] as const

export function DataMigrationSection() {
  return (
    <section className="bg-white py-24 lg:py-32" aria-labelledby="migration-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
            Migração facilitada
          </span>
          <h2
            id="migration-heading"
            className="mt-5 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl"
          >
            Troque de sistema <span className="text-emerald-600">sem recomeçar do zero</span>
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Já usa outro software? Após a contratação, ajudamos sua equipe a trazer os dados do
            sistema anterior — para você começar com continuidade e sem retrabalho.
          </p>
        </Reveal>

        {/* ── 3-step migration journey ───────────────────────────── */}
        <Reveal className="mt-14" delay={0.05}>
          <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:gap-4">
            {PIPELINE_STEPS.map((step, index) => {
              const Icon = step.icon
              const isLast = index === PIPELINE_STEPS.length - 1
              return (
                <Fragment key={step.title}>
                  <div
                    className={cn(
                      'flex flex-1 flex-col rounded-2xl border p-6 shadow-sm',
                      step.accent
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-slate-200 bg-white',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                          step.accent
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-500',
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Etapa {index + 1}
                        </p>
                        <h3
                          className={cn(
                            'text-base font-semibold',
                            step.accent ? 'text-emerald-800' : 'text-slate-900',
                          )}
                        >
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">{step.caption}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {step.chips.map((chip) => (
                        <span
                          key={chip}
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                            step.accent
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500',
                          )}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  {!isLast && (
                    <div
                      className="flex items-center justify-center text-slate-300 lg:px-1"
                      aria-hidden="true"
                    >
                      <ArrowDown className="h-5 w-5 lg:hidden" />
                      <ArrowRight className="hidden h-6 w-6 lg:block" />
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
        </Reveal>

        {/* ── Benefits + CTA + trust ─────────────────────────────── */}
        <Reveal className="mt-10" delay={0.1}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 lg:p-8">
            <ul
              className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4"
              aria-label="Benefícios da migração assistida"
            >
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-slate-700">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col items-start gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-6 text-slate-500">
                Nossa equipe acompanha a importação dos seus dados para você começar com segurança —
                sem dor de cabeça e sem perder seu histórico.
              </p>
              <Button size="lg" asChild>
                <a href="#planos">
                  Conhecer os planos
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-400">
            * A migração depende da disponibilidade, qualidade e formato dos dados exportados pelo
            sistema anterior.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
