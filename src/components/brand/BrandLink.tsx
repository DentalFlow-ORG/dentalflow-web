import { Link } from '@tanstack/react-router'
import type { MouseEvent } from 'react'

import { BrandLogo } from '@/components/common/BrandLogo'
import { companyInfo } from '@/config/company'
import { cn } from '@/lib/utils'

type BrandLinkProps = {
  compact?: boolean
  className?: string
  to?: string
  /** Use white text + dark-background logo (e.g. header over dark hero) */
  darkMode?: boolean
}

export function BrandLink({
  compact = false,
  className,
  to = '/',
  darkMode = false,
}: BrandLinkProps) {
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
      <BrandLogo className={compact ? 'h-11 w-11' : 'h-12 w-12'} forceDark={darkMode} />
      <span
        className={cn(
          'w-px shrink-0',
          darkMode ? 'bg-white/20' : 'bg-border',
          compact ? 'h-9' : 'h-10',
        )}
        aria-hidden="true"
      />
      <div className="text-left">
        <span
          className={cn('block text-lg font-semibold', darkMode ? 'text-white' : 'text-foreground')}
        >
          {companyInfo.tradeName}
        </span>
        {!compact && (
          <span
            className={cn(
              'hidden text-sm sm:block',
              darkMode ? 'text-white/60' : 'text-muted-foreground',
            )}
          >
            Gestão para clínicas odontológicas
          </span>
        )}
      </div>
    </Link>
  )
}
