import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { RoleBenefitGrid } from '../components/RoleBenefitGrid'
import { RoleFinalCta } from '../components/RoleFinalCta'
import { RoleHeroMockup } from '../components/RoleHeroMockup'
import { RoleModulesPanel } from '../components/RoleModulesPanel'
import { RoleTrustStrip } from '../components/RoleTrustStrip'
import { RoleWorkflow } from '../components/RoleWorkflow'
import { PublicLayout } from '../components/PublicLayout'
import type { RoleContent } from '../data/public-content'

type RolePageProps = {
  content: RoleContent
}

export function RolePage({ content }: RolePageProps) {
  const Icon = content.icon
  const isNavy = content.accent === 'navy'
  const isFresh = content.accent === 'fresh'

  return (
    <PublicLayout darkHero={isNavy}>
      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section
        className={cn(
          'pb-16 pt-28 lg:pb-24 lg:pt-36',
          isNavy
            ? 'bg-slate-950'
            : isFresh
              ? 'bg-gradient-to-b from-emerald-50 to-white'
              : 'bg-gradient-to-b from-blue-50 to-white',
        )}
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">

            {/* Left: commercial copy */}
            <div className="max-w-xl">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl',
                  isNavy ? 'bg-white/10' : isFresh ? 'bg-emerald-100' : 'bg-primary/10',
                )}
              >
                <Icon
                  className={cn('h-6 w-6', isNavy ? 'text-white' : isFresh ? 'text-emerald-700' : 'text-primary')}
                  aria-hidden="true"
                />
              </div>

              <p
                className={cn(
                  'mt-5 text-sm font-semibold uppercase tracking-[0.18em]',
                  isNavy ? 'text-blue-400' : 'text-primary',
                )}
              >
                {content.role}
              </p>

              <h1
                className={cn(
                  'mt-3 text-4xl font-semibold leading-tight sm:text-5xl',
                  isNavy ? 'text-white' : 'text-slate-900',
                )}
              >
                {content.tagline}
              </h1>

              <p
                className={cn(
                  'mt-5 text-lg leading-8',
                  isNavy ? 'text-slate-400' : 'text-slate-500',
                )}
              >
                {content.description}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/acessar" search={{ mode: 'register' }}>
                    {content.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant={isNavy ? 'inverse' : 'outline'}
                  asChild
                >
                  <Link to="/planos">Ver planos</Link>
                </Button>
              </div>

              {/* Trust pill */}
              <div
                className={cn(
                  'mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-4 py-2.5 text-sm font-semibold',
                  isNavy
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800',
                )}
              >
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>7 dias de teste grátis</span>
                <span
                  className={cn(
                    'hidden h-4 w-px sm:block',
                    isNavy ? 'bg-emerald-500/30' : 'bg-emerald-200',
                  )}
                  aria-hidden="true"
                />
                <span>Sem cartão de crédito</span>
              </div>
            </div>

            {/* Right: role mockup */}
            <div className="w-full lg:max-w-sm xl:max-w-md">
              <RoleHeroMockup
                type={content.mockupType}
                accent={content.accent}
                role={content.role}
                icon={content.icon}
                modules={content.modules}
                moduleIcons={content.moduleIcons}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Trust strip ──────────────────────────────────────── */}
      <RoleTrustStrip />

      {/* ── 3. Workflow / story ─────────────────────────────────── */}
      <RoleWorkflow workflow={content.workflow} roleLabel={content.role} />

      {/* ── 4. Modules panel ────────────────────────────────────── */}
      <RoleModulesPanel
        modules={content.modules}
        moduleIcons={content.moduleIcons}
        roleLabel={content.role}
        accent={content.accent === 'fresh' ? 'emerald' : 'standard'}
      />

      {/* ── 5. Benefits ─────────────────────────────────────────── */}
      <RoleBenefitGrid
        benefits={content.benefits}
        highlightedBenefitIndex={content.highlightedBenefitIndex}
        roleLabel={content.role}
      />

      {/* ── 6. Final CTA ────────────────────────────────────────── */}
      <RoleFinalCta finalCta={content.finalCta} />
    </PublicLayout>
  )
}
