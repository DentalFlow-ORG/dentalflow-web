import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type StatusBadgeTone = 'success' | 'muted' | 'warning'

type StatusBadgeProps = {
  children: ReactNode
  tone?: StatusBadgeTone
  className?: string
}

const toneClassNames: Record<StatusBadgeTone, string> = {
  success: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  muted: 'border-slate-200 bg-slate-100 text-slate-700',
  warning: 'border-amber-200 bg-amber-100 text-amber-800',
}

export function StatusBadge({
  children,
  tone = 'muted',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm',
        toneClassNames[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
