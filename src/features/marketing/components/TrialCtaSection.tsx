import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function TrialCtaSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#0f3b73_0%,#082f5f_100%)] py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          7 dias grátis — sem cartão de crédito
        </div>

        <h2 className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Pronto para organizar sua clínica com o DentalFlow?
        </h2>
        <p className="mt-4 text-lg leading-7 text-blue-200">
          Comece com 7 dias grátis e veja como uma plataforma moderna pode simplificar a rotina da sua clínica — sem compromisso, sem cartão, sem burocracia.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
          <Button
            variant="outline"
            size="xl"
            className="border-white/50 text-white hover:bg-white/10 hover:text-white focus-visible:ring-white"
            asChild
          >
            <a href="#planos">Ver planos</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
