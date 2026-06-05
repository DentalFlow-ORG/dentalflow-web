import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type HomeDashboardHeaderProps = {
  /** Small uppercase label above the title (e.g. role context or "Hoje"). */
  eyebrow?: string
  /**
   * Primary page title. Can be personalized (e.g. "Olá, Ana" for DENTIST,
   * or the clinic name for OWNER).
   */
  title: string
  /** Secondary line rendered below the title — typically today's formatted date. */
  description?: string
  /**
   * Optional badge placed to the right of the title on the same baseline
   * (e.g. trial countdown, plan name, or custom status pill).
   */
  badge?: ReactNode
  /**
   * Primary actions placed in the top-right corner on medium+ viewports,
   * or below the title on mobile (e.g. "Novo agendamento" CTA).
   */
  actions?: ReactNode
  className?: string
}

/**
 * Premium hero header for role-specific home dashboards.
 *
 * Builds on the same visual language as `AppPageHeader` but adds support for
 * an inline `badge` next to the title and a dedicated `actions` slot that
 * sits on the right on desktop.
 *
 * Used by OWNER, ASSISTANT, DENTIST, and ADMIN home containers.
 */
export function HomeDashboardHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
  className,
}: HomeDashboardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {title}
          </h1>
          {badge && <span>{badge}</span>}
        </div>

        {description && (
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="w-full shrink-0 sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
          {actions}
        </div>
      )}
    </div>
  )
}
