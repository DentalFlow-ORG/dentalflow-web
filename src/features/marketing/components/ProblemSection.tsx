import { CheckCircle2 } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'

import { painPoints } from '../data/landing-content'

export function ProblemSection() {
  return (
    <section
      id="solucoes"
      className="border-y border-slate-900 bg-slate-950 py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <SectionHeading
          eyebrow="O problema"
          title="Muitas clinicas investem em digital sem um sistema comercial claro."
          description="O DentalFlow organiza os pontos que normalmente ficam soltos: posicionamento, canais, conversao, acompanhamento e leitura de resultados."
          tone="dark"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {painPoints.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-white p-5 shadow-sm"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <p className="font-semibold leading-7 text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
