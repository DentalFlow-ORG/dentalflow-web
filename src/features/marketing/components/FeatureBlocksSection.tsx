import { ArrowRight } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'

import { featureBlocks } from '../data/public-content'

export function FeatureBlocksSection() {
  return (
    <section id="funcionalidades-preview" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Módulos da plataforma"
          title="Tudo o que sua clínica precisa em um só lugar"
          description="Do primeiro paciente ao relatório gerencial — cada módulo foi pensado para resolver problemas reais da operação odontológica."
          align="center"
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureBlocks.map((feature, index) => {
            const Icon = feature.icon
            const isHighlighted = index === 6 // IA block
            return (
              <article
                key={feature.id}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg',
                  isHighlighted
                    ? 'border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-50 hover:shadow-primary/10'
                    : 'border-slate-200 bg-white hover:border-primary/30 hover:shadow-slate-200/80',
                )}
              >
                {feature.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {feature.badge}
                  </span>
                )}

                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    isHighlighted ? 'bg-primary/15' : 'bg-primary/10',
                  )}
                >
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-800">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>

                {/* Problem / gain strip */}
                <div className="mt-4 space-y-1.5 rounded-lg bg-slate-50 p-3">
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-100"
                      aria-hidden="true"
                    >
                      <span className="h-1 w-1 rounded-full bg-red-500" />
                    </span>
                    <p className="text-xs leading-5 text-slate-500">{feature.problem}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-100"
                      aria-hidden="true"
                    >
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    </span>
                    <p className="text-xs leading-5 text-slate-500">{feature.gain}</p>
                  </div>
                </div>

                <a
                  href={feature.route}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                  aria-label={`Saiba mais sobre ${feature.title}`}
                >
                  Saiba mais
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </article>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/funcionalidades"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            Ver comparativo completo de funcionalidades por plano
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
