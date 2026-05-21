import { Calendar, Layers, Monitor, TrendingUp } from 'lucide-react'

import { companyInfo } from '@/config/company'

const HIGHLIGHTS = [
  { icon: Calendar, label: 'Agenda integrada', desc: 'Horários, status e Google Calendar' },
  { icon: TrendingUp, label: 'Financeiro claro', desc: 'Fluxo de caixa em tempo real' },
  { icon: Layers, label: 'Tudo em um lugar', desc: 'Pacientes, estoque e leads' },
  { icon: Monitor, label: '100% na nuvem', desc: 'Sem instalação, acesso de qualquer lugar' },
]

export function MacbookIntroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pb-0 pt-24">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Top-right ambient cyan — radial gradient, no filter blur */}
        <div
          className="absolute right-0 top-0 h-full w-3/4"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 75% 55% at 100% 0%, rgba(34,211,238,0.11) 0%, transparent 65%)',
          }}
        />
        {/* Bottom-center ambient blue */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 85% 65% at 50% 100%, rgba(29,78,216,0.13) 0%, transparent 68%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Eyebrow badge — increased from text-xs to text-sm */}
        <div className="mx-auto inline-flex w-full max-w-[19rem] items-center justify-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-center text-sm font-semibold uppercase leading-5 tracking-[0.14em] text-cyan-300 sm:w-auto sm:max-w-full sm:px-5 sm:tracking-widest">
          <span className="h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
          Plataforma completa para odontologia
        </div>

        {/* Main headline */}
        <h2 className="mx-auto mt-6 max-w-[19rem] break-words text-2xl font-semibold leading-tight tracking-tight text-white sm:max-w-4xl sm:text-4xl lg:text-5xl">
          Veja sua clínica
          <br className="sm:hidden" /> organizada em uma{' '}
          <br className="sm:hidden" />
          <span className="text-cyan-300">plataforma moderna</span>
        </h2>

        {/* Subtitle — increased from text-lg to text-xl */}
        <p className="mx-auto mt-6 max-w-[19rem] break-words text-base leading-8 text-blue-200 sm:max-w-2xl sm:text-xl">
          Agenda, pacientes, financeiro, estoque, relatórios e comunicação em um só fluxo —
          sem planilhas, sem papel, sem sistema desatualizado.
        </p>

        {/* Feature highlights — increased from text-xs/text-[11px] */}
        <div className="mt-10 flex flex-wrap items-start justify-center gap-3">
          {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex w-full max-w-[19rem] items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm sm:w-auto sm:max-w-full sm:px-5"
            >
              <Icon className="h-5 w-5 shrink-0 text-cyan-400" aria-hidden="true" />
              <div className="min-w-0 text-left">
                <p className="break-words text-sm font-semibold text-white">{label}</p>
                <p className="break-words text-xs leading-5 text-blue-300">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm italic text-cyan-300/60">{companyInfo.brandSlogan}</p>

        {/* MacBook product image */}
        <div className="relative mt-12">
          <img
            src="/Macbook-Marketing DentalFlow.png"
            alt="DentalFlow em um MacBook — visão geral da plataforma de gestão odontológica"
            className="mx-auto w-full max-w-[19rem] object-contain drop-shadow-2xl sm:max-w-4xl"
            loading="eager"
          />
          {/* Smooth fade into the next section's dark gradient */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}
