import type { ReactNode } from 'react'
import { renderWithProviders, screen } from '@/test/render-utils'
import { AdminRoute } from '@/features/admin/components/AdminRoute'
import type { AuthUser } from '@/features/auth/types'
import { makeOwnerUser, makeAdminUser } from '@/test/factories/user.factory'

// Mutable state read by mock factories — prefix "mock" enables Vitest hoisting
let mockIsBootstrapping = false
let mockIsAuthenticated = true
let mockUser: AuthUser | null = null

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
    mockIsBootstrapping = false
    mockIsAuthenticated = true
    mockUser = adminUser
  })

  it('shows a loading message while auth is bootstrapping', () => {
    mockIsBootstrapping = true
    renderWithProviders(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>,
    )
    expect(screen.getByText('Carregando sessão...')).toBeInTheDocument()
    expect(screen.queryByTestId('app-shell')).not.toBeInTheDocument()
  })

  it('redirects to /acessar when the user is not authenticated', () => {
    mockIsAuthenticated = false
    mockUser = null
    renderWithProviders(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>,
    )
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/acessar')
  })

  it('redirects a non-ADMIN user to /app', () => {
    mockUser = ownerUser
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
