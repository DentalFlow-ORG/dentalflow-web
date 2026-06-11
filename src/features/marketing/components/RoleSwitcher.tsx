import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { roleContents } from '../data/public-content'

type RoleSwitcherProps = {
  currentPath: string
}

// Priority order matches the Produto dropdown: gestores → abertura → dentistas → secretárias
const ROLE_KEYS = ['gestores', 'clinicas-em-abertura', 'dentistas', 'secretaria'] as const

const CARD_CLASS =
  'group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'

function RoleLink({ path, children }: { path: string; children: React.ReactNode }) {
  if (path === '/para-gestores')
    return (
      <Link to="/para-gestores" className={CARD_CLASS}>
        {children}
      </Link>
    )
  if (path === '/para-clinicas-em-abertura')
    return (
      <Link to="/para-clinicas-em-abertura" className={CARD_CLASS}>
        {children}
      </Link>
    )
  if (path === '/para-dentistas')
    return (
      <Link to="/para-dentistas" className={CARD_CLASS}>
        {children}
      </Link>
    )
  return (
    <Link to="/para-secretarias" className={CARD_CLASS}>
      {children}
    </Link>
  )
}

export function RoleSwitcher({ currentPath }: RoleSwitcherProps) {
  const cards = ROLE_KEYS.map((key) => roleContents[key]).filter(
    (content) => content.path !== currentPath,
  )

  if (cards.length === 0) return null

  return (
    <section
      className="border-t border-slate-100 bg-white py-12"
      aria-labelledby="role-switcher-heading"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Outros perfis
        </p>
        <h2 id="role-switcher-heading" className="mt-1 text-lg font-semibold text-slate-800">
          O DentalFlow também serve para
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {cards.map((content) => {
            const Icon = content.icon
            return (
              <RoleLink key={content.path} path={content.path}>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{content.role}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                      {content.tagline}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                  Ver página
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </RoleLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
