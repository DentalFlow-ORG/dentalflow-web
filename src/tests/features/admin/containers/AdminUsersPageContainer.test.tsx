import { render, screen } from '@/test-utils/render-utils'

import {
  ADMIN_ROLE_LABEL,
  ADMIN_ROLE_TONE,
  USER_FILTER_DEFS,
} from '@/features/admin/constants/admin-display'
import { AdminUsersPageContainer } from '@/features/admin/containers/AdminUsersPageContainer'
import type { AdminUser } from '@/features/admin/types/admin.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: vi.fn() }),
}))

const mockUseAdminUsersPage = vi.fn()
vi.mock('@/features/admin/hooks/useAdminUsersPage', () => ({
  useAdminUsersPage: () => mockUseAdminUsersPage(),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: 'user-1',
    clinicId: null,
    clinic: null,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'Test',
    role: 'ADMIN',
    phone: null,
    avatarUrl: null,
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeDefaultHookState(overrides = {}) {
  return {
    users: [],
    allUsers: [],
    isLoading: false,
    loadError: null,
    searchQuery: '',
    setSearchQuery: vi.fn(),
    activeFilters: {},
    setFilter: vi.fn(),
    clearAll: vi.fn(),
    page: 1,
    setPage: vi.fn(),
    totalPages: 1,
    filteredCount: 0,
    pageSize: 10,
    setPageSize: vi.fn(),
    filterDefs: USER_FILTER_DEFS,
    roleLabel: ADMIN_ROLE_LABEL,
    roleTone: ADMIN_ROLE_TONE,
    formatDate: (v: string) => v,
    createOpen: false,
    setCreateOpen: vi.fn(),
    editTarget: null,
    setEditTarget: vi.fn(),
    passwordTarget: null,
    setPasswordTarget: vi.fn(),
    deleteTarget: null,
    setDeleteTarget: vi.fn(),
    isDeleting: false,
    load: vi.fn(),
    handleCreateSuccess: vi.fn(),
    handleEditSuccess: vi.fn(),
    handlePasswordSuccess: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  mockUseAdminUsersPage.mockReturnValue(makeDefaultHookState())
})

afterEach(() => {
  vi.clearAllMocks()
})

// ── Header ────────────────────────────────────────────────────────────────────

describe('AdminUsersPageContainer — header', () => {
  it('renders "Usuários da plataforma" as the page heading', () => {
    render(<AdminUsersPageContainer />)
    expect(screen.getByRole('heading', { name: /usuários da plataforma/i })).toBeInTheDocument()
  })

  it('renders the "Administração" eyebrow label', () => {
    render(<AdminUsersPageContainer />)
    expect(screen.getByText('Administração')).toBeInTheDocument()
  })

  it('renders the "Novo usuário" action button', () => {
    render(<AdminUsersPageContainer />)
    expect(screen.getAllByRole('button', { name: /novo usuário/i }).length).toBeGreaterThanOrEqual(
      1,
    )
  })
})

// ── KPI cards ─────────────────────────────────────────────────────────────────

describe('AdminUsersPageContainer — KPI cards', () => {
  it('renders all four KPI labels', () => {
    render(<AdminUsersPageContainer />)
    expect(screen.getByText('Total usuários')).toBeInTheDocument()
    expect(screen.getByText('Ativos')).toBeInTheDocument()
    expect(screen.getByText('Administradores')).toBeInTheDocument()
    expect(screen.getByText('Proprietários')).toBeInTheDocument()
  })

  it('shows "0" totals when allUsers is empty', () => {
    render(<AdminUsersPageContainer />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(4)
  })

  it('counts total users from allUsers', () => {
    const user = makeAdminUser()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({ allUsers: [user], users: [user], filteredCount: 1 }),
    )
    render(<AdminUsersPageContainer />)
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1)
  })

  it('counts active users from allUsers', () => {
    const active = makeAdminUser({ id: 'a1', isActive: true })
    const inactive = makeAdminUser({ id: 'a2', isActive: false })
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        allUsers: [active, inactive],
        users: [active, inactive],
        filteredCount: 2,
      }),
    )
    render(<AdminUsersPageContainer />)
    // Total=2, Ativos=1, Admins=2, Owners=0 → "1" appears at least once
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1)
  })
})

// ── Section ───────────────────────────────────────────────────────────────────

describe('AdminUsersPageContainer — section', () => {
  it('renders the "Usuários cadastrados" section heading', () => {
    render(<AdminUsersPageContainer />)
    expect(screen.getByRole('heading', { name: /usuários cadastrados/i })).toBeInTheDocument()
  })
})

// ── Empty state ───────────────────────────────────────────────────────────────

describe('AdminUsersPageContainer — empty state', () => {
  it('renders "Nenhum usuário encontrado" when allUsers is empty', () => {
    render(<AdminUsersPageContainer />)
    expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument()
  })

  it('renders a "Novo usuário" button inside the empty state', () => {
    render(<AdminUsersPageContainer />)
    const buttons = screen.getAllByRole('button', { name: /novo usuário/i })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})

// ── User list ─────────────────────────────────────────────────────────────────

describe('AdminUsersPageContainer — user list', () => {
  it('renders user name when users are present', () => {
    const user = makeAdminUser({ firstName: 'Carlos', lastName: 'Rocha' })
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({ allUsers: [user], users: [user], filteredCount: 1 }),
    )
    render(<AdminUsersPageContainer />)
    expect(screen.getAllByText('Carlos Rocha').length).toBeGreaterThan(0)
  })

  it('renders user email when users are present', () => {
    const user = makeAdminUser({ email: 'carlos@example.com' })
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({ allUsers: [user], users: [user], filteredCount: 1 }),
    )
    render(<AdminUsersPageContainer />)
    expect(screen.getAllByText('carlos@example.com').length).toBeGreaterThan(0)
  })
})

// ── Error state ───────────────────────────────────────────────────────────────

describe('AdminUsersPageContainer — error state', () => {
  it('shows error message when load fails', () => {
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({ loadError: 'Não foi possível carregar os usuários.' }),
    )
    render(<AdminUsersPageContainer />)
    expect(screen.getByText('Não foi possível carregar os usuários.')).toBeInTheDocument()
  })
})
