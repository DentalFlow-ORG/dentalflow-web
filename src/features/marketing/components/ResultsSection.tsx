import { SectionHeading } from '@/components/common/SectionHeading'

import { results } from '../data/landing-content'

export function ResultsSection() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading
            eyebrow="Por que o DentalFlow"
            title="Uma plataforma construída para a realidade de clínicas odontológicas."
            description="Sem promessas vagas. Apenas as funcionalidades que a clínica realmente usa, organizadas de forma clara e acessível."
            eyebrowClassName="text-primary"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {results.map((item) => (
              <div
                key={item.value}
                className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-6"
              >
                <p className="text-2xl font-bold text-primary">{item.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
