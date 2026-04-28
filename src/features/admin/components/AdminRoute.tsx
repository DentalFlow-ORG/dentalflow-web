import { Navigate } from '@tanstack/react-router'
import { Suspense, type ReactNode } from 'react'

import { LoadingCard } from '@/components/common/LoadingCard'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/features/auth/hooks/useAuth'

type AdminRouteProps = {
  children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Carregando sessão...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/acessar" search={{ mode: 'login' }} />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/app" />
  }

  return (
    <AppShell>
      <Suspense fallback={<LoadingCard message="Carregando..." />}>
        {children}
      </Suspense>
    </AppShell>
  )
}
