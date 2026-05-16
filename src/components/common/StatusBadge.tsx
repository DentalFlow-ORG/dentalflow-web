import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type StatusBadgeTone = 'success' | 'muted' | 'warning'

type StatusBadgeProps = {
  children: ReactNode
  tone?: StatusBadgeTone
  className?: string
}

const toneClassNames: Record<StatusBadgeTone, string> = {
  success: 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300',
  muted: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-400',
  warning: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300',
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
