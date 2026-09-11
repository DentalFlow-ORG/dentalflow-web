import { Bot, CheckCircle2, Search, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

type RoleHeroMockupProps = {
  type: 'dashboard' | 'checklist' | 'agenda' | 'schedule'
}

export function RoleHeroMockup({ type }: RoleHeroMockupProps) {
  switch (type) {
    case 'dashboard':
      return <DashboardMockup />
    case 'checklist':
      return <ChecklistMockup />
    case 'agenda':
      return <AgendaMockup />
    case 'schedule':
      return <ScheduleMockup />
  }
}
// ── Dashboard mockup (/para-gestores) ──────────────────────────────────────────
// All data here is illustrative — shown to convey product capability, not real metrics.

type ChartBar = { label: string; heightPx: number; current?: true }
type StatusItem = { label: string; ok: boolean }

const CHART_BARS: ChartBar[] = [
  { label: 'S1', heightPx: 26 },
  { label: 'S2', heightPx: 40 },
  { label: 'S3', heightPx: 32 },
  { label: 'S4', heightPx: 50 },
  { label: 'Atual', heightPx: 58, current: true },
]

const STATUS_ITEMS: StatusItem[] = [
  { label: 'Agenda', ok: true },
  { label: 'Financeiro', ok: true },
  { label: 'Equipe', ok: true },
  { label: 'Estoque', ok: false },
]

function DashboardMockup() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/40 ring-1 ring-white/[0.04]"
      aria-hidden="true"
    >
      {/* ── Window header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-700/80 bg-slate-800 px-5 py-3.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            DentalFlow
          </p>
          <p className="mt-0.5 text-sm font-semibold text-white">Painel da clínica</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-600/80 bg-slate-700/60 px-2.5 py-1">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-medium text-slate-400">Ao vivo</span>
        </div>
      </div>

      {/* ── KPI row ───────────────────────────────────────────── */}
      <div
        className="grid grid-cols-3 divide-x divide-slate-700/50 border-b border-slate-700/50 bg-slate-800/40"
        role="group"
        aria-label="Indicadores do mês"
      >
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-bold tabular-nums text-white">R$&nbsp;18.4k</p>
          <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400">Receita/mês</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-bold tabular-nums text-emerald-400">78%</p>
          <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400">Ocupação</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-bold tabular-nums text-blue-400">12</p>
          <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400">Novos pac.</p>
        </div>
      </div>

      {/* ── Chart area ────────────────────────────────────────── */}
      <div className="px-5 pb-3 pt-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Receita · últimas 5 semanas
        </p>

        {/* Bars — bottom-aligned flex, heights via inline style */}
        <div className="flex items-end gap-1.5">
          {CHART_BARS.map((bar) => (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn('w-full rounded-t-sm', bar.current ? 'bg-primary' : 'bg-slate-700')}
                style={{ height: `${bar.heightPx}px` }}
              />
              <span className="text-[9px] font-medium text-slate-600">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI insight card ───────────────────────────────────── */}
      <div className="mx-4 mb-3.5 flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15">
          <Bot className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-emerald-400">Sugestão da IA</p>
          <p className="mt-0.5 text-[11px] leading-[1.4] text-slate-400">
            Reativar 8 pacientes sem retorno há mais de 60 dias.
          </p>
        </div>
      </div>

      {/* ── Status footer ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 border-t border-slate-700/50 bg-slate-800/50 px-5 py-3">
        {STATUS_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-800 px-2.5 py-1"
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                item.ok ? 'bg-emerald-400' : 'bg-amber-400',
              )}
            />
            <span className="text-[10px] font-medium text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Checklist mockup (/para-clinicas-em-abertura) ──────────────────────────────
// All data here is illustrative — shown to convey product capability, not real metrics.

type SetupStep = { label: string; done: boolean }
type WeekStep = { week: string; label: string; done: boolean; current?: true }
type ClinicChip = { label: string; ok: boolean }

const SETUP_STEPS: SetupStep[] = [
  { label: 'Configurar equipe', done: true },
  { label: 'Criar serviços', done: true },
  { label: 'Ativar agenda', done: true },
  { label: 'Preparar financeiro', done: false },
  { label: 'Publicar captação', done: false },
]

const WEEK_STEPS: WeekStep[] = [
  { week: 'Sem 1', label: 'Estrutura', done: true },
  { week: 'Sem 2', label: 'Agenda', done: true },
  { week: 'Sem 3', label: 'Pacientes', done: false, current: true },
  { week: 'Sem 4', label: 'Crescimento', done: false },
]

const CLINIC_CHIPS: ClinicChip[] = [
  { label: 'Agenda', ok: true },
  { label: 'Equipe', ok: true },
  { label: 'Serviços', ok: true },
  { label: 'Financeiro', ok: false },
]

function ChecklistMockup() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-white shadow-2xl shadow-emerald-950/10 ring-1 ring-emerald-500/[0.06]"
      aria-hidden="true"
    >
      {/* ── Window header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/60 px-5 py-3.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/60">
            DentalFlow
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">Plano de abertura</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2.5 py-1 shadow-sm">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium text-slate-500">Dia 1 → Mês 1</span>
        </div>
      </div>

      {/* ── Setup checklist ───────────────────────────────────── */}
      <div className="px-5 pt-4">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Setup em andamento
        </p>
        <div className="space-y-1.5">
          {SETUP_STEPS.map((step) => (
            <div
              key={step.label}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2',
                step.done ? 'bg-emerald-50' : 'bg-slate-50',
              )}
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-3 w-3 rounded-full border-2 border-slate-300" />
                </span>
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  step.done ? 'text-emerald-700' : 'text-slate-500',
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Week progress ─────────────────────────────────────── */}
      <div className="px-5 pb-3 pt-3.5">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Progresso semanal
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {WEEK_STEPS.map((step) => (
            <div
              key={step.week}
              className={cn(
                'flex flex-col items-center rounded-lg border py-2',
                step.done
                  ? 'border-emerald-200 bg-emerald-50'
                  : step.current
                    ? 'border-emerald-400/50 bg-emerald-100/60 ring-1 ring-emerald-400/30'
                    : 'border-slate-100 bg-slate-50',
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-bold',
                  step.done || step.current ? 'text-emerald-700' : 'text-slate-400',
                )}
              >
                {step.week}
              </span>
              <span
                className={cn(
                  'mt-0.5 text-[9px] font-medium',
                  step.done || step.current ? 'text-emerald-600' : 'text-slate-400',
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  'mt-1.5 h-1.5 w-1.5 rounded-full',
                  step.done
                    ? 'bg-emerald-400'
                    : step.current
                      ? 'animate-pulse bg-emerald-400'
                      : 'bg-slate-200',
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Insight card ──────────────────────────────────────── */}
      <div className="mx-4 mb-3.5 flex items-start gap-2.5 rounded-lg border border-emerald-400/25 bg-emerald-50 px-3 py-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-emerald-700">Dica de abertura</p>
          <p className="mt-0.5 text-[11px] leading-[1.4] text-slate-500">
            Comece com processos prontos desde o primeiro atendimento.
          </p>
        </div>
      </div>

      {/* ── Status footer ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 border-t border-emerald-100 bg-emerald-50/40 px-5 py-3">
        {CLINIC_CHIPS.map((chip) => (
          <div
            key={chip.label}
            className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1"
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                chip.ok ? 'bg-emerald-400' : 'bg-amber-400',
              )}
            />
            <span className="text-[10px] font-medium text-slate-600">{chip.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Agenda + prontuário mockup (/para-dentistas) ───────────────────────────────
// All data here is illustrative — shown to convey product capability, not real metrics.

type Appointment = {
  time: string
  procedure: string
  status: 'confirmed' | 'active' | 'next'
  current?: true
}

const APPOINTMENTS: Appointment[] = [
  { time: '08:30', procedure: 'Consulta inicial', status: 'confirmed' },
  { time: '10:00', procedure: 'Restauração', status: 'active', current: true },
  { time: '11:30', procedure: 'Retorno', status: 'next' },
]

const UPPER_TEETH = [false, false, true, false, false, false, false, false]
const LOWER_TEETH = [false, false, false, true, false, false, false, false]

const DENTIST_CHIPS = ['Prontuário', 'Odontograma', 'Agenda', 'Retornos']

function AgendaMockup() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-blue-200/60 bg-white shadow-2xl shadow-blue-950/10 ring-1 ring-blue-500/[0.05]"
      aria-hidden="true"
    >
      {/* ── Window header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            DentalFlow
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">Agenda do profissional</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-2.5 py-1 shadow-sm">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          </span>
          <span className="text-[11px] font-medium text-slate-500">Ao vivo</span>
        </div>
      </div>

      {/* ── Appointment timeline ──────────────────────────────── */}
      <div className="px-5 pt-4">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Agenda de hoje
        </p>
        <div className="space-y-1.5">
          {APPOINTMENTS.map((appt) => (
            <div
              key={appt.time}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2',
                appt.current ? 'bg-blue-50 ring-1 ring-blue-200/80' : 'bg-slate-50',
              )}
            >
              <span
                className={cn(
                  'min-w-[38px] text-xs font-bold tabular-nums',
                  appt.current ? 'text-blue-600' : 'text-slate-400',
                )}
              >
                {appt.time}
              </span>
              <span
                className={cn(
                  'flex-1 truncate text-xs font-medium',
                  appt.current ? 'text-slate-800' : 'text-slate-600',
                )}
              >
                {appt.procedure}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  appt.status === 'active'
                    ? 'bg-blue-100 text-blue-700'
                    : appt.status === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500',
                )}
              >
                {appt.status === 'active'
                  ? 'Em atendimento'
                  : appt.status === 'confirmed'
                    ? 'Confirmado'
                    : 'Próximo'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Patient + prontuário card ─────────────────────────── */}
      <div className="px-5 pt-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">
              AP
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800">Ana Paula Ferreira</p>
              <p className="text-[10px] text-slate-500">Restauração · Dente 16</p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-blue-500">Prontuário</span>
          </div>
          <div className="mt-2.5 rounded-lg border border-blue-100/80 bg-white px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Evolução
            </p>
            <p className="mt-0.5 text-[11px] leading-[1.4] text-slate-500">
              Dente 16. Cárie classe II. Anestesia aplicada, matriz instalada.
            </p>
          </div>
        </div>
      </div>

      {/* ── Simplified odontogram ─────────────────────────────── */}
      <div className="px-5 pb-2 pt-3.5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Odontograma
        </p>
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-0.5">
            {UPPER_TEETH.map((treated, i) => (
              <div
                key={`u${i}`}
                className={cn(
                  'h-4 w-4 rounded-sm border',
                  treated ? 'border-blue-400 bg-blue-200' : 'border-slate-200 bg-slate-50',
                )}
              />
            ))}
          </div>
          <div className="flex gap-0.5">
            {LOWER_TEETH.map((treated, i) => (
              <div
                key={`l${i}`}
                className={cn(
                  'h-4 w-4 rounded-sm border',
                  treated ? 'border-indigo-400 bg-indigo-100' : 'border-slate-200 bg-slate-50',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Insight strip ─────────────────────────────────────── */}
      <div className="mx-4 mb-3.5 mt-3 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-2">
        <p className="text-[11px] leading-[1.4] text-slate-500">
          Histórico, evolução e agenda conectados em um só lugar.
        </p>
      </div>

      {/* ── Status footer ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        {DENTIST_CHIPS.map((label) => (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px] font-medium text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Scheduling board mockup (/para-secretarias) ────────────────────────────────
// All data here is illustrative — shown to convey product capability, not real metrics.

type SecretaryAppt = {
  time: string
  patient: string
  procedure: string
  status: 'confirmed' | 'pending' | 'in-progress'
}

const SECRETARY_APPTS: SecretaryAppt[] = [
  { time: '08:30', patient: 'Ana Martins', procedure: 'Limpeza', status: 'confirmed' },
  { time: '10:00', patient: 'Carlos Lima', procedure: 'Avaliação', status: 'pending' },
  { time: '11:30', patient: 'Mariana Souza', procedure: 'Retorno', status: 'in-progress' },
]

const DAILY_STATS = [
  { value: '12', label: 'Confirmados' },
  { value: '3', label: 'A confirmar' },
  { value: '2', label: 'Encaixes' },
]

function ScheduleMockup() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-sky-200/60 bg-white shadow-2xl shadow-sky-950/10 ring-1 ring-sky-500/[0.05]"
      aria-hidden="true"
    >
      {/* ── Window header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            DentalFlow
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">Central de agendamentos</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-2.5 py-1 shadow-sm">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
          </span>
          <span className="text-[11px] font-medium text-slate-500">Ao vivo</span>
        </div>
      </div>

      {/* ── Daily summary ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/40">
        {DAILY_STATS.map((stat) => (
          <div key={stat.label} className="px-3 py-2.5 text-center">
            <p className="text-base font-bold tabular-nums text-slate-800">{stat.value}</p>
            <p className="mt-0.5 text-[9px] font-medium text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Appointment rows ──────────────────────────────────── */}
      <div className="px-5 pt-3.5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Agenda de hoje
        </p>
        <div className="space-y-1.5">
          {SECRETARY_APPTS.map((appt) => (
            <div
              key={appt.time}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2',
                appt.status === 'pending' ? 'bg-amber-50 ring-1 ring-amber-200/70' : 'bg-slate-50',
              )}
            >
              <span
                className={cn(
                  'min-w-[38px] text-xs font-bold tabular-nums',
                  appt.status === 'in-progress'
                    ? 'text-blue-600'
                    : appt.status === 'pending'
                      ? 'text-amber-600'
                      : 'text-slate-400',
                )}
              >
                {appt.time}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">{appt.patient}</p>
                <p className="text-[10px] text-slate-400">{appt.procedure}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  appt.status === 'confirmed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : appt.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700',
                )}
              >
                {appt.status === 'confirmed'
                  ? 'Confirmado'
                  : appt.status === 'pending'
                    ? 'A confirmar'
                    : 'Atendimento'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Patient search ────────────────────────────────────── */}
      <div className="px-5 pt-3">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            <span className="text-xs text-slate-400">Buscar paciente...</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[9px] font-bold text-sky-600">
              JS
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-700">João Silva</p>
              <p className="text-[10px] text-slate-400">Última consulta · 15/04</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <div className="px-5 pt-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Ações rápidas
        </p>
        <div className="flex flex-wrap gap-1.5">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700">
            Enviar lembrete
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600">
            Reagendar
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[10px] font-semibold text-sky-700">
            Confirmar
          </div>
        </div>
      </div>

      {/* ── Insight strip ─────────────────────────────────────── */}
      <div className="mx-4 mb-3.5 mt-3 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-2">
        <p className="text-[11px] leading-[1.4] text-slate-500">
          Agenda, pacientes e confirmações em uma rotina mais simples.
        </p>
      </div>

      {/* ── Status footer ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-medium text-slate-600">Confirmado</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-medium text-slate-600">A confirmar</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="text-[10px] font-medium text-slate-600">Reagendado</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span className="text-[10px] font-medium text-slate-600">Em atendimento</span>
        </div>
      </div>
    </div>
  )
}
