import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type HomeEmptyStateProps = {
  title: string
  description?: string
  /**
   * Lucide icon displayed above the title.
   * If omitted the icon container is not rendered.
   */
  icon?: LucideIcon
  /** Optional CTA rendered below the description. */
  action?: ReactNode
  /**
   * When `true`, renders a slimmer version suitable for use inside a section
   * panel (e.g. "no results" within a HomeSection body).
   * When `false` (default), renders the full centred layout with more padding.
   */
  compact?: boolean
  className?: string
}

/**
 * Role-agnostic empty state for home/dashboard sections.
 *
 * Two display modes:
 *   `compact={false}` (default) — full centred layout, used for page-level
 *     empty states (e.g. "No appointments for this day").
 *   `compact={true}` — slim in-panel variant, used inside `HomeSection` bodies
 *     (replaces the `EmptySlot` helper from `ProductivityCenter`).
 */
export function HomeEmptyState({
  title,
  description,
  icon: Icon,
  action,
  compact = false,
  className,
}: HomeEmptyStateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-1.5 py-8 text-center',
          className,
        )}
      >
        {Icon && (
          <Icon className="h-7 w-7 text-muted-foreground/40" aria-hidden="true" />
        )}
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground/70">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      )}
      <p className={cn('font-semibold text-foreground', Icon ? 'mt-4' : '')}>{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
