import type { LucideIcon } from 'lucide-react'

type Benefit = {
  icon: LucideIcon
  title: string
  description: string
}

type RoleBenefitGridProps = {
  benefits: Benefit[]
  highlightedBenefitIndex: number
  roleLabel: string
}

export function RoleBenefitGrid({
  benefits,
  highlightedBenefitIndex,
  roleLabel,
}: RoleBenefitGridProps) {
  const primary = benefits[highlightedBenefitIndex]
  const secondaryBenefits = benefits.filter((_, i) => i !== highlightedBenefitIndex)
  const PrimaryIcon = primary?.icon

  return (
    <section className="bg-slate-50 py-16 lg:py-20" aria-labelledby="benefits-heading">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Benefícios
        </p>
        <h2
          id="benefits-heading"
          className="mt-2 text-xl font-semibold text-slate-900"
        >
          Como o DentalFlow ajuda{' '}
          <span className="text-primary">{roleLabel.toLowerCase()}</span>
        </h2>

        <div className="mt-8 space-y-4">
          {/* Primary benefit — full-width, more prominent */}
          {primary && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 lg:p-8">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <PrimaryIcon className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{primary.title}</h3>
                  <p className="mt-2 text-base leading-7 text-slate-600">{primary.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Secondary benefits — 3-column grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {secondaryBenefits.map((benefit) => {
              const BenIcon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BenIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-800">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
