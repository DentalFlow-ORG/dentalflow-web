import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { router } from '@/app/router'
import type { AuthUserRole } from '@/features/auth/types'
import { makeAccessGrantedBillingStatus } from '@/test-utils/factories/billing.factory'
import { makeOwnerUser } from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { renderWithProviders, screen, waitFor } from '@/test-utils/render-utils'

vi.mock('@/app/RootRoute', async () => {
  const { Outlet } = await import('@tanstack/react-router')
  return { RootRoute: Outlet }
})

// Keep the real route tree and guards; replace feature pages at their lazy boundary.
vi.mock('@/app/route-components', async (importOriginal) => {
  const pages = await importOriginal<Record<string, unknown>>()
  return Object.fromEntries(Object.keys(pages).map((name) => [name, () => <h1>{name}</h1>]))
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const auth = await import('@/test-utils/mocks/auth')
  return auth.createUseAuthMock()
})

vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))

vi.mock('@/features/billing/services/billing-status-cache', () => ({
  getCachedBillingStatus: () => makeAccessGrantedBillingStatus(),
  setCachedBillingStatus: vi.fn(),
}))

const roles: AuthUserRole[] = ['ADMIN', 'OWNER', 'DENTIST', 'ASSISTANT']
const routes: { path: string; page: string; allowed: AuthUserRole[] }[] = [
  { path: '/app', page: 'DashboardPage', allowed: ['OWNER', 'ASSISTANT'] },
  { path: '/app/inicio', page: 'DentistHomePage', allowed: ['DENTIST'] },
  { path: '/app/agendamentos', page: 'AppointmentsPage', allowed: ['OWNER', 'ASSISTANT'] },
  { path: '/app/agenda', page: 'SchedulePage', allowed: ['DENTIST'] },
  { path: '/app/equipe', page: 'TeamPage', allowed: ['OWNER'] },
  { path: '/app/financeiro', page: 'FinancePage', allowed: ['OWNER'] },
  { path: '/app/notas-fiscais', page: 'FiscalInvoicesPage', allowed: ['OWNER', 'ASSISTANT'] },
  { path: '/app/pacientes', page: 'PatientsPage', allowed: ['OWNER', 'ASSISTANT'] },
  {
    path: '/app/pacientes/atencao',
    page: 'PatientsAttentionPage',
    allowed: ['OWNER', 'ASSISTANT'],
  },
  { path: '/app/assinatura', page: 'SubscriptionPage', allowed: ['OWNER', 'DENTIST', 'ASSISTANT'] },
  { path: '/app/assinatura/sucesso', page: 'SubscriptionSuccessPage', allowed: ['OWNER'] },
  { path: '/app/assinatura/cancelar', page: 'SubscriptionCancelPage', allowed: ['OWNER'] },
  { path: '/app/prontuario', page: 'ClinicalRecordsPage', allowed: ['OWNER', 'DENTIST'] },
  {
    path: '/app/prontuario/record-1',
    page: 'ClinicalRecordEditorPage',
    allowed: ['OWNER', 'DENTIST'],
  },
  {
    path: '/app/prontuario/record-1/imprimir',
    page: 'ClinicalRecordPrintPage',
    allowed: ['OWNER', 'DENTIST'],
  },
  { path: '/app/estoque', page: 'InventoryPage', allowed: ['OWNER', 'ASSISTANT'] },
  { path: '/app/configuracoes', page: 'SettingsPage', allowed: ['OWNER'] },
  {
    path: '/app/configuracoes/notificacoes',
    page: 'NotificationSettingsPage',
    allowed: ['OWNER', 'ASSISTANT'],
  },
  { path: '/app/configuracoes/fiscal', page: 'FiscalProfilePage', allowed: ['OWNER'] },
  { path: '/app/relatorios', page: 'ReportsPage', allowed: ['OWNER', 'ASSISTANT'] },
  { path: '/app/admin', page: 'AdminDashboardPage', allowed: ['ADMIN'] },
  { path: '/app/admin/users', page: 'AdminUsersPage', allowed: ['ADMIN'] },
  { path: '/app/admin/clinics', page: 'AdminClinicsPage', allowed: ['ADMIN'] },
  { path: '/app/admin/financeiro', page: 'AdminFinancePage', allowed: ['ADMIN'] },
  { path: '/app/admin/compliance', page: 'CompliancePage', allowed: ['ADMIN'] },
]

