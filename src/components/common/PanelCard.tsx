import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PanelCardProps = {
  children: ReactNode
  className?: string
}

export function PanelCard({ children, className }: PanelCardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-sm',
        className,
      )}
    >
      {children}
    </section>
  )
}
