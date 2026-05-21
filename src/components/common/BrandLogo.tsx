import { useRouterState } from '@tanstack/react-router'

import { companyInfo } from '@/config/company'
import { useTheme } from '@/features/theme/useTheme'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  /** Force the dark-background variant regardless of theme/route */
  forceDark?: boolean
}

/**
 * Renders the DentalFlow logo mark, choosing the correct asset for the current
 * effective theme:
 *   - Light logo on public pages (always light) and in light app mode
 *   - Dark-mode logo only when inside /app with dark theme active, or when
 *     forceDark is explicitly set (e.g. header over a dark hero section)
 *
 * Never duplicates the asset path decision — all logo consumers should use
 * this component instead of hardcoded img src strings.
 */
export function BrandLogo({ className, forceDark }: BrandLogoProps) {
  const ctx = useTheme()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isDark = forceDark ?? (pathname.startsWith('/app') && ctx?.theme === 'dark')

  return (
    <img
      src={isDark ? '/logo-dark-mode-without-bg.png' : '/logo-without-bg.png'}
      alt={companyInfo.tradeName}
      className={cn('shrink-0 object-contain', className)}
    />
  )
}
