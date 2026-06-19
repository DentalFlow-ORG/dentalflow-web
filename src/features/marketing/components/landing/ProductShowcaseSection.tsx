import {
  Boxes,
  CalendarDays,
  ClipboardList,
  type LucideIcon,
  UsersRound,
  Wallet,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { cn } from '@/lib/utils'

import { Reveal } from './Reveal'

// ── Reusable faux app window ──────────────────────────────────────────────────
function MockWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/40">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </span>
        <span className="ml-2 truncate text-xs font-medium text-slate-400">{title}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

function Tile({
  label,
  value,
  hint,
  accent,
}: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium" style={{ color: accent }}>
        {hint}
      </p>
    </div>
  )
}

// ── Agenda odontológica ───────────────────────────────────────────────────────
const AGENDA_DAYS = [
  {
    day: 'Seg',
    slots: [
      { time: '09:00', name: 'Ana R.', proc: 'Profilaxia', tone: 'emerald' },
      { time: '10:30', name: 'João P.', proc: 'Canal', tone: 'cyan' },
    ],
  },
  {
    day: 'Ter',
    slots: [
      { time: '08:00', name: 'Marcos L.', proc: 'Avaliação', tone: 'amber' },
      { time: '14:00', name: 'Bruna S.', proc: 'Clareamento', tone: 'cyan' },
    ],
  },
  {
    day: 'Qua',
    slots: [{ time: '11:00', name: 'Carla M.', proc: 'Restauração', tone: 'emerald' }],
  },
] as const

const SLOT_TONES: Record<string, string> = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
}

