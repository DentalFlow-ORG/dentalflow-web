import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { SectionHeading } from '@/components/common/SectionHeading'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { situationOptions } from '../data/public-content'

export function SituationSection() {
  const [selected, setSelected] = useState<string | null>(null)

  const selectedOption = situationOptions.find((o) => o.id === selected)

  return (
    <section
      id="situacao"
      className="bg-gradient-to-b from-slate-50 to-white py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Para sua realidade"
          title="Como sua clínica se organiza hoje?"
          description="Selecione a situação mais próxima da sua realidade e veja como o DentalFlow pode ajudar."
          align="center"
        />

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {situationOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selected === option.id
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(isSelected ? null : option.id)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-5 py-4 text-left transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isSelected ? 'text-white' : 'text-primary',
                  )}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            )
          })}
        </div>

        {selectedOption && (
          <div className="mt-10 grid gap-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:grid-cols-2">
            {/* Problems */}
            <div className="bg-slate-50 p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                O que isso gera hoje
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-800">
                Desafios mais comuns nessa situação
              </h3>
              <ul className="mt-6 space-y-3" role="list">
                {selectedOption.problems.map((problem) => (
                  <li key={problem} className="flex items-start gap-3">
                    <span
                      className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100"
                      aria-hidden="true"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    </span>
                    <span className="text-sm leading-6 text-slate-600">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Como o DentalFlow ajuda
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-800">
                {selectedOption.solution}
              </h3>
              <ul className="mt-6 space-y-3" role="list">
                {selectedOption.solutionItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-6 text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <a href="/acessar?mode=register">
                    Começar teste grátis
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/perguntas-frequentes">
                    Tirar dúvidas
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {!selected && (
          <p className="mt-8 text-center text-sm text-slate-400">
            Selecione uma das opções acima para ver como o DentalFlow se encaixa na sua realidade.
          </p>
        )}
      </div>
    </section>
  )
}
