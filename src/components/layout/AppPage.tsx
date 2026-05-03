import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AppPageProps = {
  children: ReactNode
  spacing?: 'normal' | 'loose'
  className?: string
}

export function AppPage({ children, spacing = 'normal', className }: AppPageProps) {
  return (
    <div className={cn(spacing === 'loose' ? 'space-y-8' : 'space-y-6', className)}>
      {children}
    </div>
  )
}
