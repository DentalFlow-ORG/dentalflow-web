import { CheckCircle2, PhoneCall, TrendingUp } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'
import { Button } from '@/components/ui/button'

const contactChecklist = [
  'Diagnóstico de presença digital e jornada comercial.',
  'Organização de páginas, mensagens e chamadas para ação.',
  'Indicadores para acompanhar evolução e tomar decisões.',
] as const

export function ContactSection() {
  return (
    <section id="contato" className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-8 lg:p-12">
            <SectionHeading
              eyebrow="Próximo passo"
              title="Veja como o DentalFlow pode organizar o crescimento da sua clínica."
              description="Uma conversa inicial ajuda a entender maturidade digital, oportunidades comerciais e prioridades para os próximos ciclos."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="xl">
                Agendar conversa
                <PhoneCall className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="xl">
                Receber proposta
              </Button>
            </div>
          </div>

          <div className="bg-slate-950 p-8 text-white lg:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
              <TrendingUp className="h-7 w-7" />
            </div>
            <h3 className="mt-8 text-2xl font-semibold">
              Estrutura comercial com aparência premium e leitura executiva.
            </h3>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
              {contactChecklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
