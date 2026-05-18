import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Collapsible } from 'radix-ui'
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileDown,
  FileText,
  Home,
  Landmark,
  LogOut,
  Moon,
  MoreHorizontal,
  Settings,
  Package,
  ShieldCheck,
  Sun,
  TrendingUp,
  Users,
  Users2,
  X,
  Zap,
} from 'lucide-react'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { AuthUserRole } from '@/features/auth/types'
import { getUserDisplayName } from '@/features/auth/utils/name'
import type { CurrentBillingStatus } from '@/features/billing/types/billing.types'
import { useTheme } from '@/features/theme/useTheme'
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
  exact?: boolean
}

type NavGroup = {
  label: string
  roles: AuthUserRole[]
  items: NavItem[]
}

// ─── Flat items (always visible at top, ungrouped) ────────────────────────────
const TOP_ITEMS: NavItem[] = [
  { label: 'Início', to: '/app/admin', icon: Home, roles: ['ADMIN'], exact: true },
  { label: 'Início', to: '/app', icon: BarChart3, roles: ['OWNER', 'ASSISTANT'], exact: true },
  { label: 'Início', to: '/app/inicio', icon: Home, roles: ['DENTIST'], exact: true },
  { label: 'Minha agenda', to: '/app/agenda', icon: CalendarDays, roles: ['DENTIST'] },
  { label: 'Prontuários', to: '/app/prontuario', icon: ClipboardList, roles: ['DENTIST'] },
]

