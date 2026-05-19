import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'

import { painPoints } from '../data/landing-content'

export function ProblemSection() {
  return (
    <section className="bg-[#0f3b73] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="O problema"
          title="Muitas clínicas perdem tempo e pacientes por falta de organização."
          description="Agenda descontrolada, informações espalhadas e equipe sem acesso adequado afetam a experiência do paciente e a eficiência da clínica."
          tone="dark"
          align="center"
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className={cn('font-semibold text-white')}>{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-blue-200">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
