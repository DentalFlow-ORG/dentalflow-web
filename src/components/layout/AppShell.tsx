import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { BarChart3, BriefcaseBusiness, CalendarCheck, CalendarDays, LogOut, ShieldCheck, Users } from 'lucide-react'
import { type ReactNode } from 'react'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { AuthUserRole } from '@/features/auth/types'
import { getUserDisplayName } from '@/features/auth/utils/name'
import { cn } from '@/lib/utils'

type AppShellProps = {
  children: ReactNode
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
    label: 'Perfis',
    to: '/app/perfis',
    icon: BriefcaseBusiness,
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
    label: 'Equipe',
    to: '/app/equipe',
    icon: Users,
    roles: ['OWNER'],
  },
  {
    label: 'Usuários',
    to: '/app/admin/users',
    icon: ShieldCheck,
    roles: ['ADMIN'],
  },
]

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    await navigate({ to: '/' })
  }

  const isActive = (to: string) =>
    to === '/app'
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(`${to}/`)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* Sidebar - desktop only */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <BrandLink />
        </div>

        <nav className="space-y-1 px-3 py-5">
          {appNavigation
            .filter(({ roles }) => !roles || (user?.role && roles.includes(user.role)))
            .map(({ label, to, icon: Icon }) => (
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
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white lg:hidden">
        <div className="flex h-16 items-stretch">
          {appNavigation
            .filter(({ roles }) => !roles || (user?.role && roles.includes(user.role)))
            .map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to) ? 'page' : undefined}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors',
                  isActive(to)
                    ? 'text-primary'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
        </div>
      </nav>

      {/* Main area */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between gap-4 px-6 lg:px-8">
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
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </header>

        {/* pb-20 on mobile leaves room above the bottom nav */}
        <main className="px-6 py-8 pb-24 lg:pb-8 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
