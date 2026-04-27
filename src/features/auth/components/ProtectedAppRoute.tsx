import { Navigate } from '@tanstack/react-router'
import { Suspense, type ReactNode } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { LoadingCard } from '@/components/common/LoadingCard'

import { useAuth } from '../hooks/useAuth'

type ProtectedAppRouteProps = {
  children: ReactNode
}

export function ProtectedAppRoute({ children }: ProtectedAppRouteProps) {
  const { isAuthenticated, isBootstrapping } = useAuth()

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

  return (
    <AppShell>
      <Suspense fallback={<LoadingCard message="Carregando..." />}>
        {children}
      </Suspense>
    </AppShell>
  )
}
