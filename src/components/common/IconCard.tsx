import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type IconCardProps = {
  icon: LucideIcon
  title: string
  description?: string
  children?: ReactNode
  iconClassName?: string
  className?: string
}

export function IconCard({
  icon: Icon,
  title,
  description,
  children,
  iconClassName,
  className,
}: IconCardProps) {
  return (
    <article
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-6 shadow-sm',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-primary',
          iconClassName,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </article>
  )
}
