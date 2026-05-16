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
}

export function AuthPage({ mode }: AuthPageProps) {
  useForceLightTheme()
  const { isBannerVisible } = useCookieConsent()
  return (
    <section className={cn(
      'min-h-screen bg-slate-50 px-6 pt-28 lg:px-8',
      isBannerVisible ? 'pb-56 sm:pb-20' : 'pb-20',
    )}>
      <AuthHeader />

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <AuthInfoPanel />

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/10 sm:p-8">
          <AuthModeTabs mode={mode} />
          <AuthForm mode={mode} />
        </div>
      </div>
    </section>
  )
}
