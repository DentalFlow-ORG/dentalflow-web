import { Outlet } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
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
              <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50" role="status">
                <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-500">Carregando DentalFlow...</span>
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
