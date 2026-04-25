import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function TrialCtaSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-8 rounded-2xl border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_52%,#eff6ff_100%)] p-8 shadow-xl shadow-emerald-950/5 lg:grid-cols-[1fr_auto] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Teste gratis sem cartao de credito
            </div>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-slate-950">
              Experimente o fluxo inicial da plataforma antes de conversar sobre
              planos.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-700">
              O acesso de teste foi pensado para apresentar a experiencia do
              DentalFlow sem inserir cartao, sem cobranca automatica e sem
              compromisso financeiro.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button size="xl" asChild>
              <Link to="/acessar" search={{ mode: 'register' }}>
                Criar teste gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/acessar" search={{ mode: 'login' }}>
                Ja tenho acesso
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
