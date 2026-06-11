import { ArrowDown, ArrowRight, CheckCircle2, Monitor, Sparkles, Upload } from 'lucide-react'
import { Fragment } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useRevealOnScroll } from '../hooks/useRevealOnScroll'

const PIPELINE_STEPS = [
  {
    icon: Monitor,
    title: 'Sistema anterior',
    chips: ['Pacientes', 'Agenda', 'Contatos', 'Histórico', 'Serviços'],
    accent: false,
  },
  {
    icon: Upload,
    title: 'Dados exportados',
    chips: ['CSV', 'XLSX', 'PDF', 'Relatórios'],
    accent: false,
  },
  {
    icon: Sparkles,
    title: 'DentalFlow',
    chips: ['Agenda', 'Pacientes', 'Gestão', 'Financeiro'],
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
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.12)

  return (
    <section ref={ref} className="bg-white py-24 lg:py-32" aria-labelledby="migration-heading">
      <div
        className={cn(
          'mx-auto max-w-6xl px-6 transition-all duration-700 lg:px-8 motion-reduce:translate-y-0 motion-reduce:opacity-100',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        )}
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ── Left: copy ─────────────────────────────────────── */}
          <div>
            <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Migração Facilitada
            </span>

            <h2
              id="migration-heading"
              className="mt-5 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl"
            >
              Troque de sistema <span className="text-emerald-600">sem recomeçar do zero</span>
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Já usa outro software na clínica? Após a contratação do plano, o DentalFlow oferece{' '}
              <strong className="font-semibold text-slate-800">migração gratuita</strong> com base
              nos dados exportados pelo sistema anterior, ajudando sua equipe a começar com mais
              continuidade, segurança e menos retrabalho.
            </p>

            <ul className="mt-8 space-y-3" aria-label="Benefícios da migração assistida">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-700">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Button size="lg" asChild>
                <a href="#planos">
                  Conhecer os planos
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-400">
              * A migração depende da disponibilidade, qualidade e formato dos dados exportados pelo
              sistema anterior.
            </p>
          </div>

          {/* ── Right: visual migration pipeline ───────────────── */}
          <div
            role="img"
            aria-label="Fluxo de migração: sistema anterior, dados exportados e DentalFlow"
          >
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                {PIPELINE_STEPS.map((step, index) => {
                  const isLast = index === PIPELINE_STEPS.length - 1
                  const Icon = step.icon

                  return (
                    <Fragment key={step.title}>
                      <div
                        className={cn(
                          'rounded-xl p-5 ring-1',
                          step.accent
                            ? 'bg-emerald-50/70 ring-2 ring-emerald-200'
                            : 'bg-white shadow-sm ring-slate-200',
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                              step.accent ? 'bg-emerald-100' : 'bg-slate-100',
                            )}
                            aria-hidden="true"
                          >
                            <Icon
                              className={cn(
                                'h-6 w-6',
                                step.accent ? 'text-emerald-600' : 'text-slate-500',
                              )}
                            />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={cn(
                                'text-base font-semibold',
                                step.accent ? 'text-emerald-800' : 'text-slate-800',
                              )}
                            >
                              {step.title}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
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
                        </div>
                      </div>

                      {!isLast && (
                        <div className="flex justify-center py-1" aria-hidden="true">
                          <ArrowDown className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
