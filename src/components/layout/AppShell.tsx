import { useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { BarChart3, Building2, CalendarCheck, CalendarDays, ClipboardList, CreditCard, FileText, Landmark, LogOut, Monitor, Moon, MoreHorizontal, Package, ShieldCheck, Sun, Users, Users2, X, Zap } from 'lucide-react'
import { type ReactNode } from 'react'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { AuthUserRole } from '@/features/auth/types'
import { getUserDisplayName } from '@/features/auth/utils/name'
import type { CurrentBillingStatus } from '@/features/billing/types/billing.types'
import { useTheme, type ThemeMode } from '@/features/theme/ThemeProvider'
import { cn } from '@/lib/utils'

type AppShellProps = {
  children: ReactNode
  billingStatus?: CurrentBillingStatus | null
}

type NavItem = {
  label: string
  to: string
  icon: React.ElementType
  roles?: AuthUserRole[]
}

const appNavigation: NavItem[] = [
  {
    label: 'Visão geral',
    to: '/app',
    icon: BarChart3,
    roles: ['OWNER', 'ASSISTANT'],
  },
  {
    label: 'Agendamentos',
    to: '/app/agendamentos',
    icon: CalendarCheck,
    roles: ['OWNER', 'ASSISTANT'],
  },
  {
    label: 'Minha agenda',
    to: '/app/agenda',
    icon: CalendarDays,
    roles: ['DENTIST'],
  },
  {
    label: 'Pacientes',
    to: '/app/pacientes',
    icon: Users2,
    roles: ['OWNER', 'ASSISTANT'],
  },
  {
    label: 'Prontuário',
    to: '/app/prontuario',
    icon: ClipboardList,
    roles: ['OWNER', 'DENTIST'],
  },
  {
    label: 'Equipe',
    to: '/app/equipe',
    icon: Users,
    roles: ['OWNER'],
  },
  {
    label: 'Estoque',
    to: '/app/estoque',
    icon: Package,
    roles: ['OWNER', 'ASSISTANT'],
  },
  {
    label: 'Financeiro',
    to: '/app/financeiro',
    icon: Landmark,
    roles: ['OWNER'],
  },
  {
    label: 'Notas fiscais',
    to: '/app/notas-fiscais',
    icon: FileText,
    roles: ['OWNER', 'ASSISTANT'],
  },
  {
    label: 'Assinatura',
    to: '/app/assinatura',
    icon: CreditCard,
    roles: ['OWNER'],
  },
  {
    label: 'Usuários',
    to: '/app/admin/users',
    icon: ShieldCheck,
    roles: ['ADMIN'],
  },
  {
    label: 'Clínicas',
    to: '/app/admin/clinics',
    icon: Building2,
    roles: ['ADMIN'],
  },
  {
    label: 'Financeiro SaaS',
    to: '/app/admin/financeiro',
    icon: CreditCard,
    roles: ['ADMIN'],
  },
]

// Mobile primary items per role — max 4, rest goes in "Mais"
const MOBILE_PRIMARY_ROUTES_BY_ROLE: Partial<Record<AuthUserRole, string[]>> = {
  OWNER: ['/app', '/app/agendamentos', '/app/pacientes', '/app/prontuario'],
  DENTIST: ['/app/agenda', '/app/prontuario'],
  ASSISTANT: ['/app/agendamentos', '/app/pacientes', '/app/estoque', '/app/notas-fiscais'],
  ADMIN: ['/app/admin/users', '/app/admin/clinics', '/app/admin/financeiro'],
}

const THEME_CYCLE: ThemeMode[] = ['system', 'light', 'dark']

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function cycleTheme() {
    const idx = THEME_CYCLE.indexOf(theme)
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length])
  }

  const label =
    theme === 'light' ? 'Tema claro' : theme === 'dark' ? 'Tema escuro' : 'Tema do sistema'
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <Button variant="outline" size="sm" aria-label={label} onClick={cycleTheme}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </Button>
  )
}

export function AppShell({ children, billingStatus }: AppShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    await navigate({ to: '/' })
  }

  const isActive = (to: string) =>
    to === '/app'
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(`${to}/`)

  const visibleNav = appNavigation.filter(
    ({ roles }) => !roles || (user?.role && roles.includes(user.role)),
  )

  // Split into primary (visible in bottom bar) and secondary (in "Mais" sheet)
  const primaryRoutes = user?.role ? (MOBILE_PRIMARY_ROUTES_BY_ROLE[user.role] ?? []) : []
  const primaryNav = visibleNav.filter((item) => primaryRoutes.includes(item.to))
  const secondaryNav = visibleNav.filter((item) => !primaryRoutes.includes(item.to))

  return (
    <div className="min-h-svh bg-slate-50 text-slate-950">
      {/* Sidebar - desktop only */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white lg:block print:hidden">
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <BrandLink />
        </div>

        <nav className="space-y-1 px-3 py-5">
          {visibleNav.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to) ? 'page' : undefined}
              className={cn(
                'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-primary',
                isActive(to) && 'bg-blue-50 text-primary',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Bottom nav - mobile only */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden">
        <div className="flex h-16 items-stretch">
          {primaryNav.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to) ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors',
                isActive(to) ? 'text-primary' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          ))}

          {secondaryNav.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors',
                moreOpen ? 'text-primary' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>Mais</span>
            </button>
          )}
        </div>
      </nav>

      {/* "Mais" sheet — mobile only */}
      {moreOpen && (
        <div className="fixed inset-0 z-30 lg:hidden print:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-slate-200 bg-white pb-[calc(env(safe-area-inset-bottom)+4rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-sm font-semibold text-slate-700">Mais opções</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="grid grid-cols-3 gap-1 px-4 pb-4">
              {secondaryNav.map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  aria-current={isActive(to) ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center text-[11px] font-semibold transition-colors',
                    isActive(to)
                      ? 'bg-blue-50 text-primary'
                      : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="lg:pl-64 print:pl-0">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-xl print:hidden">
          <div className="flex h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <BrandLink />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-950">
                  {user ? getUserDisplayName(user) : 'Usuário'}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <ThemeToggle />
              <Button variant="outline" size="sm" aria-label="Sair" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline" aria-hidden="true">Sair</span>
              </Button>
            </div>
          </div>
        </header>

        {billingStatus?.status === 'trialing' && billingStatus.trialEndsAt && (
          <div className="print:hidden">
            <TrialBanner trialEndsAt={billingStatus.trialEndsAt} />
          </div>
        )}

        <main className="px-4 py-6 pb-8 sm:px-6 sm:py-8 lg:pb-8 lg:px-8">
          {children}
          <div className="h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden print:hidden" aria-hidden="true" />
        </main>
      </div>
    </div>
  )
}

function TrialBanner({ trialEndsAt }: { trialEndsAt: string }) {
  // Computed once on mount — days remaining doesn't need live updates
  const [daysRemaining] = useState(() => {
    const diff = new Date(trialEndsAt).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86_400_000))
  })

  return (
    <div className="border-b border-orange-200 bg-orange-50 px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
          <Zap className="h-4 w-4 shrink-0 text-orange-500" aria-hidden="true" />
          <span>
            Teste grátis ativo
            {daysRemaining > 0
              ? ` · ${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
              : ' · expira hoje'}
          </span>
        </div>
        <Link
          to="/app/assinatura"
          className="text-xs font-semibold text-orange-700 underline underline-offset-2 hover:text-orange-900"
        >
          Assinar agora e manter o acesso
        </Link>
      </div>
    </div>
  )
}
