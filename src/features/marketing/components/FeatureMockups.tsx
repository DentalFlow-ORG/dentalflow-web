import type { ReactElement, ReactNode } from 'react'

import {
  Bot,
  CalendarDays,
  CheckCircle2,
  FileText,
  MessageCircle,
  Users,
  Zap,
} from 'lucide-react'

import { cn } from '@/lib/utils'

// ── Shared primitives ──────────────────────────────────────────────────────────

function MockupShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative select-none">
      <div
        className="pointer-events-none absolute -inset-8 rounded-3xl bg-emerald-500/[0.10] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -inset-8 rounded-3xl bg-blue-600/[0.06] blur-2xl"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/95 shadow-2xl">
        {children}
      </div>
    </div>
  )
}

function MockupHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-slate-950/70 px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-rose-400/60" />
      <div className="h-2 w-2 rounded-full bg-amber-400/60" />
      <div className="h-2 w-2 rounded-full bg-emerald-400/60" />
      <span className="ml-3 text-[10px] font-medium text-slate-500">DentalFlow · {title}</span>
    </div>
  )
}

type ChipVariant = 'emerald' | 'amber' | 'red' | 'slate' | 'blue'

function MockupChip({ label, variant = 'slate' }: { label: string; variant?: ChipVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
        variant === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
        variant === 'amber' && 'bg-amber-500/20 text-amber-400',
        variant === 'red' && 'bg-red-500/20 text-red-400',
        variant === 'slate' && 'bg-slate-700 text-slate-400',
        variant === 'blue' && 'bg-blue-500/20 text-blue-400',
      )}
    >
      {label}
    </span>
  )
}

function MockupMetric({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-slate-800/60 p-3">
      <p className="text-[10px] leading-tight text-slate-500">{label}</p>
      <p className={cn('mt-1 text-sm font-bold', accent ? 'text-emerald-400' : 'text-white')}>
        {value}
      </p>
    </div>
  )
}

function MockupRow({
  dot,
  label,
  detail,
  chip,
}: {
  dot?: ChipVariant
  label: string
  detail?: string
  chip?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-slate-800/40 px-3 py-1.5">
      {dot && (
        <div
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            dot === 'emerald' && 'bg-emerald-400',
            dot === 'amber' && 'bg-amber-400',
            dot === 'red' && 'bg-red-400',
            dot === 'blue' && 'bg-blue-400',
            dot === 'slate' && 'bg-slate-500',
          )}
        />
      )}
      <span className="flex-1 text-[11px] text-slate-300">{label}</span>
      {detail && <span className="text-[9px] text-slate-500">{detail}</span>}
      {chip}
    </div>
  )
}

// ── Variant: Agenda ────────────────────────────────────────────────────────────

