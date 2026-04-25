import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type EyebrowProps = {
  children: ReactNode
  icon?: LucideIcon
  className?: string
}

export function Eyebrow({ children, icon: Icon, className }: EyebrowProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm',
        className,
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </div>
  )
}
