import userEvent from '@testing-library/user-event'

import { render, screen, within } from '@/test-utils/render-utils'

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

vi.mock('@/features/admin/services/admin-users.service', () => ({
  listAdminClinics: vi.fn().mockResolvedValue([]),
  createAdminUser: vi.fn(),
  updateAdminUser: vi.fn(),
  updateAdminUserPassword: vi.fn(),
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
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

// ── Filtered empty state ────────────────────────────────────────────────────────

describe('AdminUsersPageContainer — filtered empty state', () => {
  it('shows the filtered empty state and calls clearAll when filteredCount is 0 but allUsers is not empty', async () => {
    const clearAll = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        allUsers: [makeAdminUser()],
        users: [],
        filteredCount: 0,
        clearAll,
      }),
    )
    render(<AdminUsersPageContainer />)
    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(clearAll).toHaveBeenCalledOnce()
  })
})

// ── Row interactions ─────────────────────────────────────────────────────────────

describe('AdminUsersPageContainer — row interactions', () => {
  function renderWithUser(overrides: Partial<AdminUser> = {}) {
    const user = makeAdminUser({
      firstName: 'Carlos',
      lastName: 'Rocha',
      clinic: { id: 'clinic-1', name: 'Clínica Norte' },
      ...overrides,
    })
    const setEditTarget = vi.fn()
    const setPasswordTarget = vi.fn()
    const setDeleteTarget = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        allUsers: [user],
        users: [user],
        filteredCount: 1,
        setEditTarget,
        setPasswordTarget,
        setDeleteTarget,
      }),
    )
    render(<AdminUsersPageContainer />)
    return { user, setEditTarget, setPasswordTarget, setDeleteTarget }
  }

  it('opens edit when clicking a table row', async () => {
    const { setEditTarget, user } = renderWithUser()
    const [row] = screen.getAllByRole('button', { name: 'Editar Carlos Rocha' })
    await userEvent.click(row)
    expect(setEditTarget).toHaveBeenCalledWith(user)
  })

  it.each(['{Enter}', ' '])('opens edit with %s when the row itself has focus', async (key) => {
    const { setEditTarget, user } = renderWithUser()
    const [row] = screen.getAllByRole('button', { name: 'Editar Carlos Rocha' })
    row.focus()
    await userEvent.keyboard(key)
    expect(setEditTarget).toHaveBeenCalledWith(user)
  })

  it('ignores unrelated keys on a user row', async () => {
    const { setEditTarget } = renderWithUser()
    screen.getAllByRole('button', { name: 'Editar Carlos Rocha' })[0].focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(setEditTarget).not.toHaveBeenCalled()
  })

  it('does not trigger row navigation when Enter is pressed on a nested action button', async () => {
    const { setEditTarget } = renderWithUser()
    const editButtons = screen.getAllByRole('button', { name: 'Editar Carlos Rocha' })
    const iconButton = editButtons[editButtons.length - 1]
    iconButton.focus()
    setEditTarget.mockClear()
    await userEvent.keyboard('{Enter}')
    // the icon button's own onClick still fires (also calls setEditTarget),
    // but the row's bubbling keydown handler must not double-invoke it
    expect(setEditTarget).toHaveBeenCalledTimes(1)
  })

  it('opens the password modal via the icon button without triggering row navigation', async () => {
    const { setPasswordTarget, setEditTarget } = renderWithUser()
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha de Carlos Rocha' }))
    expect(setPasswordTarget).toHaveBeenCalledWith({ id: 'user-1', name: 'Carlos Rocha' })
    expect(setEditTarget).not.toHaveBeenCalled()
  })

  it('opens the deactivate confirmation via the icon button', async () => {
    const { setDeleteTarget } = renderWithUser()
    await userEvent.click(screen.getByRole('button', { name: 'Desativar Carlos Rocha' }))
    expect(setDeleteTarget).toHaveBeenCalledWith({ id: 'user-1', name: 'Carlos Rocha' })
  })

  it("disables deactivation of the signed-in admin's own account on the table and mobile card", async () => {
    const user = makeAdminUser({ firstName: 'Carlos', lastName: 'Rocha' })
    const setDeleteTarget = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        allUsers: [user],
        users: [user],
        filteredCount: 1,
        currentUserId: user.id,
        setDeleteTarget,
      }),
    )
    render(<AdminUsersPageContainer />)

    const tableButton = screen.getByRole('button', { name: 'Desativar Carlos Rocha' })
    const cardButton = screen.getByRole('button', { name: /^desativar$/i })
    for (const button of [tableButton, cardButton]) {
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('title', 'Você não pode desativar a própria conta.')
    }
    await userEvent.click(tableButton)
    expect(setDeleteTarget).not.toHaveBeenCalled()
  })

  it('shows a dash for clinic when the user has none', () => {
    renderWithUser({ clinic: null })
    const table = screen.getByRole('table')
    expect(within(table).getByText('—')).toBeInTheDocument()
  })

  it('renders mobile-card actions that mirror the desktop row actions', async () => {
    const { setEditTarget, setPasswordTarget, setDeleteTarget, user } = renderWithUser()
    const editButtons = screen.getAllByRole('button', { name: /^editar$/i })
    await userEvent.click(editButtons[0])
    expect(setEditTarget).toHaveBeenCalledWith(user)

    await userEvent.click(screen.getByRole('button', { name: /^senha$/i }))
    expect(setPasswordTarget).toHaveBeenCalledWith({ id: 'user-1', name: 'Carlos Rocha' })

    await userEvent.click(screen.getByRole('button', { name: /^desativar$/i }))
    expect(setDeleteTarget).toHaveBeenCalledWith({ id: 'user-1', name: 'Carlos Rocha' })
  })
})

