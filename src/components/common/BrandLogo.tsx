import { useRouterState } from '@tanstack/react-router'

import { companyInfo } from '@/config/company'
import { shouldForceLightTheme } from '@/features/theme/force-light-routes'
import { useTheme } from '@/features/theme/useTheme'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  /** Force the dark-background variant regardless of theme/route. */
  forceDark?: boolean
}

/**
 * Renders the DentalFlow logo mark choosing the correct asset:
 * - Dark logo: when forceDark is explicitly true, OR when inside /app on a
 *   non-force-light route with dark theme active.
 * - Light logo: everywhere else (public pages, forced-light routes, light mode).
 *
 * NOTE: passing forceDark={false} is equivalent to not passing it at all — both
 * fall through to the automatic detection. This prevents the {false ?? x} = false
 * footgun when the prop is bound to a boolean variable that defaults to false.
 */
export function BrandLogo({ className, forceDark }: BrandLogoProps) {
  const ctx = useTheme()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isDark =
    forceDark === true ||
    (pathname.startsWith('/app') && !shouldForceLightTheme(pathname) && ctx.theme === 'dark')

  return (
    <img
      src={isDark ? '/logo-dark-mode-without-bg.png' : '/logo-without-bg.png'}
      alt={companyInfo.tradeName}
      className={cn('shrink-0 object-contain', className)}
    />
  )
}
