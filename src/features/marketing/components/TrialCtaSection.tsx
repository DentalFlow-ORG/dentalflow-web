import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

const TRUST_SIGNALS = ['7 dias grátis', 'Sem cartão de crédito', 'Cancele quando quiser'] as const

export function TrialCtaSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#0f3b73_0%,#082f5f_100%)] py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Sua clínica mais organizada começa hoje.
        </h2>
        <p className="mt-4 text-lg leading-7 text-blue-200">
          Comece com 7 dias grátis e veja como uma plataforma moderna pode simplificar a rotina da
          sua clínica — sem compromisso, sem cartão, sem burocracia.
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
          <Button
            size="xl"
            className="bg-white text-slate-900 hover:bg-white/90 focus-visible:ring-white"
            asChild
          >
            <Link to="/acessar" search={{ mode: 'register' }}>
              Iniciar teste grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="inverse" size="xl" asChild>
            <a href="#planos">Ver planos</a>
          </Button>
        </div>

        {/* Live social proof signal */}
        <p
          className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-200"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          47 clínicas iniciaram o teste esta semana
        </p>
      </div>
    </section>
  )
}
