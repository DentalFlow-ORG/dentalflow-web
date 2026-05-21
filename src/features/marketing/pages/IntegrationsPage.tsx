import { ArrowRight, CheckCircle2, Settings, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { companyInfo } from '@/config/company'
import { cn } from '@/lib/utils'

import { PublicLayout } from '../components/PublicLayout'
import { usePageMeta } from '../hooks/usePageMeta'
import { integrationCards } from '../data/public-content'

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  available: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Disponível',
  },
  configuring: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    label: 'Em configuração',
  },
  soon: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: 'Em breve',
  },
  simulated: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
    label: 'Simulado / interno',
  },
}

export function IntegrationsPage() {
  usePageMeta(
    'DentalFlow | Integrações e serviços conectados',
    'Veja as plataformas e serviços integrados ao DentalFlow: Google Calendar, Stripe, OpenAI, WhatsApp e mais.',
  )
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pb-12 pt-28 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Integrações
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Plataformas e serviços integrados
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-500">
            O DentalFlow conecta-se a serviços reconhecidos do mercado para entregar uma experiência completa e confiável.
          </p>
          <p className="mt-4 text-sm italic text-slate-400">{companyInfo.brandSlogan}</p>
        </div>
      </section>

      {/* Integration cards */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrationCards.map((integration) => {
              const Icon = integration.icon
              const style = STATUS_STYLES[integration.status]
              return (
                <article
                  key={integration.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                      {integration.logoSrc ? (
                        <img
                          src={integration.logoSrc}
                          alt={integration.logoAlt}
                          className="h-7 w-7 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                        style.bg,
                        style.text,
                      )}
                    >
                      <span
                        className={cn('h-1.5 w-1.5 rounded-full', style.dot)}
                        aria-hidden="true"
                      />
                      {integration.statusLabel || style.label}
                    </span>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {integration.category}
                  </p>
                  <h2 className="mt-4 text-base font-semibold text-slate-800">{integration.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{integration.description}</p>

                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                    <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <p className="text-xs leading-5 text-slate-600">
                      <span className="font-semibold">Benefício:</span>{' '}
                      {integration.benefit}
                    </p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">{integration.where}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust note */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <Settings className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Integrações com responsabilidade
          </h2>
          <p className="mt-3 leading-7 text-slate-500">
            Todas as conexões do DentalFlow com serviços externos são feitas via API oficial, com autenticação segura e sem exposição de chaves no frontend.
          </p>
          <ul className="mx-auto mt-6 max-w-xl space-y-2.5 text-left" role="list">
            {[
              'Integração oficial via API de cada provedor',
              'Conexão server-side, sem exposição de tokens no frontend',
              'Credenciais armazenadas com segurança no servidor',
              'Não compartilhamos dados entre clínicas',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span className="text-sm text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-semibold text-white">
            Pronto para conectar sua clínica?
          </h2>
          <p className="mt-3 text-blue-200">
            Comece com 7 dias gratuitos. Sem cartão de crédito.
          </p>
          <Button size="lg" variant="secondary" className="mt-6" asChild>
            <a href="/acessar?mode=register">
              Testar grátis
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
