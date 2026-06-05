import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type HomeActionGridColumns = 2 | 3 | 4

type HomeActionGridProps = {
  children: ReactNode
  /**
   * Maximum number of columns on large viewports.
   * Defaults to 4. Always collapses to 1 column on mobile.
   */
  columns?: HomeActionGridColumns
  className?: string
}

const COLS_CLASS: Record<HomeActionGridColumns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * Responsive grid wrapper for `HomeQuickActionCard` items.
 *
 * Stacks to a single column on mobile and expands to 2–4 columns on larger
 * viewports. Always use this wrapper instead of repeating the grid classes
 * inline to keep action grids visually consistent across dashboards.
 */
export function HomeActionGrid({
  children,
  columns = 4,
  className,
}: HomeActionGridProps) {
  return (
    <div className={cn('grid gap-3', COLS_CLASS[columns], className)}>
      {children}
    </div>
  )
}
