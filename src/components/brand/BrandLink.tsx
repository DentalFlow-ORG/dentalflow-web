import { Link } from '@tanstack/react-router'
import type { MouseEvent } from 'react'

import { companyInfo } from '@/config/company'
import { cn } from '@/lib/utils'

type BrandLinkProps = {
  compact?: boolean
  className?: string
}

export function BrandLink({ compact = false, className }: BrandLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname !== '/') {
      return
    }

    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Link
      to="/"
      className={cn('flex min-w-0 items-center gap-3', className)}
      onClick={handleClick}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-blue-100 bg-white shadow-sm">
        <img
          src="/logo-without-bg.png"
          alt={companyInfo.tradeName}
          className="h-8 w-8 object-contain"
        />
      </div>
      <div className="text-left">
        <span className="block text-lg font-semibold text-slate-950">
          {companyInfo.tradeName}
        </span>
        {!compact && (
          <span className="hidden text-sm text-slate-500 sm:block">
            Growth platform for clinics
          </span>
        )}
      </div>
    </Link>
  )
}
