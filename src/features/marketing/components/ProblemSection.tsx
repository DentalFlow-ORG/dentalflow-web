import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'

import { painPoints } from '../data/landing-content'

export function ProblemSection() {
  return (
    <section className="bg-[#0f3b73] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <p className="text-center text-base font-medium italic text-blue-300">
          Sua clínica ainda funciona assim?
        </p>

        <div className="mt-4">
          <SectionHeading
            eyebrow="O problema"
            title="Muitas clínicas perdem tempo e pacientes por falta de organização."
            description="Agenda descontrolada, informações espalhadas e equipe sem acesso adequado afetam a experiência do paciente e a eficiência da clínica."
            tone="dark"
            align="center"
          />
        </div>

        {/* Divider with label */}
        <div className="relative mt-10 flex items-center gap-4" aria-hidden="true">
          <div className="h-px flex-1 bg-white/10" />
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-blue-300/60">
            Reconhece algum desses problemas?
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-5 border-l-2 border-l-blue-300/40 transition-colors duration-200 hover:bg-white/[0.07]"
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

        {/* Narrative bridge into SolutionsSection */}
        <p className="mt-12 text-center text-base font-medium italic text-white/60">
          "O DentalFlow foi criado para eliminar exatamente esses problemas."
        </p>
      </div>
    </section>
  )
}
