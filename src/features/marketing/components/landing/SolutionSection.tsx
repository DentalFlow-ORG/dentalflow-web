import {
  BarChart3,
  CalendarDays,
  CreditCard,
  type LucideIcon,
  MessageCircle,
  Stethoscope,
  UserPlus,
} from 'lucide-react'
import { Suspense, lazy } from 'react'

import { AuroraBackdrop } from './AuroraBackdrop'
import { Reveal, StaggerGroup, StaggerItem } from './Reveal'

// The orbit sits below the fold, so code-split it and show a static, zero-CLS
// poster while its chunk loads.
const FlowOrbit = lazy(() => import('./FlowOrbit'))

type FlowStep = { icon: LucideIcon; label: string; description: string }

// The patient journey, end to end, inside one platform.
const FLOW_STEPS: FlowStep[] = [
  { icon: UserPlus, label: 'Captação', description: 'Leads e contatos organizados' },
  { icon: CalendarDays, label: 'Agendamento', description: 'Agenda única da equipe' },
  { icon: MessageCircle, label: 'Confirmação', description: 'Lembretes via WhatsApp' },
  { icon: Stethoscope, label: 'Atendimento', description: 'Prontuário e histórico' },
  { icon: CreditCard, label: 'Pagamento', description: 'Fluxo de caixa no controle' },
  { icon: BarChart3, label: 'Decisão', description: 'Indicadores em tempo real' },
]

const HIGHLIGHTS = [
  'Tudo conectado em um só lugar',
  'Dados em tempo real',
  'Menos cliques, menos retrabalho',
] as const

function OrbitPoster() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[42rem]">
      <div
        className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)' }}
      />
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-white/[0.04] sm:h-32 sm:w-32" />
    </div>
  )
}

export function SolutionSection() {
  return (
    <section
      className="relative isolate overflow-hidden bg-slate-950 py-20 text-white lg:py-28"
      aria-labelledby="solution-heading"
    >
      <AuroraBackdrop />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            O fluxo DentalFlow
          </p>
          <h2
            id="solution-heading"
            className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl"
          >
            Uma única plataforma para o{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              fluxo inteiro da clínica
            </span>
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Do primeiro contato ao retorno do paciente, cada etapa conversa com a próxima — sem
            planilhas paralelas, sem sistemas desconectados.
          </p>
        </Reveal>

        {/* Conceptual flow orbit — the centerpiece */}
        <Reveal className="mt-12 lg:mt-16" delay={0.05}>
          <Suspense fallback={<OrbitPoster />}>
            <FlowOrbit />
          </Suspense>
        </Reveal>

        {/* Concrete patient-journey flow line (travels side to side on desktop) */}
        <div className="relative mt-14 lg:mt-20">
          <div className="absolute left-[8%] right-[8%] top-7 hidden lg:block" aria-hidden="true">
            <div
              className="h-px w-full"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(56,189,248,0.4), rgba(125,211,252,0.4), transparent)',
              }}
            />
            <div
              className="absolute inset-0 h-px"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(255,255,255,0.85), transparent)',
                transform: 'translateX(-100%)',
                animation: 'df-line-scan 4.5s ease-in-out infinite',
              }}
            />
          </div>

          <StaggerGroup
            className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6"
            stagger={0.08}
          >
            {FLOW_STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <StaggerItem key={step.label} className="flex flex-col items-center text-center">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/25 bg-slate-900 shadow-[0_0_24px_-8px_rgba(56,189,248,0.5)]">
                    <Icon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-cyan-200 ring-1 ring-white/10">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">{step.label}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-400">{step.description}</p>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>

        {/* Supporting highlights */}
        <Reveal className="mt-14 flex flex-wrap items-center justify-center gap-3" delay={0.1}>
          {HIGHLIGHTS.map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-200"
            >
              {highlight}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
