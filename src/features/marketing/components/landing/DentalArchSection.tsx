import { useState } from 'react'

import { cn } from '@/lib/utils'

import { DENTAL_WORKFLOWS } from '../../data/dental-arch'
import { AuroraBackdrop } from './AuroraBackdrop'
import { DentalArch } from './DentalArch'
import { Reveal } from './Reveal'

const DEFAULT_INDEX = Math.max(
  0,
  DENTAL_WORKFLOWS.findIndex((workflow) => workflow.key === 'agenda'),
)

export function DentalArchSection() {
  const [selected, setSelected] = useState(DEFAULT_INDEX)
  const active = DENTAL_WORKFLOWS[selected]
  const ActiveIcon = active.icon

  return (
    <section
      className="relative isolate overflow-hidden bg-slate-950 py-20 text-white lg:py-28"
      aria-labelledby="dental-arch-heading"
    >
      <AuroraBackdrop />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Pensado para a odontologia
          </p>
          <h2
            id="dental-arch-heading"
            className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl"
          >
            Toda a sua clínica em uma só{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              arcada digital
            </span>
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Cada dente é um módulo do DentalFlow. Toque ou selecione para ver como agenda,
            prontuário, financeiro e equipe se conectam na rotina real da clínica.
          </p>
        </Reveal>

        {/* Interactive arch (WebGL on desktop, static SVG on mobile/reduced-motion) */}
        <Reveal className="mt-10 lg:mt-12" delay={0.05}>
          <DentalArch selectedIndex={selected} onSelect={setSelected} />
        </Reveal>

        {/* Detail panel for the selected workflow */}
        <Reveal className="mx-auto mt-8 max-w-2xl" delay={0.08}>
          <div
            className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6"
            aria-live="polite"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${active.accent}1f`, color: active.accent }}
            >
              <ActiveIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{active.label}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">{active.description}</p>
            </div>
          </div>
        </Reveal>

        {/* Accessible selector — the keyboard/screen-reader control for the arch */}
        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
          role="group"
          aria-label="Módulos da arcada DentalFlow"
        >
          {DENTAL_WORKFLOWS.map((workflow, index) => {
            const Icon = workflow.icon
            const isSelected = index === selected
            return (
              <button
                key={workflow.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(index)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50',
                  isSelected
                    ? 'border-white/20 bg-white/[0.1] text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white',
                )}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: isSelected ? workflow.accent : undefined }}
                  aria-hidden="true"
                />
                {workflow.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
