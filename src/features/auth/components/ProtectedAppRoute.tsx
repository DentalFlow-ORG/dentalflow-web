import { Navigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Suspense, type ReactNode } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { LoadingCard } from '@/components/common/LoadingCard'

import { useAuth } from '../hooks/useAuth'
import type { AuthUserRole } from '../types'

type ProtectedAppRouteProps = {
  children: ReactNode
  allowedRoles?: AuthUserRole[]
}

export function ProtectedAppRoute({ children, allowedRoles }: ProtectedAppRouteProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="text-sm font-medium text-slate-500">Carregando DentalFlow...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/acessar" search={{ mode: 'login' }} />
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to={getDeniedRedirectPath(user?.role)} />
  }

  return (
    <AppShell>
      <Suspense fallback={<LoadingCard message="Carregando..." />}>
        {children}
      </Suspense>
    </AppShell>
  )
}

function getDeniedRedirectPath(role: AuthUserRole | undefined) {
  if (role === 'ADMIN') return '/app/admin/users'
  if (role === 'DENTIST') return '/app/agenda'
  if (role === 'PATIENT') return '/'

  return '/app'
}
