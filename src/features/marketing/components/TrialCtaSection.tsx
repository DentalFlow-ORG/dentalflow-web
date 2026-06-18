import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { MagneticButton } from './landing/MagneticButton'
import { Reveal } from './landing/Reveal'

const TRUST_SIGNALS = ['7 dias grátis', 'Sem cartão de crédito', 'Cancele quando quiser'] as const

export function TrialCtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#0f3b73_0%,#082f5f_100%)] py-24">
      {/* Premium dental motif: soft tooth-light glow + a clean smile arc (no noisy waves) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[-22%] h-[65%] w-[85%] -translate-x-1/2 rounded-[100%] blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(56,189,248,0.20), transparent 70%)',
          }}
        />
        <svg
          className="absolute bottom-0 left-1/2 h-44 w-[150%] -translate-x-1/2 opacity-30"
          viewBox="0 0 600 160"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cta-smile" x1="0" y1="0" x2="600" y2="0">
              <stop offset="0%" stopColor="rgba(125,211,252,0)" />
              <stop offset="50%" stopColor="rgba(125,211,252,0.85)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0)" />
            </linearGradient>
          </defs>
          <path
            d="M30 40 Q300 180 570 40"
            stroke="url(#cta-smile)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <Reveal className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Sua clínica mais organizada, lucrativa e previsível começa hoje.
        </h2>
        <p className="mt-4 text-lg leading-7 text-blue-200">
          Comece com 7 dias grátis e veja como o DentalFlow simplifica a gestão odontológica sem
          planilhas, retrabalho ou sistemas desconectados.
        </p>

        {/* 3 micro trust signals */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {TRUST_SIGNALS.map((signal) => (
            <span
              key={signal}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-100"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              {signal}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton>
            <Button
              size="xl"
              className="bg-white text-slate-900 hover:bg-white/90 focus-visible:ring-white"
              asChild
            >
              <Link to="/acessar" search={{ mode: 'register' }}>
                Iniciar teste grátis
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </MagneticButton>
          <Button variant="inverse" size="xl" asChild>
            <a href="#planos">Ver planos</a>
          </Button>
        </div>

        {/* Honest reassurance (replaces an unverifiable live counter) */}
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          Migração dos seus dados e suporte na implantação inclusos.
        </p>
      </Reveal>
    </section>
  )
}
