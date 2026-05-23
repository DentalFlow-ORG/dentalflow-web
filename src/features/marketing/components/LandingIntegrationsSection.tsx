import { CheckCircle2, LockKeyhole, ShieldCheck, Workflow, Zap } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'

import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import { integrationCards, type IntegrationCard as IntegrationCardData } from '../data/public-content'

const FEATURED_INTEGRATIONS = [
  'Google Calendar',
  'WhatsApp Cloud API',
  'Stripe',
  'OpenAI',
  'Supabase',
  'Provedor NFS-e',
] as const

function IntegrationCard({
  integration,
  index,
}: {
  integration: IntegrationCardData
  index: number
}) {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.12)
  const Icon = integration.icon

  return (
    <article
      ref={ref}
      className={cn(
        'group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.075] p-5 shadow-xl shadow-slate-950/10 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.10] motion-reduce:translate-y-0 motion-reduce:opacity-100',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
      )}
      style={{ transitionDelay: isVisible ? `${Math.min(index * 65, 300)}ms` : '0ms' }}
    >
      {/* Logo + name row */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white p-2 shadow-sm">
          {integration.logoSrc ? (
            <img
              src={integration.logoSrc}
              alt={integration.logoAlt}
              className="h-7 w-7 object-contain"
              loading="lazy"
            />
          ) : (
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.13em] text-cyan-200/65">
            {integration.category}
          </p>
          <h3 className="mt-0.5 truncate text-base font-semibold text-white">{integration.name}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{integration.description}</p>

      <div className="mt-auto pt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5">
        <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
        <p className="text-xs leading-5 text-slate-200">{integration.benefit}</p>
      </div>
    </article>
  )
}

export function LandingIntegrationsSection() {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>(0.12)
  const featured = FEATURED_INTEGRATIONS.map((name) =>
    integrationCards.find((integration) => integration.name === name),
  ).filter((integration): integration is IntegrationCardData => Boolean(integration))

  return (
    <section id="integracoes" className="relative overflow-hidden bg-slate-950 py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Top-right ambient — radial gradient, no blur filter */}
        <div
          className="absolute right-0 top-0 h-full w-2/3"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 55% at 100% 0%, rgba(34,211,238,0.09) 0%, transparent 65%)',
          }}
        />
        {/* Bottom-left ambient */}
        <div
          className="absolute bottom-0 left-0 h-full w-2/3"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 55% at 0% 100%, rgba(52,211,153,0.08) 0%, transparent 65%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={ref}
          className={cn(
            'max-w-2xl transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          )}
        >
          <SectionHeading
            eyebrow="Ecossistema conectado"
            title="Integrações que conectam sua clínica ao fluxo ideal"
            description="Agenda, comunicação, pagamentos, IA, dados e fiscal em um só lugar — cada conexão documentada e com propósito claro."
            tone="dark"
          />
        </div>

        {/* Trust chips */}
        <div
          className={cn(
            'mt-8 flex flex-wrap gap-3 transition-all duration-700 motion-reduce:opacity-100',
            isVisible ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transitionDelay: isVisible ? '100ms' : '0ms' }}
        >
          {(
            [
              [Workflow, 'Menos operação manual, mais fluxo centralizado'],
              [CheckCircle2, 'Cada integração documentada no produto ou roadmap confirmado'],
              [LockKeyhole, 'Credenciais e chaves sempre fora do frontend'],
            ] as const
          ).map(([Icon, text]) => (
            <div
              key={text}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-slate-300"
            >
              <Icon className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Integration cards — desktop: 3 cols (2 rows), tablet: 2 cols, mobile: 1 col */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((integration, index) => (
            <IntegrationCard key={integration.name} integration={integration} index={index} />
          ))}
        </div>

        {/* Disclaimer footer */}
        <div className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>Não exibimos integrações sem evidência no produto ou roadmap documentado.</span>
          </div>
          <div className="flex items-start gap-2">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
            <span>
              Pagamentos, mensagens e IA dependem de provedores externos e permissões corretas.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
