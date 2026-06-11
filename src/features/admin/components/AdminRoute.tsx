import { Navigate } from '@tanstack/react-router'
import { type ReactNode, Suspense } from 'react'

import { LoadingCard } from '@/components/common/LoadingCard'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLE_HOME_ROUTES } from '@/features/home/config/role-home-config'

type AdminRouteProps = {
  children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm font-medium text-muted-foreground">
        Carregando sessão...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/acessar" search={{ mode: 'login' }} />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to={ROLE_HOME_ROUTES.OWNER} />
  }

  return (
    <AppShell>
      <Suspense fallback={<LoadingCard message="Carregando..." />}>{children}</Suspense>
    </AppShell>
  )
}
