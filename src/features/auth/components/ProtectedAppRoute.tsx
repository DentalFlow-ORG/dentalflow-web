import { Loader2 } from 'lucide-react'
import { Navigate, useRouterState } from '@tanstack/react-router'
import { Suspense, useEffect, useState, type ReactNode } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { SubscriptionOnlyShell } from '@/components/layout/SubscriptionOnlyShell'
import { LoadingCard } from '@/components/common/LoadingCard'
import { getCurrentBillingStatus } from '@/features/billing/services/billing.service'
import {
  getCachedBillingStatus,
  setCachedBillingStatus,
} from '@/features/billing/services/billing-status-cache'
import type { CurrentBillingStatus } from '@/features/billing/types/billing.types'

import { useAuth } from '../hooks/useAuth'
import type { AuthUserRole } from '../types'

type ProtectedAppRouteProps = {
  children: ReactNode
  allowedRoles?: AuthUserRole[]
}

type BillingResult = {
  resolvedPathname: string
  status: CurrentBillingStatus | null
}

const BILLING_REQUIRED_ROLES: AuthUserRole[] = ['OWNER', 'DENTIST', 'ASSISTANT']
const BILLING_ROUTES = ['/app/assinatura', '/app/assinatura/sucesso', '/app/assinatura/cancelar']

export function ProtectedAppRoute({ children, allowedRoles }: ProtectedAppRouteProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isAdmin = user?.role === 'ADMIN'
  const needsBillingCheck =
    !isAdmin && user?.role != null && BILLING_REQUIRED_ROLES.includes(user.role)
  const isBillingRoute = BILLING_ROUTES.some((r) => pathname.startsWith(r))

  // Storing { resolvedPathname, status } lets us derive "checked" without sync setState.
  // billingChecked is true when the result matches the current pathname (or no check needed).
  const [billingResult, setBillingResult] = useState<BillingResult | null>(null)

  // Use the last cached status as an instant fallback so navigating between routes
  // within the TTL does not show the full-page verification spinner.
  // A background fetch always runs; if accessAllowed flips to false the redirect
  // fires on the next render once the fresh result arrives.
  const cachedStatus = needsBillingCheck ? getCachedBillingStatus() : null
  const effectiveResult: BillingResult | null =
    billingResult?.resolvedPathname === pathname
      ? billingResult
      : cachedStatus != null
        ? { resolvedPathname: pathname, status: cachedStatus }
        : null

  const billingChecked = !needsBillingCheck || effectiveResult !== null
  const billingStatus = billingChecked ? (effectiveResult?.status ?? null) : null

  useEffect(() => {
    if (!needsBillingCheck || !isAuthenticated) return
    getCurrentBillingStatus()
      .then((status) => {
        setCachedBillingStatus(status)
        setBillingResult({ resolvedPathname: pathname, status })
      })
      .catch(() => {
        // Fail open on network/server errors — backend enforces billing per-request
        setBillingResult({ resolvedPathname: pathname, status: null })
      })
  }, [pathname, needsBillingCheck, isAuthenticated])

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="text-sm font-medium text-muted-foreground">Carregando DentalFlow...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/acessar" search={{ mode: 'login' }} />
  }

  if (user?.isProfileComplete === false) {
    return <Navigate to="/acessar/completar-perfil" />
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to={getDeniedRedirectPath(user?.role)} />
  }

  // Admins bypass billing entirely
  if (isAdmin) {
    return (
      <AppShell billingStatus={null}>
        <Suspense fallback={<LoadingCard message="Carregando..." />}>{children}</Suspense>
      </AppShell>
    )
  }

  // Billing check in progress — render nothing until we know the access state
  if (!billingChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="text-sm font-medium text-muted-foreground">Verificando assinatura...</span>
      </div>
    )
  }

  // null status means the check failed (network error) — fail open so backend handles enforcement
  const hasAccess = billingStatus?.accessAllowed ?? true

  if (!hasAccess) {
    return (
      <SubscriptionOnlyShell>
        {isBillingRoute ? (
          <Suspense fallback={<LoadingCard message="Carregando..." />}>{children}</Suspense>
        ) : (
          <Navigate to="/app/assinatura" />
        )}
      </SubscriptionOnlyShell>
    )
  }

  return (
    <AppShell billingStatus={billingStatus}>
      <Suspense fallback={<LoadingCard message="Carregando..." />}>{children}</Suspense>
    </AppShell>
  )
}

function getDeniedRedirectPath(role: AuthUserRole | undefined) {
  if (role === 'ADMIN') return '/app/admin'
  if (role === 'DENTIST') return '/app/inicio'
  if (role === 'PATIENT') return '/'
  return '/app'
}
