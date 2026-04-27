import { Outlet } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { CrashScreen } from '@/components/common/CrashScreen'
import { GlobalAlertsProvider } from '@/components/common/GlobalAlerts'
import { AuthProvider } from '@/features/auth/providers/AuthProvider'

export function RootRoute() {
  return (
    <ErrorBoundary FallbackComponent={CrashScreen}>
      <GlobalAlertsProvider>
        <AuthProvider>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
                Carregando...
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </AuthProvider>
      </GlobalAlertsProvider>
    </ErrorBoundary>
  )
}