function AgendaMock() {
  return (
    <MockWindow title="DentalFlow · Agenda">
      <div className="overflow-x-auto">
        <div className="grid min-w-[20rem] grid-cols-3 gap-3">
          {AGENDA_DAYS.map((column) => (
            <div key={column.day}>
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                {column.day}
              </p>
              <div className="space-y-2">
                {column.slots.map((slot) => (
                  <div
                    key={slot.time + slot.name}
                    className={cn('rounded-lg border p-2 text-left', SLOT_TONES[slot.tone])}
                  >
                    <p className="text-[11px] font-semibold opacity-70">{slot.time}</p>
                    <p className="text-xs font-semibold">{slot.name}</p>
                    <p className="text-[11px] opacity-80">{slot.proc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockWindow>
  )
}

// ── Prontuário do paciente ──────────────────────────────────────────────────
const ODONTOGRAM = [false, true, false, false, true, false, false, false]
const EVOLUTIONS = [
  { date: '12/06', note: 'Restauração em resina no dente 26 concluída.' },
  { date: '28/05', note: 'Profilaxia e orientação de higiene. Retorno em 6 meses.' },
]

function ProntuarioMock() {
  return (
    <MockWindow title="DentalFlow · Prontuário">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
          AR
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Ana Rodrigues</p>
          <p className="text-xs text-slate-500">34 anos · Plano Premium · Última visita 12/06</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Odontograma
        </p>
        <div className="mt-2 flex gap-1.5">
          {ODONTOGRAM.map((marked, i) => (
            <span
              key={`tooth-${i}`}
              className={cn(
                'h-6 w-5 rounded-md border',
                marked ? 'border-cyan-300 bg-cyan-100' : 'border-slate-200 bg-slate-50',
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {EVOLUTIONS.map((evo) => (
          <div key={evo.date} className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
            <p className="text-[11px] font-semibold text-cyan-700">{evo.date}</p>
            <p className="text-xs leading-5 text-slate-600">{evo.note}</p>
          </div>
        ))}
      </div>
    </MockWindow>
  )
}

// ── Financeiro da clínica ──────────────────────────────────────────────────
const CASHFLOW = [40, 62, 48, 75, 58, 84]

function FinanceiroMock() {
  return (
    <MockWindow title="DentalFlow · Financeiro">
      <div className="grid grid-cols-3 gap-2.5">
        <Tile label="Receita" value="R$ 48,2k" hint="+12% no mês" accent="#10b981" />
        <Tile label="Despesas" value="R$ 21,7k" hint="−4% no mês" accent="#64748b" />
        <Tile label="Lucro" value="R$ 26,5k" hint="margem 55%" accent="#0ea5e9" />
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Fluxo de caixa · últimos meses
        </p>
        <div className="mt-3 flex h-20 items-end gap-2">
          {CASHFLOW.map((h, i) => (
            <div
              key={`bar-${i}`}
              className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-400 to-cyan-400"
              style={{ height: `${h}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </MockWindow>
  )
}

// ── Estoque odontológico ───────────────────────────────────────────────────
const STOCK = [
  { name: 'Luvas de procedimento (P)', level: 78, status: 'ok' },
  { name: 'Anestésico (tubetes)', level: 24, status: 'low' },
  { name: 'Resina composta A2', level: 61, status: 'ok' },
  { name: 'Sugadores descartáveis', level: 12, status: 'low' },
] as const

function EstoqueMock() {
  return (
    <MockWindow title="DentalFlow · Estoque">
      <div className="space-y-3">
        {STOCK.map((item) => {
          const low = item.status === 'low'
          return (
            <div key={item.name}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{item.name}</span>
                {low ? (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                    Repor
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">{item.level}%</span>
                )}
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn('h-full rounded-full', low ? 'bg-amber-400' : 'bg-teal-400')}
                  style={{ width: `${item.level}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          )
        })}
      </div>
    </MockWindow>
  )
}

// ── Equipe & produtividade ─────────────────────────────────────────────────
const TEAM = [
  { name: 'Dra. Helena Costa', role: 'Dentista', occupancy: 88, tone: 'text-cyan-700 bg-cyan-50' },
  { name: 'Dr. Paulo Reis', role: 'Dentista', occupancy: 74, tone: 'text-cyan-700 bg-cyan-50' },
  { name: 'Júlia Nunes', role: 'Recepção', occupancy: 92, tone: 'text-indigo-700 bg-indigo-50' },
] as const

function EquipeMock() {
  return (
    <MockWindow title="DentalFlow · Equipe">
      <div className="space-y-2.5">
        {TEAM.map((member) => (
          <div
            key={member.name}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
              {member.name
                .split(' ')
                .slice(-2)
                .map((p) => p[0])
                .join('')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-800">{member.name}</p>
                <span
                  className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', member.tone)}
                >
                  {member.role}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-400"
                  style={{ width: `${member.occupancy}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums text-slate-700">
              {member.occupancy}%
            </span>
          </div>
        ))}
      </div>
    </MockWindow>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────
type ShowcaseTab = {
  key: string
  label: string
  icon: LucideIcon
  accent: string
  caption: string
  render: () => ReactNode
}

const TABS: ShowcaseTab[] = [
  {
    key: 'agenda',
    label: 'Agenda odontológica',
    icon: CalendarDays,
    accent: '#0ea5e9',
    caption: 'Consultas, encaixes e status de cada cadeira em uma visão única da semana.',
    render: () => <AgendaMock />,
  },
  {
    key: 'prontuario',
    label: 'Prontuário do paciente',
    icon: ClipboardList,
    accent: '#06b6d4',
    caption: 'Histórico clínico, odontograma e evoluções organizados por paciente.',
    render: () => <ProntuarioMock />,
  },
  {
    key: 'financeiro',
    label: 'Financeiro da clínica',
    icon: Wallet,
    accent: '#10b981',
    caption: 'Receitas, despesas e fluxo de caixa da clínica em tempo real.',
    render: () => <FinanceiroMock />,
  },
  {
    key: 'estoque',
    label: 'Estoque odontológico',
    icon: Boxes,
    accent: '#14b8a6',
    caption: 'Materiais de atendimento e instrumentais controlados, com alerta de reposição.',
    render: () => <EstoqueMock />,
  },
  {
    key: 'equipe',
    label: 'Equipe & produtividade',
    icon: UsersRound,
    accent: '#6366f1',
    caption: 'Dentistas, recepção e gestão na mesma visão, com ocupação por profissional.',
    render: () => <EquipeMock />,
  },
]

export function ProductShowcaseSection() {
  const [active, setActive] = useState(0)
  const current = TABS[active]
  const CurrentIcon = current.icon

  return (
    <section className="bg-slate-50 py-20 lg:py-28" aria-labelledby="showcase-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Na prática
          </p>
          <h2
            id="showcase-heading"
            className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl"
          >
            Como o DentalFlow funciona no dia a dia
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Da agenda ao prontuário, do financeiro ao estoque — a interface foi desenhada para a
            rotina real de uma clínica odontológica.
          </p>
        </Reveal>

        {/* Tab selector */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          role="group"
          aria-label="Áreas do produto DentalFlow"
        >
          {TABS.map((tab, index) => {
            const Icon = tab.icon
            const isActive = index === active
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(index)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isActive
                    ? 'border-slate-300 bg-white text-slate-900 shadow-sm'
                    : 'border-slate-200 bg-white/60 text-slate-500 hover:bg-white hover:text-slate-700',
                )}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: isActive ? tab.accent : undefined }}
                  aria-hidden="true"
                />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Active mockup + caption */}
        <div className="mx-auto mt-8 grid max-w-4xl gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>{current.render()}</div>
          <div className="text-center lg:text-left">
            <div
              className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl lg:mx-0"
              style={{ backgroundColor: `${current.accent}1f`, color: current.accent }}
            >
              <CurrentIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">{current.label}</h3>
            <p className="mt-2 text-base leading-7 text-slate-600">{current.caption}</p>
            <p className="mt-4 text-xs text-slate-400">
              Prévia ilustrativa da interface · dados de exemplo
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
