import { Bot } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type RoleHeroMockupProps = {
  type: 'dashboard' | 'checklist' | 'agenda' | 'schedule'
  accent: 'standard' | 'navy' | 'fresh'
  role: string
  icon: LucideIcon
  modules: string[]
  moduleIcons: LucideIcon[]
}

export function RoleHeroMockup({
  type,
  accent,
  role,
  icon: RoleIcon,
  modules,
  moduleIcons,
}: RoleHeroMockupProps) {
  // Block 2: real dashboard mockup for /para-gestores
  if (type === 'dashboard') {
    return <DashboardMockup />
  }

  // Blocks 3–5 pending: generic module-preview stub for remaining roles
  const isNavy = accent === 'navy'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border shadow-2xl shadow-slate-950/10',
        isNavy ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white',
      )}
      aria-hidden="true"
    >
      {/* Card header */}
      <div
        className={cn(
          'flex items-center justify-between border-b px-5 py-3.5',
          isNavy ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50',
        )}
      >
        <div>
          <p
            className={cn(
              'text-[10px] font-semibold uppercase tracking-widest',
              isNavy ? 'text-slate-500' : 'text-slate-400',
            )}
          >
            DentalFlow
          </p>
          <p className={cn('mt-0.5 text-sm font-semibold', isNavy ? 'text-white' : 'text-slate-700')}>
            {role}
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1',
            isNavy ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-white shadow-sm',
          )}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className={cn('text-[11px] font-medium', isNavy ? 'text-slate-400' : 'text-slate-500')}>
            Ao vivo
          </span>
        </div>
      </div>

      {/* Module grid */}
      <div className="p-5">
        <p
          className={cn(
            'mb-3 text-[10px] font-semibold uppercase tracking-widest',
            isNavy ? 'text-slate-500' : 'text-slate-400',
          )}
        >
          Módulos ativos
        </p>
        <div className="grid grid-cols-2 gap-2">
          {modules.slice(0, 4).map((mod, i) => {
            const ModIcon = moduleIcons[i]
            if (!ModIcon) return null
            return (
              <div
                key={mod}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2',
                  isNavy ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50',
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                    isNavy ? 'bg-white/10' : 'bg-primary/10',
                  )}
                >
                  <ModIcon
                    className={cn('h-3.5 w-3.5', isNavy ? 'text-blue-400' : 'text-primary')}
                  />
                </div>
                <span
                  className={cn(
                    'truncate text-xs font-medium',
                    isNavy ? 'text-slate-300' : 'text-slate-600',
                  )}
                >
                  {mod}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Card footer */}
      <div
        className={cn(
          'flex items-center gap-2.5 border-t px-5 py-3',
          isNavy
            ? 'border-slate-700 bg-gradient-to-r from-blue-900/30 to-transparent'
            : 'border-slate-100 bg-gradient-to-r from-primary/5 to-transparent',
        )}
      >
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            isNavy ? 'bg-white/10' : 'bg-primary/10',
          )}
        >
          <RoleIcon className={cn('h-3.5 w-3.5', isNavy ? 'text-blue-400' : 'text-primary')} />
        </div>
        <p className={cn('text-xs font-medium', isNavy ? 'text-slate-400' : 'text-slate-600')}>
          Pronto para começar
        </p>
      </div>
    </div>
  )
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
          <p className="text-lg font-bold tabular-nums text-white">
            R$&nbsp;18.4k
          </p>
          <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400">
            Receita/mês
          </p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-bold tabular-nums text-emerald-400">78%</p>
          <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400">
            Ocupação
          </p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-bold tabular-nums text-blue-400">12</p>
          <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-400">
            Novos pac.
          </p>
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
                className={cn(
                  'w-full rounded-t-sm',
                  bar.current ? 'bg-primary' : 'bg-slate-700',
                )}
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
