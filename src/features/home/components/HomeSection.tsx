import type { ReactNode } from 'react'

import { PanelCard } from '@/components/common/PanelCard'

type HomeSectionProps = {
  /** Section heading rendered as <h2>. */
  title: string
  /** Optional subtitle below the title. */
  description?: string
  /**
   * Action placed in the top-right corner of the section header
   * (e.g. a "Ver todos" Button or Link).
   */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Premium section container for home/dashboard panels.
 *
 * Replaces the repeated `PanelCard > SectionHeader > content` pattern that
 * appears throughout the existing dashboard containers. The children slot
 * receives the section body (lists, grids, empty states, etc.).
 *
 * Does not know about roles — compose it with role-specific data above.
 */
export function HomeSection({ title, description, action, children, className }: HomeSectionProps) {
  return (
    <PanelCard className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </PanelCard>
  )
}
