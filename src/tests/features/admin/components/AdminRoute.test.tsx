import { AdminRoute } from '@/features/admin/components/AdminRoute'
import { makeAdminUser, makeOwnerUser } from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { renderWithProviders, screen } from '@/test-utils/render-utils'
import type { ReactNode } from 'react'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}))

vi.mock('@/components/common/LoadingCard', () => ({
  LoadingCard: () => null,
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

const adminUser = makeAdminUser()
const ownerUser = makeOwnerUser()

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAuthMocks()
    setMockAuthState({ isBootstrapping: false, isAuthenticated: true, user: adminUser })
  })

  it('shows a loading message while auth is bootstrapping', () => {
    setMockAuthState({ isBootstrapping: true })
    renderWithProviders(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>,
    )
    expect(screen.getByText('Carregando sessão...')).toBeInTheDocument()
    expect(screen.queryByTestId('app-shell')).not.toBeInTheDocument()
  })

  it('redirects to /acessar when the user is not authenticated', () => {
    setMockAuthState({ isAuthenticated: false, user: null })
    renderWithProviders(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>,
    )
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/acessar')
  })

  it('redirects a non-ADMIN user to /app', () => {
    setMockAuthState({ user: ownerUser })
    renderWithProviders(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>,
    )
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/app')
  })

  it('renders AppShell with children for an ADMIN user', () => {
    renderWithProviders(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>,
    )
    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })
})
