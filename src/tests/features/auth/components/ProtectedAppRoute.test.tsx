import type { ReactNode } from 'react'
import { renderWithProviders, screen, waitFor } from '@/test/render-utils'
import { ProtectedAppRoute } from '@/features/auth/components/ProtectedAppRoute'
import type { AuthUser } from '@/features/auth/types'
import { makeOwnerUser, makeDentistUser, makeAdminUser } from '@/test/factories/user.factory'
import { makeAccessGrantedBillingStatus, makeAccessDeniedBillingStatus } from '@/test/factories/billing.factory'
import { setMockPathname } from '@/test/mocks/router'

// Mutable state read by mock factories — prefix "mock" enables Vitest hoisting
let mockIsBootstrapping = false
let mockIsAuthenticated = true
let mockUser: AuthUser | null = null

const mockGetCachedBillingStatus = vi.fn()
const mockGetCurrentBillingStatus = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated,
    isBootstrapping: mockIsBootstrapping,
    login: vi.fn(),
    register: vi.fn(),
    completeProfile: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('@/features/billing/services/billing.service', () => ({
  getCurrentBillingStatus: () => mockGetCurrentBillingStatus(),
}))

vi.mock('@/features/billing/services/billing-status-cache', () => ({
  getCachedBillingStatus: () => mockGetCachedBillingStatus(),
  setCachedBillingStatus: vi.fn(),
  clearBillingStatusCache: vi.fn(),
}))

vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}))

vi.mock('@/components/layout/SubscriptionOnlyShell', () => ({
  SubscriptionOnlyShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="subscription-shell">{children}</div>
  ),
}))

vi.mock('@/components/common/LoadingCard', () => ({
  LoadingCard: () => null,
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

const ownerUser = makeOwnerUser()
const dentistUser = makeDentistUser()
const adminUser = makeAdminUser()
const accessGranted = makeAccessGrantedBillingStatus()
const accessDenied = makeAccessDeniedBillingStatus()

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProtectedAppRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockPathname('/app')
    mockIsBootstrapping = false
    mockIsAuthenticated = true
    mockUser = ownerUser
    // Default: no cached status, billing check never resolves (keeps spinner visible)
    mockGetCachedBillingStatus.mockReturnValue(null)
    mockGetCurrentBillingStatus.mockReturnValue(new Promise(() => {}))
  })

  it('shows a loading spinner while auth is bootstrapping', () => {
    mockIsBootstrapping = true
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['OWNER']}>
        <div>Protected Content</div>
      </ProtectedAppRoute>,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Carregando DentalFlow...')).toBeInTheDocument()
  })

  it('redirects to /acessar when the user is not authenticated', () => {
    mockIsAuthenticated = false
    mockUser = null
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['OWNER']}>
        <div>Protected Content</div>
      </ProtectedAppRoute>,
    )
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/acessar')
  })

  it('redirects to /acessar/completar-perfil when profile is incomplete', () => {
    mockUser = makeOwnerUser({ isProfileComplete: false })
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['OWNER']}>
        <div>Protected Content</div>
      </ProtectedAppRoute>,
    )
    expect(screen.getByTestId('navigate')).toHaveAttribute(
      'data-to',
      '/acessar/completar-perfil',
    )
  })

  it('redirects an OWNER to /app when the route requires DENTIST role', () => {
    // getDeniedRedirectPath('OWNER') → '/app'
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['DENTIST']}>
        <div>Protected Content</div>
      </ProtectedAppRoute>,
    )
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/app')
  })

  it('redirects a DENTIST to /app/inicio when the route requires OWNER role', () => {
    // getDeniedRedirectPath('DENTIST') → '/app/inicio'
    mockUser = dentistUser
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['OWNER']}>
        <div>Protected Content</div>
      </ProtectedAppRoute>,
    )
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/app/inicio')
  })

  it('renders AppShell for an ADMIN user and skips the billing check entirely', () => {
    mockUser = adminUser
    // No allowedRoles → role check is skipped; isAdmin bypasses billing
    renderWithProviders(
      <ProtectedAppRoute>
        <div>Admin Content</div>
      </ProtectedAppRoute>,
    )
    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
    expect(mockGetCurrentBillingStatus).not.toHaveBeenCalled()
  })

  it('shows a billing verification spinner while the billing check is in progress', () => {
    // Default beforeEach: no cache, billing check never resolves → spinner visible
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['OWNER']}>
        <div>Protected Content</div>
      </ProtectedAppRoute>,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Verificando assinatura...')).toBeInTheDocument()
  })

  it('renders AppShell immediately when a cached billing status grants access', () => {
    mockGetCachedBillingStatus.mockReturnValue(accessGranted)
    mockGetCurrentBillingStatus.mockResolvedValue(accessGranted)
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['OWNER']}>
        <div>Protected Content</div>
      </ProtectedAppRoute>,
    )
    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /app/assinatura when billing access is denied on a non-billing route', async () => {
    setMockPathname('/app/pacientes')
    mockGetCurrentBillingStatus.mockResolvedValue(accessDenied)
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['OWNER', 'ASSISTANT']}>
        <div>Protected Content</div>
      </ProtectedAppRoute>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/app/assinatura'),
    )
  })

  it('renders SubscriptionOnlyShell with children when billing is denied on the subscription route', async () => {
    setMockPathname('/app/assinatura')
    mockGetCurrentBillingStatus.mockResolvedValue(accessDenied)
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['OWNER', 'DENTIST', 'ASSISTANT']}>
        <div>Billing Content</div>
      </ProtectedAppRoute>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('subscription-shell')).toBeInTheDocument(),
    )
    expect(screen.getByText('Billing Content')).toBeInTheDocument()
  })

  it('fails open and renders AppShell when the billing API returns a network error', async () => {
    mockGetCurrentBillingStatus.mockRejectedValue(new Error('Network error'))
    renderWithProviders(
      <ProtectedAppRoute allowedRoles={['OWNER']}>
        <div>Protected Content</div>
      </ProtectedAppRoute>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('app-shell')).toBeInTheDocument(),
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