// ── Toolbar / pagination wiring ───────────────────────────────────────────────

describe('AdminUsersPageContainer — toolbar and pagination wiring', () => {
  it('calls setSearchQuery when typing in the search box', async () => {
    const setSearchQuery = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        allUsers: [makeAdminUser()],
        users: [makeAdminUser()],
        filteredCount: 1,
        setSearchQuery,
      }),
    )
    render(<AdminUsersPageContainer />)
    await userEvent.type(screen.getByPlaceholderText(/pesquisar por nome ou e-mail/i), 'a')
    expect(setSearchQuery).toHaveBeenCalled()
  })

  it('renders pagination and forwards page changes', async () => {
    const setPage = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        allUsers: [makeAdminUser()],
        users: [makeAdminUser()],
        filteredCount: 1,
        totalPages: 2,
        page: 1,
        setPage,
      }),
    )
    render(<AdminUsersPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /próxima/i }))
    expect(setPage).toHaveBeenCalledWith(2)
  })
})

// ── Modal wiring ─────────────────────────────────────────────────────────────────

describe('AdminUsersPageContainer — modal wiring', () => {
  it('dismisses the edit modal without saving', async () => {
    const setEditTarget = vi.fn()
    const handleEditSuccess = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        editTarget: makeAdminUser(),
        setEditTarget,
        handleEditSuccess,
      }),
    )
    render(<AdminUsersPageContainer />)
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }),
    )
    expect(setEditTarget).toHaveBeenCalledExactlyOnceWith(null)
    expect(handleEditSuccess).not.toHaveBeenCalled()
  })
  it('opens the create-user modal from the header button', () => {
    mockUseAdminUsersPage.mockReturnValue(makeDefaultHookState({ createOpen: true }))
    render(<AdminUsersPageContainer />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  })

  it('calls setCreateOpen(false) when the create modal is dismissed', async () => {
    const setCreateOpen = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(makeDefaultHookState({ createOpen: true, setCreateOpen }))
    render(<AdminUsersPageContainer />)
    const dialogs = screen.getAllByRole('dialog')
    await userEvent.click(
      within(dialogs[dialogs.length - 1]).getByRole('button', { name: 'Cancelar' }),
    )
    expect(setCreateOpen).toHaveBeenCalledWith(false)
  })

  it('opens the edit modal pre-filled when editTarget is set', () => {
    const user = makeAdminUser({ firstName: 'Ana' })
    mockUseAdminUsersPage.mockReturnValue(makeDefaultHookState({ editTarget: user }))
    render(<AdminUsersPageContainer />)
    expect(screen.getByText('Editar usuário')).toBeInTheDocument()
  })

  it('shows the password modal only when passwordTarget is set', () => {
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({ passwordTarget: { id: 'user-1', name: 'Carlos Rocha' } }),
    )
    render(<AdminUsersPageContainer />)
    expect(screen.getByText(/redefinir senha/i, { selector: 'h2' })).toBeInTheDocument()
  })

  it('does not render the password modal when passwordTarget is null', () => {
    mockUseAdminUsersPage.mockReturnValue(makeDefaultHookState({ passwordTarget: null }))
    render(<AdminUsersPageContainer />)
    expect(screen.queryByText(/redefinir senha/i, { selector: 'h2' })).not.toBeInTheDocument()
  })

  it('shows the deactivate confirm dialog with the target name and calls handleDeleteConfirm', async () => {
    const handleDeleteConfirm = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        deleteTarget: { id: 'user-1', name: 'Carlos Rocha' },
        handleDeleteConfirm,
      }),
    )
    render(<AdminUsersPageContainer />)
    expect(screen.getByText('Desativar usuário?')).toBeInTheDocument()
    expect(screen.getByText('Carlos Rocha')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Desativar' }))
    expect(handleDeleteConfirm).toHaveBeenCalledOnce()
  })

  it('calls setCreateOpen(true) from the header "Novo usuário" button', async () => {
    const setCreateOpen = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(makeDefaultHookState({ setCreateOpen }))
    render(<AdminUsersPageContainer />)
    await userEvent.click(screen.getAllByRole('button', { name: /novo usuário/i })[0])
    expect(setCreateOpen).toHaveBeenCalledWith(true)
  })

  it('calls setCreateOpen(true) from the empty-state "Novo usuário" button', async () => {
    const setCreateOpen = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(makeDefaultHookState({ setCreateOpen }))
    render(<AdminUsersPageContainer />)
    const buttons = screen.getAllByRole('button', { name: /novo usuário/i })
    await userEvent.click(buttons[buttons.length - 1])
    expect(setCreateOpen).toHaveBeenCalledWith(true)
  })

  it('calls setPasswordTarget(null) when the password modal is dismissed', async () => {
    const setPasswordTarget = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        passwordTarget: { id: 'user-1', name: 'Carlos Rocha' },
        setPasswordTarget,
      }),
    )
    render(<AdminUsersPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(setPasswordTarget).toHaveBeenCalledWith(null)
  })

  it('calls setDeleteTarget(null) when the deactivate dialog is cancelled', async () => {
    const setDeleteTarget = vi.fn()
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        deleteTarget: { id: 'user-1', name: 'Carlos Rocha' },
        setDeleteTarget,
      }),
    )
    render(<AdminUsersPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(setDeleteTarget).toHaveBeenCalledWith(null)
  })

  it('disables the confirm button while isDeleting', () => {
    mockUseAdminUsersPage.mockReturnValue(
      makeDefaultHookState({
        deleteTarget: { id: 'user-1', name: 'Carlos Rocha' },
        isDeleting: true,
      }),
    )
    render(<AdminUsersPageContainer />)
    expect(screen.getByRole('button', { name: /aguarde/i })).toBeDisabled()
  })
})
