import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type InlineFeedbackTone = 'error' | 'warning' | 'info' | 'success'

type InlineFeedbackProps = {
  children: ReactNode
  tone?: InlineFeedbackTone
  className?: string
}

const toneClassNames: Record<InlineFeedbackTone, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-primary',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export function InlineFeedback({
  children,
  tone = 'error',
  className,
}: InlineFeedbackProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 text-sm leading-6',
        toneClassNames[tone],
        className,
      )}
    >
      {children}
    </div>
  )
}
