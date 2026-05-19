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

          <div className="grid gap-4 sm:grid-cols-2">
            {processSteps.map((item) => (
              <article
                key={item.step}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
