import { Outlet } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { CrashScreen } from '@/components/common/CrashScreen'
import { FullPageSpinner } from '@/components/common/FullPageSpinner'
import { GlobalAlertsProvider } from '@/components/common/GlobalAlerts'
import { AuthProvider } from '@/features/auth/providers/AuthProvider'
import { CookieConsentProvider } from '@/features/privacy/components/CookieConsentProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'

export function RootRoute() {
  return (
    <ErrorBoundary FallbackComponent={CrashScreen}>
      <ThemeProvider>
        <GlobalAlertsProvider>
          <CookieConsentProvider>
            <AuthProvider>
              <Suspense fallback={<FullPageSpinner message="Carregando DentalFlow..." />}>
                <Outlet />
              </Suspense>
            </AuthProvider>
          </CookieConsentProvider>
        </GlobalAlertsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
