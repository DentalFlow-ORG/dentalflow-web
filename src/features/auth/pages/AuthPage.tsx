import { AuthForm } from '../components/AuthForm'
import { AuthHeader } from '../components/AuthHeader'
import { AuthInfoPanel } from '../components/AuthInfoPanel'
import { AuthModeTabs } from '../components/AuthModeTabs'
import type { AuthMode } from '../types'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'
import { useCookieConsent } from '@/features/privacy/components/CookieConsentContext'
import { cn } from '@/lib/utils'

type AuthPageProps = {
  mode: AuthMode
  googleAuthStatus?: 'disabled' | 'error' | 'cancelled'
}

export function AuthPage({ mode, googleAuthStatus }: AuthPageProps) {
  useForceLightTheme()
  const { isBannerVisible } = useCookieConsent()
  return (
    <section className={cn(
      'relative min-h-screen overflow-x-hidden bg-slate-50 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8',
      isBannerVisible ? 'pb-64 sm:pb-28' : 'pb-10 sm:pb-16',
    )}>
      {/* Subtle ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      <AuthHeader />

      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.95fr_0.86fr] lg:items-stretch">
        <AuthInfoPanel />

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10 sm:p-7 lg:p-8">
          <AuthModeTabs mode={mode} />
          <AuthForm mode={mode} googleAuthStatus={googleAuthStatus} />
        </div>
      </div>
    </section>
  )
}
