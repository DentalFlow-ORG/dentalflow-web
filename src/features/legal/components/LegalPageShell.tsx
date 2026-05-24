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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg focus:ring-2 focus:ring-primary/50"
      >
        Ir ao conteúdo principal
      </a>
      <header aria-label="Cabeçalho" className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-6 px-6 lg:px-8">
          <BrandLink />
          <Link
            to="/"
            className="group flex items-center gap-1.5 rounded-sm text-sm font-medium text-slate-500 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Voltar ao início
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-4xl px-6 py-14 lg:px-8 lg:py-20">{children}</main>

      <SiteFooter />
    </div>
  )
}