function AgendaMockup() {
  const slots = [
    { time: '09:00', patient: 'Ana Rodrigues', proc: 'Limpeza', confirmed: true },
    { time: '10:30', patient: 'Marcos Pereira', proc: 'Extração', confirmed: false },
    { time: '11:30', patient: 'Juliana Castro', proc: 'Clareamento', confirmed: true },
  ]
  return (
    <MockupShell>
      <MockupHeader title="Agenda · Hoje" />
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400">Seg, 23 mai</span>
          <MockupChip label="3 consultas" variant="blue" />
        </div>
        <div className="space-y-1.5">
          {slots.map((s) => (
            <div
              key={s.time}
              className="flex items-start gap-2 rounded-xl border border-white/[0.05] bg-slate-800/50 p-2.5"
            >
              <span className="mt-0.5 w-9 shrink-0 text-[9px] font-bold text-slate-500">{s.time}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-200">{s.patient}</p>
                <p className="text-[9px] text-slate-500">{s.proc} · Dr. Carlos Lima</p>
              </div>
              <MockupChip label={s.confirmed ? 'Confirmado' : 'Aguardando'} variant={s.confirmed ? 'emerald' : 'amber'} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <CalendarDays className="h-3 w-3 text-emerald-500" aria-hidden="true" />
          <span className="text-[10px] text-slate-500">Sincronizado com Google Calendar</span>
        </div>
      </div>
    </MockupShell>
  )
}

// ── Variant: Prontuários ───────────────────────────────────────────────────────

function ProntuariosMockup() {
  const entries = [
    { date: '10 mai', dentist: 'Dr. Carlos Lima', note: 'Limpeza e polimento. Sem alterações.' },
    { date: '14 mar', dentist: 'Dra. Paula Souza', note: 'Restauração dente 36. Anestesia local.' },
  ]
  return (
    <MockupShell>
      <MockupHeader title="Prontuário" />
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-slate-800/60 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
            AR
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-200">Ana Rodrigues</p>
            <p className="text-[9px] text-slate-500">32 anos · Última consulta: 10 mai 2026</p>
          </div>
          <MockupChip label="Ativo" variant="emerald" />
        </div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Evoluções clínicas</p>
        <div className="space-y-1.5">
          {entries.map((e) => (
            <div key={e.date} className="rounded-lg border border-white/[0.05] bg-slate-800/50 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-emerald-400">{e.date}</span>
                <span className="text-[9px] text-slate-500">{e.dentist}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-400">{e.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
          <CalendarDays className="h-3 w-3 text-emerald-400" aria-hidden="true" />
          <span className="text-[10px] text-emerald-300">Próxima consulta: 15 jun 2026 · 14:00</span>
        </div>
      </div>
    </MockupShell>
  )
}

// ── Variant: Financeiro ────────────────────────────────────────────────────────

function FinanceiroMockup() {
  const transactions = [
    { label: 'Consulta · Ana Rodrigues', value: 'R$ 280', paid: true },
    { label: 'Consulta · Pedro Martins', value: 'R$ 150', paid: false },
    { label: 'Consulta · Carla Santos', value: 'R$ 320', paid: true },
  ]
  const barHeights = [40, 55, 70, 60, 85, 75, 90]
  return (
    <MockupShell>
      <MockupHeader title="Financeiro · Este mês" />
      <div className="p-4">
        <div className="mb-3 grid grid-cols-3 gap-2">
          <MockupMetric label="Receita" value="R$ 14.2k" accent />
          <MockupMetric label="Despesas" value="R$ 4.8k" />
          <MockupMetric label="Saldo" value="R$ 9.4k" accent />
        </div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Últimas entradas</p>
        <div className="space-y-1.5">
          {transactions.map((tx) => (
            <MockupRow
              key={tx.label}
              dot={tx.paid ? 'emerald' : 'amber'}
              label={tx.label}
              detail={tx.value}
              chip={<MockupChip label={tx.paid ? 'Pago' : 'Pendente'} variant={tx.paid ? 'emerald' : 'amber'} />}
            />
          ))}
        </div>
        <div className="mt-3 flex items-end gap-1">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h * 0.28}px`,
                background:
                  i === barHeights.length - 1
                    ? 'rgb(52 211 153 / 0.7)'
                    : 'rgb(100 116 139 / 0.3)',
              }}
            />
          ))}
        </div>
      </div>
    </MockupShell>
  )
}

// ── Variant: Pacientes ─────────────────────────────────────────────────────────

function PacientesMockup() {
  const patients = [
    { name: 'Ana Rodrigues', initials: 'AR', last: '10 mai 2026', active: true },
    { name: 'Marcos Pereira', initials: 'MP', last: '02 abr 2026', active: true },
    { name: 'Beatriz Lima', initials: 'BL', last: '15 jan 2026', active: false },
  ]
  return (
    <MockupShell>
      <MockupHeader title="Pacientes" />
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-2">
          <Users className="h-3 w-3 text-slate-500" aria-hidden="true" />
          <span className="flex-1 text-[10px] text-slate-500">Buscar paciente…</span>
          <MockupChip label="284 pacientes" variant="blue" />
        </div>
        <div className="space-y-1.5">
          {patients.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-slate-800/50 px-3 py-2"
            >
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                  p.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400',
                )}
              >
                {p.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-200">{p.name}</p>
                <p className="text-[9px] text-slate-500">Última consulta: {p.last}</p>
              </div>
              <MockupChip label={p.active ? 'Ativo' : 'Inativo'} variant={p.active ? 'emerald' : 'slate'} />
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  )
}

// ── Variant: Relatórios ────────────────────────────────────────────────────────

function RelatoriosMockup() {
  const bars = [
    { label: 'Semana 1', pct: 68 },
    { label: 'Semana 2', pct: 82 },
    { label: 'Semana 3', pct: 74 },
  ]
  return (
    <MockupShell>
      <MockupHeader title="Relatórios · Maio 2026" />
      <div className="p-4">
        <div className="mb-3 flex gap-1.5">
          <MockupChip label="Este mês" variant="emerald" />
          <MockupChip label="Anterior" variant="slate" />
          <MockupChip label="Trimestre" variant="slate" />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <MockupMetric label="Consultas" value="47" accent />
          <MockupMetric label="Receita" value="R$ 14.2k" accent />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-slate-800/50 p-3">
          <p className="mb-2.5 text-[9px] font-medium text-slate-500">Consultas realizadas por semana</p>
          <div className="space-y-2">
            {bars.map(({ label, pct }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[9px] text-slate-500">{label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full rounded-full bg-emerald-500/70" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-7 text-right text-[9px] text-slate-400">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockupShell>
  )
}

// ── Variant: IA de gestão ──────────────────────────────────────────────────────

function IaMockup() {
  return (
    <MockupShell>
      <MockupHeader title="IA de gestão" />
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5">
          <Bot className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-semibold text-emerald-300">Análise gerada · Maio 2026</p>
            <p className="text-[9px] text-slate-400">Com base nos dados registrados no sistema</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="rounded-lg border border-white/[0.05] bg-slate-800/50 p-2.5">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <p className="text-[10px] leading-5 text-slate-300">
                Receita cresceu{' '}
                <span className="font-bold text-emerald-400">+18%</span> em relação ao mês anterior.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.07] p-2.5">
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" aria-hidden="true" />
              <p className="text-[10px] leading-5 text-amber-300">
                Estoque de <span className="font-bold">Luvas nitrílicas</span> abaixo do mínimo definido.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-white/[0.05] bg-slate-800/50 p-2.5">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              <p className="text-[10px] leading-5 text-slate-300">
                Taxa de ocupação da agenda:{' '}
                <span className="font-bold text-white">74%</span> — dentro da meta.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
          <span className="text-[9px] text-slate-400">Sugestão: revisar reposição de estoque</span>
          <MockupChip label="Ver detalhes" variant="blue" />
        </div>
      </div>
    </MockupShell>
  )
}

// ── Variant: Estoque ───────────────────────────────────────────────────────────

function EstoqueMockup() {
  const items = [
    { name: 'Luvas nitrílicas P', qty: '4 cx', alert: true },
    { name: 'Resina composta A2', qty: '12 un', alert: false },
    { name: 'Anestésico Mepivacaína', qty: '2 cx', alert: true },
    { name: 'Gaze estéril', qty: '30 un', alert: false },
  ]
  return (
    <MockupShell>
      <MockupHeader title="Estoque" />
      <div className="p-4">
        <div className="mb-3 grid grid-cols-3 gap-2">
          <MockupMetric label="Produtos" value="24" />
          <MockupMetric label="Em alerta" value="3" />
          <MockupMetric label="Movimentos" value="11" />
        </div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Itens do estoque</p>
        <div className="space-y-1.5">
          {items.map((item) => (
            <MockupRow
              key={item.name}
              dot={item.alert ? 'red' : 'emerald'}
              label={item.name}
              detail={item.qty}
              chip={item.alert ? <MockupChip label="Baixo" variant="red" /> : undefined}
            />
          ))}
        </div>
      </div>
    </MockupShell>
  )
}

// ── Variant: Controle fiscal ───────────────────────────────────────────────────

function FiscalMockup() {
  const invoices = [
    { patient: 'Ana Rodrigues', service: 'Limpeza dental', value: 'R$ 280', emitted: true },
    { patient: 'Pedro Martins', service: 'Extração simples', value: 'R$ 350', emitted: false },
    { patient: 'Carla Santos', service: 'Clareamento', value: 'R$ 480', emitted: true },
  ]
  return (
    <MockupShell>
      <MockupHeader title="Controle fiscal" />
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-800/60 p-3">
          <div>
            <p className="text-[9px] text-slate-500">Total · Maio 2026</p>
            <p className="mt-0.5 text-sm font-bold text-white">R$ 8.340,00</p>
          </div>
          <MockupChip label="12 registros" variant="blue" />
        </div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Registros fiscais</p>
        <div className="space-y-1.5">
          {invoices.map((inv) => (
            <div
              key={inv.patient}
              className="flex items-center gap-2 rounded-lg bg-slate-800/40 px-2.5 py-2"
            >
              <FileText className="h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-slate-200">{inv.patient}</p>
                <p className="text-[9px] text-slate-500">
                  {inv.service} · {inv.value}
                </p>
              </div>
              <MockupChip label={inv.emitted ? 'Emitido' : 'Rascunho'} variant={inv.emitted ? 'emerald' : 'amber'} />
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  )
}

// ── Variant: WhatsApp / Notificações ──────────────────────────────────────────

function WhatsappMockup() {
  return (
    <MockupShell>
      <MockupHeader title="WhatsApp · Notificações" />
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-emerald-300">Automações ativas</span>
          </div>
          <MockupChip label="3 tipos" variant="emerald" />
        </div>
        <div className="space-y-2">
          {/* Outgoing */}
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-600/30 px-3 py-2">
              <p className="text-[10px] leading-5 text-emerald-100">
                Olá Ana! Lembrete: consulta amanhã às 09:00 com Dr. Carlos Lima. Confirme sua presença.
              </p>
              <p className="mt-0.5 text-right text-[8px] text-emerald-400/70">09:00 · ✓✓</p>
            </div>
          </div>
          {/* Incoming */}
          <div className="flex justify-start">
            <div className="max-w-[60%] rounded-2xl rounded-tl-sm bg-slate-700/60 px-3 py-2">
              <p className="text-[10px] leading-5 text-slate-200">Confirmado! Estarei lá 😊</p>
              <p className="mt-0.5 text-[8px] text-slate-500">09:03</p>
            </div>
          </div>
          {/* Outgoing */}
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-emerald-600/30 px-3 py-2">
              <p className="text-[10px] leading-5 text-emerald-100">
                Obrigado, Ana! Sua consulta está confirmada.
              </p>
              <p className="mt-0.5 text-right text-[8px] text-emerald-400/70">09:03 · ✓✓</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />
          <span className="text-[10px] text-slate-500">Consulta confirmada automaticamente</span>
        </div>
      </div>
    </MockupShell>
  )
}

// ── Fallback (unknown featureId) ───────────────────────────────────────────────

function FallbackMockup() {
  const bars = [
    { label: 'Agenda', pct: 82 },
    { label: 'Financeiro', pct: 64 },
    { label: 'Pacientes', pct: 74 },
  ]
  return (
    <MockupShell>
      <MockupHeader title="Painel" />
      <div className="p-5">
        <div className="grid grid-cols-3 gap-2.5">
          <MockupMetric label="Pacientes" value="284" />
          <MockupMetric label="Este mês" value="R$ 12k" accent />
          <MockupMetric label="Consultas" value="47" />
        </div>
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-slate-800/50 p-3.5">
          <p className="mb-3 text-[10px] font-medium text-slate-500">Atividade dos módulos</p>
          <div className="space-y-2.5">
            {bars.map(({ label, pct }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[9px] text-slate-500">{label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full rounded-full bg-emerald-500/70" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-7 text-right text-[9px] text-slate-400">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          {['Ana Rodrigues', 'Pedro Martins', 'Carla Santos'].map((name, i) => (
            <MockupRow key={name} dot={i === 1 ? 'amber' : 'emerald'} label={name} detail="Consulta 14:00" />
          ))}
        </div>
      </div>
    </MockupShell>
  )
}

// ── Public dispatcher ──────────────────────────────────────────────────────────

const MOCKUP_MAP: Record<string, () => ReactElement> = {
  agenda: AgendaMockup,
  prontuarios: ProntuariosMockup,
  financeiro: FinanceiroMockup,
  pacientes: PacientesMockup,
  relatorios: RelatoriosMockup,
  ia: IaMockup,
  estoque: EstoqueMockup,
  'controle-fiscal': FiscalMockup,
  whatsapp: WhatsappMockup,
}

export function FeatureMockup({ featureId }: { featureId: string }) {
  const Mockup = MOCKUP_MAP[featureId] ?? FallbackMockup
  return <Mockup />
}
