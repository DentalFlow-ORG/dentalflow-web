import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react'

import { companyInfo } from '@/config/company'

const trustPoints = [
  {
    icon: CalendarCheck2,
    title: 'Rotina centralizada',
    description: 'Agenda, equipe e pacientes entram no mesmo fluxo operacional.',
    delay: '100ms',
  },
  {
    icon: ShieldCheck,
    title: 'Acesso protegido',
    description: 'Sessões e permissões continuam validadas pelo backend.',
    delay: '200ms',
  },
  {
    icon: ClipboardList,
    title: 'Dados consistentes',
    description: 'Cadastro e clínica são vinculados antes do acesso ao app.',
    delay: '300ms',
  },
] as const

export function AuthInfoPanel() {
  return (
    <aside className="relative overflow-hidden rounded-xl shadow-2xl shadow-blue-950/40 lg:min-h-[640px]">
      {/* Layered gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, #071c3a 0%, #0d2d5c 35%, #1e3a8a 70%, #1a4fa8 100%)',
        }}
      />

      {/* Cyan shimmer accent */}
      <div
        className="absolute inset-0 opacity-40 df-shimmer-bg"
        style={{
          background:
            'radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.25) 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, rgba(59,130,246,0.20) 0%, transparent 55%)',
        }}
      />

      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      {/* Decorative circles */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/5 bg-cyan-400/8 blur-2xl" />
      <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />

      {/* Spinning ring — large decorative element */}
      <div className="pointer-events-none absolute -right-12 top-1/2 h-72 w-72 -translate-y-1/2 opacity-10">
        <div className="h-full w-full rounded-full border-2 border-dashed border-cyan-300 df-spin-slow" />
      </div>
      <div className="pointer-events-none absolute -right-6 top-1/2 h-56 w-56 -translate-y-1/2 opacity-8">
        <div
          className="h-full w-full rounded-full border border-white/30 df-spin-slow"
          style={{ animationDirection: 'reverse', animationDuration: '12s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-6 text-white sm:p-8">
        {/* Badge */}
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          Acesso DentalFlow
        </div>

        {/* Hero heading */}
        <div className="mt-8 max-w-sm">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
            Sua clínica no flow.{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, #67e8f9 0%, #a5f3fc 50%, #e0f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Seu crescimento é show.
            </span>
          </h1>
          <p className="mt-4 text-sm leading-7 text-blue-100/75 sm:text-[0.9375rem]">
            Entre para operar a agenda, a presença digital e os dados da clínica em um ambiente
            limpo, seguro e orientado ao crescimento.
          </p>
        </div>

        {/* Trust point cards */}
        <div className="mt-8 grid gap-3">
          {trustPoints.map((item) => (
            <div
              key={item.title}
              className="group rounded-lg border border-white/12 bg-white/7 p-4 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/12 animate-in fade-in-0 slide-in-from-left-3 duration-500"
              style={{ animationDelay: item.delay, animationFillMode: 'both' }}
            >
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/15 text-cyan-200 ring-1 ring-white/10 transition-colors duration-200 group-hover:bg-white/20">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-0.5 text-xs leading-5 text-blue-100/65">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom card */}
        <div className="mt-auto pt-8">
          <div className="rounded-lg border border-white/12 bg-white/7 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-400/20 ring-1 ring-emerald-400/20">
                <Stethoscope className="h-4.5 w-4.5 text-emerald-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pensado para clínicas</p>
                <p className="mt-0.5 text-xs text-white/55">
                  Sem promessas infladas, sem atalhos de segurança.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2.5 text-xs leading-5 text-white/70">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              {companyInfo.brandSlogan}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
