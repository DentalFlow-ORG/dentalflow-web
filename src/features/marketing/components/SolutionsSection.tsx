import { ArrowRight } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'

import { solutions } from '../data/landing-content'

export function SolutionsSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Como o DentalFlow resolve"
          title="O DentalFlow resolve a rotina da sua clínica."
          description="Cada funcionalidade foi pensada para eliminar os gargalos mais comuns do dia a dia de clínicas odontológicas."
          align="center"
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution) => {
            const Icon = solution.icon
            return (
              <article
                key={solution.title}
                className="group flex flex-col items-start rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{solution.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">{solution.description}</p>
                <a
                  href="#funcionalidades"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Saiba mais
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
