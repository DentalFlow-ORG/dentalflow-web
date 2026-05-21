import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, CheckCircle2 } from 'lucide-react'

import { Eyebrow } from '@/components/common/Eyebrow'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { heroAppointments } from '../data/landing-content'

const STATUS_CONFIG = {
  confirmed: {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700',
    label: 'Confirmada',
  },
  waiting: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700',
    label: 'Aguardando',
  },
} as const

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20">
      {/* Sky/cyan glow */}
      <div className="pointer-events-none absolute right-0 top-0 h-[680px] w-2/3 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.15)_0%,transparent_58%)]" />
      {/* Navy bloom */}
      <div className="pointer-events-none absolute left-0 top-0 h-[520px] w-1/2 bg-[radial-gradient(ellipse_at_top_left,rgba(30,58,138,0.09)_0%,transparent_65%)]" />

      <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-8 lg:py-20">

        {/* ── Left: commercial copy ── */}
        <div className="max-w-xl">
          <Eyebrow icon={CalendarDays}>
            Gestão moderna para clínicas odontológicas
          </Eyebrow>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem]">
            O software odontológico que sua clínica vai{' '}
            <span className="text-primary">querer usar todos os dias.</span>
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Centralize agenda, pacientes, financeiro, estoque, leads, relatórios e IA em uma plataforma segura, simples e feita para a rotina real da clínica.
          </p>

          {/* Trial badge */}
          <div className="mt-7 inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>7 dias de teste grátis</span>
            <span className="hidden h-4 w-px bg-emerald-200 sm:block" aria-hidden="true" />
            <span>Sem cartão de crédito</span>
            <span className="hidden h-4 w-px bg-emerald-200 sm:block" aria-hidden="true" />
            <span>Cancele quando quiser</span>
          </div>

          {/* CTAs */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button size="xl" asChild>
              <Link to="/acessar" search={{ mode: 'register' }}>
                Iniciar teste grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/funcionalidades">
                Ver funcionalidades
              </Link>
            </Button>
            <Button variant="ghost" size="xl" asChild>
              <Link to="/perguntas-frequentes">
                Falar com especialista
              </Link>
            </Button>
          </div>

          {/* Trust signals — product-based, not fake metrics */}
          <div
            className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500"
            role="list"
            aria-label="Destaques da plataforma"
          >
            <span className="flex items-center gap-1.5" role="listitem">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
              9 módulos integrados
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5" role="listitem">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
              4 perfis de acesso
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5" role="listitem">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
              100% web, sem instalação
            </span>
          </div>
        </div>

        {/* ── Right: dashboard mockup ── */}
        <div className="relative lg:pl-4">
          {/* Floating notification — top right */}
          <div
            className="absolute -right-2 -top-4 z-10 hidden rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg md:block"
            aria-hidden="true"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-xs font-semibold text-slate-700">Próxima consulta</p>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Ana Rodrigues · 09:00</p>
          </div>

          {/* Floating new-patient notification — bottom left */}
          <div
            className="absolute -bottom-4 -left-4 z-10 hidden rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg md:block"
            aria-hidden="true"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <p className="text-xs font-semibold text-slate-700">+1 novo paciente agendado</p>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Agora mesmo</p>
          </div>

          {/* Main dashboard card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10">

            {/* Dashboard header — navy */}
            <div className="border-b border-slate-800 bg-slate-900 px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    DentalFlow
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">Painel da clínica</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="text-[11px] font-medium text-slate-400">Ao vivo</span>
                </div>
              </div>
            </div>

            {/* Metric cells */}
            <div
              className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100"
              role="group"
              aria-label="Resumo do dia"
            >
              <div className="px-4 py-3 text-center">
                <p className="text-2xl font-bold text-slate-900" aria-label="12 consultas hoje">12</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">Consultas hoje</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-600" aria-label="8 confirmadas">8</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">Confirmadas</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-2xl font-bold text-amber-500" aria-label="4 aguardando">4</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">Aguardando</p>
              </div>
            </div>

            {/* Agenda label */}
            <div className="flex items-center justify-between px-5 pb-1 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Agenda de hoje
              </p>
              <p className="text-[11px] text-slate-400">20 mai</p>
            </div>

            {/* Appointment rows */}
            <div className="divide-y divide-slate-50">
              {heroAppointments.map((appt) => {
                const config = STATUS_CONFIG[appt.status]
                return (
                  <div key={appt.patient} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex w-12 shrink-0 items-center gap-1.5">
                      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)} aria-hidden="true" />
                      <span className="text-[11px] font-semibold tabular-nums text-slate-500">{appt.time}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{appt.patient}</p>
                      <p className="truncate text-xs text-slate-400">{appt.procedure}</p>
                    </div>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', config.badge)}>
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Team footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-slate-500">Equipe disponível</p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5" aria-hidden="true">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white">C</div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">P</div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">2 dentistas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Background glow decorations */}
          <div className="pointer-events-none absolute -bottom-6 -right-6 -z-10 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-8 -top-8 -z-10 h-40 w-40 rounded-full bg-emerald-100/60 blur-2xl" aria-hidden="true" />
        </div>

      </div>
    </section>
  )
}
