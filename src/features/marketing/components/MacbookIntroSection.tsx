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
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute -right-48 -top-48 h-[640px] w-[640px] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute -bottom-24 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/12 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
        {/* Eyebrow badge — increased from text-xs to text-sm */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
          Plataforma completa para odontologia
        </div>

        {/* Main headline */}
        <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Veja sua clínica organizada em uma{' '}
          <span className="text-cyan-300">plataforma moderna</span>
        </h2>

        {/* Subtitle — increased from text-lg to text-xl */}
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-blue-200">
          Agenda, pacientes, financeiro, estoque, relatórios e comunicação em um só fluxo —
          sem planilhas, sem papel, sem sistema desatualizado.
        </p>

        {/* Feature highlights — increased from text-xs/text-[11px] */}
        <div className="mt-10 flex flex-wrap items-start justify-center gap-3">
          {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm"
            >
              <Icon className="h-5 w-5 shrink-0 text-cyan-400" aria-hidden="true" />
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs leading-5 text-blue-300">{desc}</p>
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
            className="mx-auto w-full max-w-4xl object-contain drop-shadow-2xl"
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
