import {
  Boxes,
  FileSpreadsheet,
  FolderSearch,
  type LucideIcon,
  PhoneCall,
  TrendingDown,
  Unplug,
} from 'lucide-react'

import { Reveal, StaggerGroup, StaggerItem } from './Reveal'

type PainPoint = {
  icon: LucideIcon
  title: string
  description: string
}

const PAIN_POINTS: PainPoint[] = [
  {
    icon: FileSpreadsheet,
    title: 'Agenda em planilhas e papel',
    description:
      'Horários remarcados na correria, encaixes esquecidos e nenhuma visão real do dia.',
  },
  {
    icon: PhoneCall,
    title: 'Confirmações feitas uma a uma',
    description:
      'A recepção gasta horas ligando e mandando mensagem manualmente para cada paciente.',
  },
  {
    icon: TrendingDown,
    title: 'Financeiro no escuro',
    description: 'Entradas, saídas e inadimplência sem controle — decisões tomadas no achismo.',
  },
  {
    icon: FolderSearch,
    title: 'Prontuários espalhados',
    description:
      'Histórico do paciente perdido entre pastas, cadernos e arquivos de difícil acesso.',
  },
  {
    icon: Boxes,
    title: 'Estoque controlado de memória',
    description: 'Materiais que acabam sem aviso e compras feitas no susto, sem previsibilidade.',
  },
  {
    icon: Unplug,
    title: 'Sistemas que não se conversam',
    description: 'Cada ferramenta de um lado, dados duplicados e retrabalho que ninguém controla.',
  },
]

export function ProblemSection() {
  return (
    <section
      className="relative overflow-hidden bg-white py-20 lg:py-28"
      aria-labelledby="problem-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            O dia a dia sem um sistema
          </p>
          <h2
            id="problem-heading"
            className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl"
          >
            Gerir a clínica no improviso cobra um preço alto
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Quando agenda, pacientes, dinheiro e estoque vivem em lugares diferentes, a operação
            trava — e o crescimento da clínica fica em segundo plano.
          </p>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {PAIN_POINTS.map((pain) => {
            const Icon = pain.icon
            return (
              <StaggerItem key={pain.title}>
                <article className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200 transition-colors duration-500 group-hover:text-slate-500">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{pain.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{pain.description}</p>
                </article>
              </StaggerItem>
            )
          })}
        </StaggerGroup>

        <Reveal className="mx-auto mt-12 max-w-2xl text-center" delay={0.1}>
          <p className="text-base text-slate-500">
            O resultado é sempre o mesmo:{' '}
            <span className="font-semibold text-slate-800">
              retrabalho, tempo perdido e decisões no escuro.
            </span>{' '}
            Existe um jeito melhor.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
