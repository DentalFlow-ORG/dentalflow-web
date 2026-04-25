import { CheckCircle2 } from 'lucide-react'

import { cn } from '@/lib/utils'

type CheckBadgeProps = {
  children: string
  className?: string
}

export function CheckBadge({ children, className }: CheckBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm',
        className,
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      {children}
    </span>
  )
}
