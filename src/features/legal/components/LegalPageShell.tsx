import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { BrandLink } from '@/components/brand/BrandLink'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

type LegalPageShellProps = {
  children: ReactNode
}

export function LegalPageShell({ children }: LegalPageShellProps) {
  useForceLightTheme()
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_60%,#f1f5f9_100%)] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-6 px-6 lg:px-8">
          <BrandLink />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-14 lg:px-8">{children}</main>

      <SiteFooter />
    </div>
  )
}
