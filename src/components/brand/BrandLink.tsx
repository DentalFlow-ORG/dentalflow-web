import { Link } from '@tanstack/react-router'
import type { MouseEvent } from 'react'

import { companyInfo } from '@/config/company'
import { cn } from '@/lib/utils'

type BrandLinkProps = {
  compact?: boolean
  className?: string
  to?: string
}

export function BrandLink({ compact = false, className, to = '/' }: BrandLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (to !== '/' || window.location.pathname !== '/') {
      return
    }

    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Link
      to={to}
      className={cn('flex min-w-0 items-center gap-3', className)}
      onClick={handleClick}
    >
      <img
        src="/logo-without-bg.png"
        alt={companyInfo.tradeName}
        className={cn(
          'shrink-0 object-contain',
          compact ? 'h-11 w-11' : 'h-12 w-12',
        )}
      />
      <span
        className={cn(
          'w-px shrink-0 bg-border',
          compact ? 'h-9' : 'h-10',
        )}
        aria-hidden="true"
      />
      <div className="text-left">
        <span className="block text-lg font-semibold text-foreground">
          {companyInfo.tradeName}
        </span>
        {!compact && (
          <span className="hidden text-sm text-muted-foreground sm:block">
            Growth platform for clinics
          </span>
        )}
      </div>
    </Link>
  )
}
