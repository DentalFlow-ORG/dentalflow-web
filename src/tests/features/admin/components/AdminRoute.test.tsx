import type { ReactNode } from 'react'
import { renderWithProviders, screen } from '@/test/render-utils'
import { AdminRoute } from '@/features/admin/components/AdminRoute'
import { makeOwnerUser, makeAdminUser } from '@/test/factories/user.factory'
import { setMockAuthState, resetAuthMocks } from '@/test/mocks/auth'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test/mocks/auth')
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