// ─── Grouped items (collapsible sections per role) ────────────────────────────
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Clínica',
    roles: ['OWNER', 'ASSISTANT'],
    items: [
      { label: 'Agenda', to: '/app/agendamentos', icon: CalendarDays, roles: ['OWNER', 'ASSISTANT'] },
      { label: 'Pacientes', to: '/app/pacientes', icon: Users2, roles: ['OWNER', 'ASSISTANT'] },
      { label: 'Prontuários', to: '/app/prontuario', icon: ClipboardList, roles: ['OWNER'] },
      { label: 'Leads', to: '/app/leads', icon: TrendingUp, roles: ['OWNER', 'ASSISTANT'] },
    ],
  },
  {
    label: 'Gestão',
    roles: ['OWNER', 'ASSISTANT'],
    items: [
      { label: 'Equipe', to: '/app/equipe', icon: Users, roles: ['OWNER'] },
      { label: 'Estoque', to: '/app/estoque', icon: Package, roles: ['OWNER', 'ASSISTANT'] },
      { label: 'Financeiro', to: '/app/financeiro', icon: Landmark, roles: ['OWNER'] },
      { label: 'Notas fiscais', to: '/app/notas-fiscais', icon: FileText, roles: ['OWNER', 'ASSISTANT'] },
      { label: 'Relatórios', to: '/app/relatorios', icon: FileDown, roles: ['OWNER', 'ASSISTANT'] },
    ],
  },
  {
    label: 'Administração',
    roles: ['ADMIN'],
    items: [
      { label: 'Usuários', to: '/app/admin/users', icon: ShieldCheck, roles: ['ADMIN'] },
      { label: 'Clínicas', to: '/app/admin/clinics', icon: Building2, roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Plataforma',
    roles: ['ADMIN'],
    items: [
      { label: 'Financeiro SaaS', to: '/app/admin/financeiro', icon: CreditCard, roles: ['ADMIN'] },
      { label: 'Compliance', to: '/app/admin/compliance', icon: ShieldCheck, roles: ['ADMIN'] },
    ],
  },
]

// ─── Footer items (pinned to bottom of desktop sidebar) ──────────────────────
const FOOTER_ITEMS: NavItem[] = [
  { label: 'Configurações', to: '/app/configuracoes', icon: Settings, roles: ['OWNER'] },
]

// ─── Legacy flat list (used for mobile nav primary/secondary split) ───────────
const appNavigation: NavItem[] = [
  ...TOP_ITEMS,
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...FOOTER_ITEMS,
]

const MOBILE_PRIMARY_ROUTES_BY_ROLE: Partial<Record<AuthUserRole, string[]>> = {
  OWNER: ['/app', '/app/agendamentos', '/app/pacientes', '/app/prontuario'],
  DENTIST: ['/app/inicio', '/app/agenda', '/app/prontuario'],
  ASSISTANT: ['/app', '/app/agendamentos', '/app/pacientes', '/app/estoque'],
  ADMIN: ['/app/admin', '/app/admin/users', '/app/admin/clinics', '/app/admin/financeiro'],
}

const STORAGE_KEY = 'dentalflow.sidebar.groups'

function loadOpenGroups(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

function saveOpenGroups(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function cycleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const label = theme === 'light' ? 'Tema claro' : 'Tema escuro'
  const Icon = theme === 'light' ? Sun : Moon

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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const saved = loadOpenGroups()
    return saved
  })

  const handleLogout = async () => {
    await logout()
    await navigate({ to: '/' })
  }

  const isActive = (item: NavItem) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => isActive(item))

  function isGroupOpen(groupLabel: string, group: NavGroup): boolean {
    if (groupLabel in openGroups) return openGroups[groupLabel]
    // Default: open if contains active route
    return isGroupActive(group)
  }

  function toggleGroup(groupLabel: string, group: NavGroup) {
    const current = isGroupOpen(groupLabel, group)
    const next = { ...openGroups, [groupLabel]: !current }
    setOpenGroups(next)
    saveOpenGroups(next)
  }

  const visibleTopItems = TOP_ITEMS.filter(
    ({ roles }) => !roles || (user?.role && roles.includes(user.role)),
  )

  const visibleGroups = NAV_GROUPS.filter(
    (group) => user?.role && group.roles.includes(user.role),
  ).map((group) => ({
    ...group,
    items: group.items.filter(
      ({ roles }) => !roles || (user?.role && roles.includes(user.role)),
    ),
  })).filter((group) => group.items.length > 0)

  const visibleFooterItems = FOOTER_ITEMS.filter(
    ({ roles }) => !roles || (user?.role && roles.includes(user.role)),
  )

  const visibleNav = appNavigation.filter(
    ({ roles }) => !roles || (user?.role && roles.includes(user.role)),
  )

  const primaryRoutes = user?.role ? (MOBILE_PRIMARY_ROUTES_BY_ROLE[user.role] ?? []) : []
  const primaryNav = visibleNav.filter((item) => primaryRoutes.includes(item.to))
  const secondaryNav = visibleNav.filter((item) => !primaryRoutes.includes(item.to))

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block print:hidden">
        <div className="flex h-20 items-center border-b border-sidebar-border px-6">
          <BrandLink />
        </div>

        <div className="flex flex-col" style={{ height: 'calc(100% - 5rem)' }}>
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {/* Top-level flat items */}
            <div className="space-y-0.5">
              {visibleTopItems.map((item) => {
                const { label, to, icon: Icon } = item
                const active = isActive(item)
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center gap-3 rounded-md px-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      active && 'bg-sidebar-accent text-sidebar-primary',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Grouped sections */}
            {visibleGroups.map((group) => {
              const open = isGroupOpen(group.label, group)
              const hasActive = isGroupActive(group)
              return (
                <div key={group.label} className="mt-4">
                  <Collapsible.Root
                    open={open}
                    onOpenChange={() => toggleGroup(group.label, group)}
                  >
                    <Collapsible.Trigger
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left transition-colors',
                        'hover:bg-sidebar-accent/60',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                      )}
                      aria-expanded={open}
                    >
                      <span
                        className={cn(
                          'text-[11px] font-semibold uppercase tracking-wider',
                          hasActive
                            ? 'text-sidebar-primary'
                            : 'text-sidebar-foreground/50',
                        )}
                      >
                        {group.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                          hasActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/40',
                          open && 'rotate-180',
                        )}
                        aria-hidden="true"
                      />
                    </Collapsible.Trigger>

                    <Collapsible.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="mt-0.5 space-y-0.5 pl-1">
                        {group.items.map((item) => {
                          const { label, to, icon: Icon } = item
                          const active = isActive(item)
                          return (
                            <Link
                              key={to}
                              to={to}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                active && 'bg-sidebar-accent font-semibold text-sidebar-primary',
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                              {label}
                            </Link>
                          )
                        })}
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </div>
              )
            })}
          </nav>

          {/* Footer: pinned settings item */}
          {visibleFooterItems.length > 0 && (
            <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
              {visibleFooterItems.map((item) => {
                const { label, to, icon: Icon } = item
                const active = isActive(item)
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center gap-3 rounded-md px-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      active && 'bg-sidebar-accent text-sidebar-primary',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ──────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden">
        <div className="flex h-16 items-stretch">
          {primaryNav.map((item) => {
            const { label, to, icon: Icon } = item
            const active = isActive(item)
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            )
          })}

          {secondaryNav.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors',
                moreOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              <span>Mais</span>
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile More Sheet ──────────────────────────────────────────────── */}
      {moreOpen && (
        <div className="fixed inset-0 z-30 lg:hidden print:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card pb-[calc(env(safe-area-inset-bottom)+4rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Mais opções</p>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="grid grid-cols-3 gap-1 px-4 pb-4">
              {secondaryNav.map((item) => {
                const { label, to, icon: Icon } = item
                const active = isActive(item)
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center text-[11px] font-semibold transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="lg:pl-64 print:pl-0">
        <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-xl print:hidden">
          <div className="flex h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <BrandLink />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {user ? getUserDisplayName(user) : 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
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
  const [daysRemaining] = useState(() => {
    const diff = new Date(trialEndsAt).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86_400_000))
  })

  return (
    <div className="border-b border-orange-200 bg-orange-50 px-4 py-2 dark:border-orange-800/30 dark:bg-orange-950/30 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-orange-800 dark:text-orange-200">
          <Zap className="h-4 w-4 shrink-0 text-orange-500 dark:text-orange-400" aria-hidden="true" />
          <span>
            Teste grátis ativo
            {daysRemaining > 0
              ? ` · ${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
              : ' · expira hoje'}
          </span>
        </div>
        <Link
          to="/app/assinatura"
          className="text-xs font-semibold text-orange-700 underline underline-offset-2 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100"
        >
          Assinar agora e manter o acesso
        </Link>
      </div>
    </div>
  )
}
