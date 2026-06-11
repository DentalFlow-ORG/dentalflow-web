import {
  BarChart3,
  CalendarCheck2,
  ClipboardCheck,
  Clock3,
  Layers3,
  Repeat2,
  Workflow,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { useRevealOnScroll } from '../hooks/useRevealOnScroll'

type ImpactMetric = {
  id: string
  icon: typeof Clock3
  displayPrefix?: string
  /** Raw integer used for count-up. For decimals, multiply by 10^decimalDigits. */
  value: number
  displaySuffix: string
  /** When set, value is divided by 10^decimalDigits before display (e.g. 274 → "27,4") */
  decimalDigits?: number
  label: string
  description: string
}

const IMPACT_METRICS: ImpactMetric[] = [
  {
    id: 'hours',
    icon: Clock3,
    value: 2847,
    displaySuffix: 'h/ano',
    label: 'economizadas em confirmações, registros e cobranças',
    description:
      'Tempo estimado ao digitalizar agendamento, follow-up de pacientes e controle financeiro que hoje consomem horas da recepção e da gestão.',
  },
  {
    id: 'days',
    icon: CalendarCheck2,
    value: 274,
    decimalDigits: 1,
    displaySuffix: ' dias/ano',
    label: 'devolvidos para família, pacientes e crescimento',
    description:
      'Horas economizadas convertidas em dias que podem voltar para atendimento de qualidade, treinamento ou tempo com quem importa.',
  },
  {
    id: 'tasks',
    icon: Repeat2,
    value: 183,
    displaySuffix: ' tarefas/mês',
    label: 'manuais que podem sair do seu dia',
    description:
      'Confirmações por telefone, anotações avulsas, conciliações de pagamento e conferências de estoque que um fluxo digital assume.',
  },
  {
    id: 'rework',
    icon: Workflow,
    value: 42,
    displaySuffix: '%',
    label: 'menos retrabalho com dados centralizados',
    description:
      'Erros, duplicações e retrabalho causados por informações espalhadas em papel, planilhas e mensagens que não se comunicam.',
  },
  {
    id: 'visibility',
    icon: BarChart3,
    value: 68,
    displaySuffix: '%',
    label: 'mais previsibilidade de gestão',
    description:
      'Decisões de equipe, estoque e financeiro tomadas com dados reais em vez de percepção ou relatórios montados manualmente todo mês.',
  },
  {
    id: 'flow',
    icon: Layers3,
    value: 1,
    displaySuffix: ' fluxo',
    label: 'centralizado para toda a operação da clínica',
    description:
      'Agenda, pacientes, financeiro, estoque, leads e IA no mesmo ambiente — sem alternar entre sistemas, abas e anotações desconectadas.',
  },
]

function formatValue(raw: number, decimalDigits?: number): string {
  if (!decimalDigits) {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(raw)
  }
  const divisor = 10 ** decimalDigits
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  }).format(raw / divisor)
}

const COUNT_UP_DURATION_MS = 2200

function useCountUp(target: number, isActive: boolean): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setValue(target)
      return
    }

    const startTime = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / COUNT_UP_DURATION_MS, 1)
      // Cubic ease-out: fast start, decelerates near the final value
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(target * eased))
      if (progress < 1) raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [isActive, target])

  return value
}

function ImpactCard({ metric, index }: { metric: ImpactMetric; index: number }) {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.12)
  const Icon = metric.icon
  // Each card drives its own counter: animation starts when the card enters the viewport
  const animatedValue = useCountUp(metric.value, isVisible)

  return (
    <article
      ref={ref}
      className={cn(
        'group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-slate-200/80 motion-reduce:translate-y-0 motion-reduce:opacity-100',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
      )}
      style={{ transitionDelay: isVisible ? `${Math.min(index * 60, 300)}ms` : '0ms' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          Ilustrativo
        </span>
      </div>

      {/* Dominant animated number */}
      <div className="mt-5 flex items-baseline gap-1 leading-none">
        {metric.displayPrefix && (
          <span className="text-base font-medium text-slate-400">{metric.displayPrefix}</span>
        )}
        <span className="text-5xl font-bold tabular-nums text-slate-950 sm:text-[3.5rem]">
          {formatValue(animatedValue, metric.decimalDigits)}
        </span>
        <span className="text-lg font-semibold text-primary">{metric.displaySuffix}</span>
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-snug text-slate-700">{metric.label}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{metric.description}</p>
    </article>
  )
}

export function AnimatedImpactSection() {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.12)

  return (
    <section
      id="impacto-operacional"
      ref={ref}
      className="bg-slate-50 py-20 lg:py-24"
      aria-label="Potencial de economia operacional"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            'max-w-2xl transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          )}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Potencial de economia operacional
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Quanto tempo sua clínica perde hoje fazendo isso manualmente?
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-slate-600">
            Cada confirmação por telefone, cada cobrança manual, cada conferência de agenda soma
            horas que poderiam ser suas. Veja o que a centralização operacional pode representar em
            números.
          </p>
        </div>

        {/* Metrics grid — 3 cols desktop / 2 cols tablet / 1 col mobile */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {IMPACT_METRICS.map((metric, index) => (
            <ImpactCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>

        {/* Discreet disclaimer */}
        <div
          className={cn(
            'mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-700 motion-reduce:opacity-100',
            isVisible ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transitionDelay: isVisible ? '380ms' : '0ms' }}
        >
          <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <p className="text-xs leading-5 text-slate-500">
            Estimativas ilustrativas baseadas em rotinas administrativas comuns de clínicas
            odontológicas. Resultados podem variar conforme volume de atendimentos, equipe e uso da
            plataforma.
          </p>
        </div>
      </div>
    </section>
  )
}
