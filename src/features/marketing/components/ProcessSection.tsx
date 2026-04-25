import { SectionHeading } from '@/components/common/SectionHeading'

import { processSteps } from '../data/landing-content'

export function ProcessSection() {
  return (
    <section id="metodo" className="bg-slate-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeading
            eyebrow="Metodo"
            title="Do diagnostico a evolucao, sem improviso."
            description="A jornada foi pensada para conectar estrategia, execucao e acompanhamento em uma rotina simples para a clinica."
            tone="dark"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {processSteps.map((item) => (
              <article
                key={item.step}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-6"
              >
                <span className="text-sm font-semibold text-emerald-300">
                  {item.step}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
