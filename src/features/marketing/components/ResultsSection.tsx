import { SectionHeading } from '@/components/common/SectionHeading'

import { results } from '../data/landing-content'

const EXTRA_STAT = {
  value: '< 10 min',
  label: 'para configurar a clínica e começar a usar',
} as const

export function ResultsSection() {
  const allStats = [...results, EXTRA_STAT]

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Resultados reais"
              title="Uma plataforma construída para a realidade de clínicas odontológicas."
              description="Sem promessas vagas. Apenas as funcionalidades que a clínica realmente usa, organizadas de forma clara e acessível."
              eyebrowClassName="text-primary"
            />
            <p className="mt-4 text-xs text-slate-400">
              *Dados baseados em uso médio da plataforma durante o período beta.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {allStats.map((item) => (
              <div
                key={item.value}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-4xl font-bold text-primary">{item.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