async function openRoute(path: string) {
  const instance = createRouter({
    routeTree: router.routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultPendingMinMs: 0,
  })
  await instance.load()
  renderWithProviders(<RouterProvider router={instance} />)
  return instance
}

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  resetAuthMocks()
  setMockAuthState({ isAuthenticated: true, isBootstrapping: false, user: makeOwnerUser() })
})

afterEach(() => vi.restoreAllMocks())

describe.each(roles)('registered route authorization for %s', (role) => {
  it.each(routes)('$path enforces its allowed roles', async ({ path, page, allowed }) => {
    setMockAuthState({ user: makeOwnerUser({ role }) })
    const instance = await openRoute(path)
    if (allowed.includes(role)) {
      expect(await screen.findByRole('heading', { name: page })).toBeInTheDocument()
      expect(instance.state.location.pathname).toBe(path)
    } else {
      const destination = path.startsWith('/app/admin')
        ? role === 'DENTIST'
          ? '/app/inicio'
          : '/app'
        : role === 'ADMIN'
          ? '/app/admin'
          : role === 'DENTIST'
            ? '/app/inicio'
            : '/app'
      await waitFor(() => expect(instance.state.location.pathname).toBe(destination))
      expect(screen.queryByRole('heading', { name: page })).not.toBeInTheDocument()
    }
  })
})

describe('route search and redirects', () => {
  it.each(['connected', 'error', 'invalid'])(
    'validates the dentist calendar callback: %s',
    async (value) => {
      setMockAuthState({ user: makeOwnerUser({ role: 'DENTIST' }) })
      const instance = await openRoute(`/app/agenda?googleCalendar=${value}&message=calendar`)
      expect(instance.state.matches.at(-1)?.search).toMatchObject({
        googleCalendar: value === 'invalid' ? undefined : value,
        message: 'calendar',
      })
    },
  )
  it.each([
    ['/acessar?mode=register&googleAuth=cancelled', { mode: 'register', googleAuth: 'cancelled' }],
    ['/acessar?mode=invalid&googleAuth=invalid', { mode: 'login', googleAuth: undefined }],
    ['/acessar?googleAuth=disabled', { mode: 'login', googleAuth: 'disabled' }],
    ['/acessar?googleAuth=error', { mode: 'login', googleAuth: 'error' }],
    ['/recuperar-senha/redefinir?token=abc', { token: 'abc' }],
    ['/recuperar-senha/redefinir?token=42', { token: undefined }],
    ['/app/assinatura/sucesso?session_id=checkout', { session_id: 'checkout' }],
    ['/app/assinatura/sucesso?session_id=42', { session_id: undefined }],
    [
      '/app/agendamentos?googleCalendar=connected&message=ok',
      { googleCalendar: 'connected', message: 'ok' },
    ],
    [
      '/app/agendamentos?googleCalendar=error&message=42',
      { googleCalendar: 'error', message: undefined },
    ],
    ['/app/agendamentos?googleCalendar=invalid', { googleCalendar: undefined, message: undefined }],
  ] as const)('validates search parameters for %s', async (path, expected) => {
    const instance = await openRoute(path)
    expect(instance.state.matches.at(-1)?.search).toMatchObject(expected)
  })

  it('keeps old leads bookmarks pointing at the patient attention queue', async () => {
    const instance = await openRoute('/app/leads')
    expect(
      await screen.findByRole('heading', { name: 'PatientsAttentionPage' }),
    ).toBeInTheDocument()
    expect(instance.state.location.pathname).toBe('/app/pacientes/atencao')
  })

  it('requires login before rendering a protected page', async () => {
    setMockAuthState({ user: null, isAuthenticated: false })
    const instance = await openRoute('/app/financeiro')
    expect(await screen.findByRole('heading', { name: 'AuthRoutePage' })).toBeInTheDocument()
    expect(instance.state.location.pathname).toBe('/acessar')
    expect(instance.state.location.search).toMatchObject({ mode: 'login' })
    expect(screen.queryByRole('heading', { name: 'FinancePage' })).not.toBeInTheDocument()
  })
})
