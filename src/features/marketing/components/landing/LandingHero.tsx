import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { companyInfo } from '@/config/company'

import { AuroraBackdrop } from './AuroraBackdrop'
import { MagneticButton } from './MagneticButton'
import { StaggerGroup, StaggerItem } from './Reveal'

const TRUST_SIGNALS = [
  '9 módulos integrados',
  '4 perfis de acesso',
  '100% web, sem instalação',
] as const

export function LandingHero() {
  return (
    <section className="relative isolate flex min-h-[90svh] items-center overflow-hidden bg-slate-950 pt-28 pb-16 text-white lg:pt-32 lg:pb-24">
      <AuroraBackdrop />
      {/* Bottom fade into the next (light) section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_1.18fr] lg:gap-8 lg:px-8">
        {/* ── Left: commercial copy ── */}
        <StaggerGroup className="max-w-xl" stagger={0.09}>
          <StaggerItem>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-cyan-200 backdrop-blur-sm">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Feito para clínicas odontológicas
            </span>
          </StaggerItem>

          <StaggerItem>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.07] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              O sistema odontológico que transforma sua clínica em uma{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                operação previsível.
              </span>
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              Centralize agenda, pacientes, prontuários, financeiro, estoque, equipe e indicadores
              em uma única plataforma feita para a rotina real da odontologia.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-7 flex flex-col items-start gap-2.5">
              {/* Primary highlight — always a single, compact line */}
              <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-3.5 py-1.5 text-sm font-semibold text-emerald-100">
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                7 dias de teste grátis
              </span>
              {/* Secondary reassurances — wrap cleanly as whole units */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-400">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0 text-emerald-400/80"
                    aria-hidden="true"
                  />
                  Sem cartão de crédito
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0 text-emerald-400/80"
                    aria-hidden="true"
                  />
                  Cancele quando quiser
                </span>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <MagneticButton>
                <Button variant="secondary" size="xl" asChild>
                  <Link to="/acessar" search={{ mode: 'register' }}>
                    Iniciar teste grátis
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </MagneticButton>
              <Button variant="inverse" size="xl" asChild>
                <Link to="/funcionalidades">Ver funcionalidades</Link>
              </Button>
            </div>
          </StaggerItem>

          <StaggerItem>
            <ul
              className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-400"
              aria-label="Destaques da plataforma"
            >
              {TRUST_SIGNALS.map((signal) => (
                <li key={signal} className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  {signal}
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-6 text-sm italic text-cyan-300/70">{companyInfo.brandSlogan}</p>
          </StaggerItem>
        </StaggerGroup>

        {/* ── Right: product proof (real DentalFlow interface) ── */}
        <div className="relative flex items-center justify-center">
          {/* Soft glow behind the product render */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse 72% 62% at 50% 45%, rgba(56,189,248,0.10), transparent 72%)',
            }}
          />

          {/* Subtle dental "smile" arc motif behind the product */}
          <svg
            className="pointer-events-none absolute -bottom-2 left-1/2 -z-10 h-44 w-[120%] -translate-x-1/2 opacity-40"
            viewBox="0 0 400 120"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="hero-smile" x1="0" y1="0" x2="400" y2="0">
                <stop offset="0%" stopColor="rgba(56,189,248,0)" />
                <stop offset="50%" stopColor="rgba(125,211,252,0.8)" />
                <stop offset="100%" stopColor="rgba(56,189,248,0)" />
              </linearGradient>
            </defs>
            <path
              d="M16 34 Q200 132 384 34"
              stroke="url(#hero-smile)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <img
            src="/Macbook-Marketing DentalFlow.png"
            alt="Painel financeiro do DentalFlow exibido em um MacBook — dashboard real da plataforma de gestão odontológica"
            className="relative z-10 w-full max-w-2xl object-contain drop-shadow-2xl lg:max-w-none"
            loading="eager"
            decoding="async"
          />

          {/* Floating "live" card — next appointment */}
          <div
            className="df-float absolute bottom-2 left-0 z-20 hidden rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 shadow-2xl shadow-cyan-500/10 backdrop-blur-md sm:block"
            style={{ animationDelay: '-1.5s' }}
            aria-hidden="true"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <p className="text-[11px] font-medium text-slate-400">Próxima consulta</p>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">
              Ana Rodrigues · 09:00 · Profilaxia
            </p>
          </div>

          {/* Floating card — confirmation cue (desktop only, kept clear of the frame) */}
          <div
            className="df-float absolute right-0 top-4 z-20 hidden rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 shadow-2xl shadow-emerald-500/10 backdrop-blur-md lg:block"
            style={{ animationDelay: '-3s' }}
            aria-hidden="true"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-[11px] font-medium text-slate-400">Consulta confirmada</p>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">Lembrete via WhatsApp</p>
          </div>
        </div>
      </div>
    </section>
  )
}
