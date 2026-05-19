import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'

import { processSteps } from '../data/landing-content'

export function ProcessSection() {
  return (
    <section id="como-funciona" className="border-t border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <SectionHeading
            eyebrow="Como funciona"
            title="Configure a clínica e comece a usar em minutos."
            description="Do cadastro à operação completa, sem treinamento técnico e sem complicação."
          />

          <div className="flex flex-col gap-6">
            {/* Steps with connector lines */}
            <div className="relative">
              {/* Vertical connector — mobile */}
              <div
                aria-hidden="true"
                className="absolute left-[1.125rem] top-9 h-[calc(100%-2.25rem)] w-0 border-l-2 border-dashed border-primary/20 sm:hidden"
              />
              {/* Horizontal connector — desktop 2-column grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {processSteps.map((item, index) => (
                  <article
                    key={item.step}
                    className="relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    {/* Connector line to next sibling — right edge on sm+ */}
                    {index % 2 === 0 && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-2 top-[2.625rem] hidden w-4 border-t-2 border-dashed border-primary/20 sm:block"
                      />
                    )}
                    <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white ring-4 ring-white">
                      {item.step}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>

            {/* Inline CTA */}
            <p className="text-sm text-slate-500">
              Pronto para começar?{' '}
              <Link
                to="/acessar"
                search={{ mode: 'register' }}
                className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Iniciar teste grátis
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
