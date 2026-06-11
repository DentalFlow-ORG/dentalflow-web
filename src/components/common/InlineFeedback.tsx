import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type InlineFeedbackTone = 'error' | 'warning' | 'info' | 'success'

type InlineFeedbackProps = {
  children: ReactNode
  tone?: InlineFeedbackTone
  className?: string
}

const toneClassNames: Record<InlineFeedbackTone, string> = {
  error:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300',
  info: 'border-blue-200 bg-blue-50 text-primary dark:border-blue-800/50 dark:bg-blue-950/30',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300',
}

export function InlineFeedback({ children, tone = 'error', className }: InlineFeedbackProps) {
  return (
    <div className={cn('rounded-lg border p-4 text-sm leading-6', toneClassNames[tone], className)}>
      {children}
    </div>
  )
}
