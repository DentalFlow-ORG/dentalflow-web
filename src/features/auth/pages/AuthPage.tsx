import { AuthForm } from '../components/AuthForm'
import { AuthHeader } from '../components/AuthHeader'
import { AuthInfoPanel } from '../components/AuthInfoPanel'
import { AuthModeTabs } from '../components/AuthModeTabs'
import type { AuthMode } from '../types'

type AuthPageProps = {
  mode: AuthMode
}

export function AuthPage({ mode }: AuthPageProps) {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#eef2ff_100%)] px-6 pb-20 pt-32 lg:px-8">
      <AuthHeader />

      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <AuthInfoPanel />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/10 sm:p-8">
          <AuthModeTabs mode={mode} />
          <AuthForm mode={mode} />
        </div>
      </div>
    </section>
  )
}
