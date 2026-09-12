import userEvent from '@testing-library/user-event'

import { render, screen, within } from '@/test-utils/render-utils'

import { TeamPageContainer } from '@/features/team/containers/TeamPageContainer'
import type { MemberListItem, UserLimitUsage } from '@/features/team/types/team.types'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockUseTeamPage = vi.fn()
vi.mock('@/features/team/hooks/useTeamPage', () => ({
  useTeamPage: () => mockUseTeamPage(),
}))

function makeMember(overrides: Partial<MemberListItem> = {}): MemberListItem {
  return {
    id: 'member-1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana@example.com',
    role: 'DENTIST',
    phone: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    profile: null,
    ...overrides,
  }
}

function makeUsage(overrides: Partial<UserLimitUsage> = {}): UserLimitUsage {
  return {
    limit: 10,
    used: 1,
    remaining: 9,
    planSlug: 'starter',
    planName: 'Starter',
    ...overrides,
  }
}

function makeState(overrides: Record<string, unknown> = {}) {
  return {
    members: [makeMember()],
    allMembers: [makeMember()],
    isLoading: false,
    error: null,
    searchQuery: '',
    setSearchQuery: vi.fn(),
    activeFilters: {},
    setFilter: vi.fn(),
    clearAll: vi.fn(),
    page: 1,
    setPage: vi.fn(),
    totalPages: 1,
    filteredCount: 1,
    pageSize: 10,
    filterDefs: [],
    usage: makeUsage(),
    hasReachedUserLimit: false,
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
    handleCreateClick: vi.fn(),
    handleCreateSuccess: vi.fn(),
    handleEditSuccess: vi.fn(),
    handlePasswordSuccess: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    ...overrides,
  }
}

describe('TeamPageContainer', () => {
  it('renders KPI cards and the members table', () => {
    mockUseTeamPage.mockReturnValue(makeState())
    render(<TeamPageContainer />)
    expect(screen.getByText('Equipe')).toBeInTheDocument()
    expect(screen.getAllByText('Ana Silva').length).toBeGreaterThan(0)
  })

  it('shows the user-limit warning banner when the limit is reached', () => {
    mockUseTeamPage.mockReturnValue(
      makeState({
        hasReachedUserLimit: true,
        usage: makeUsage({ limit: 5, used: 5, remaining: 0 }),
      }),
    )
    render(<TeamPageContainer />)
    expect(screen.getByText(/limite de 5 usuários ativos atingido/i)).toBeInTheDocument()
  })

  it('names the plan by its slug when the plan has no display name', () => {
    mockUseTeamPage.mockReturnValue(
      makeState({
        hasReachedUserLimit: true,
        usage: makeUsage({ limit: 5, used: 5, remaining: 0, planName: null, planSlug: 'starter' }),
      }),
    )
    render(<TeamPageContainer />)
    expect(screen.getByText(/para o plano starter/i)).toBeInTheDocument()
  })

  it('does not show the warning banner when under the limit', () => {
    mockUseTeamPage.mockReturnValue(makeState({ hasReachedUserLimit: false }))
    render(<TeamPageContainer />)
    expect(screen.queryByText(/limite de.*usuários ativos atingido/i)).not.toBeInTheDocument()
  })

  it('shows the loading state', () => {
    mockUseTeamPage.mockReturnValue(makeState({ isLoading: true }))
    render(<TeamPageContainer />)
    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument()
  })

  it('shows the load error with a retry action', () => {
    const load = vi.fn()
    mockUseTeamPage.mockReturnValue(makeState({ error: 'Falha ao carregar', load }))
    render(<TeamPageContainer />)
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument()
  })

  it('shows the empty state when there are no members at all', () => {
    mockUseTeamPage.mockReturnValue(makeState({ allMembers: [], members: [], filteredCount: 0 }))
    render(<TeamPageContainer />)
    expect(screen.getByText('Nenhum usuário cadastrado')).toBeInTheDocument()
  })

  it('shows the filtered-empty state when filters produce zero results', () => {
    mockUseTeamPage.mockReturnValue(
      makeState({ members: [], filteredCount: 0, allMembers: [makeMember()] }),
    )
    render(<TeamPageContainer />)
    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument()
  })

  it('calls handleCreateClick when "Novo usuário" is clicked', async () => {
    const handleCreateClick = vi.fn()
    mockUseTeamPage.mockReturnValue(makeState({ handleCreateClick }))
    render(<TeamPageContainer />)
    await userEvent.click(screen.getAllByRole('button', { name: /novo usuário/i })[0])
    expect(handleCreateClick).toHaveBeenCalledOnce()
  })

  it('opens the edit modal with the initial data when editTarget is set', () => {
    mockUseTeamPage.mockReturnValue(makeState({ editTarget: makeMember({ firstName: 'Beto' }) }))
    render(<TeamPageContainer />)
    expect(screen.getByDisplayValue('Beto')).toBeInTheDocument()
  })

  it('renders the password modal when passwordTarget is set', () => {
    mockUseTeamPage.mockReturnValue(
      makeState({ passwordTarget: { id: 'member-1', name: 'Ana Silva' } }),
    )
    render(<TeamPageContainer />)
    expect(screen.getByRole('heading', { name: /redefinir senha/i })).toBeInTheDocument()
  })

  it('does not render the password modal when passwordTarget is null', () => {
    mockUseTeamPage.mockReturnValue(makeState({ passwordTarget: null }))
    render(<TeamPageContainer />)
    expect(screen.queryByRole('heading', { name: /redefinir senha/i })).not.toBeInTheDocument()
  })

  it('renders the delete confirmation dialog with the target name', () => {
    mockUseTeamPage.mockReturnValue(
      makeState({ deleteTarget: { id: 'member-1', name: 'Ana Silva' } }),
    )
    render(<TeamPageContainer />)
    expect(screen.getByText('Desativar usuário?')).toBeInTheDocument()
    expect(screen.getAllByText('Ana Silva').length).toBeGreaterThan(0)
  })

  it('sets the password target with the full name when "Alterar senha" is clicked', async () => {
    const setPasswordTarget = vi.fn()
    mockUseTeamPage.mockReturnValue(makeState({ setPasswordTarget }))
    render(<TeamPageContainer />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Alterar senha' })[0])
    expect(setPasswordTarget).toHaveBeenCalledWith({ id: 'member-1', name: 'Ana Silva' })
  })

  it('sets the delete target with the full name when "Desativar" is clicked', async () => {
    const setDeleteTarget = vi.fn()
    mockUseTeamPage.mockReturnValue(makeState({ setDeleteTarget }))
    render(<TeamPageContainer />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Desativar' })[0])
    expect(setDeleteTarget).toHaveBeenCalledWith({ id: 'member-1', name: 'Ana Silva' })
  })

  it('sets the edit target when "Editar" is clicked', async () => {
    const setEditTarget = vi.fn()
    mockUseTeamPage.mockReturnValue(makeState({ setEditTarget }))
    render(<TeamPageContainer />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])
    expect(setEditTarget).toHaveBeenCalledWith(expect.objectContaining({ id: 'member-1' }))
  })

  it('calls handleDeleteConfirm when the delete dialog is confirmed', async () => {
    const handleDeleteConfirm = vi.fn()
    mockUseTeamPage.mockReturnValue(
      makeState({ deleteTarget: { id: 'member-1', name: 'Ana Silva' }, handleDeleteConfirm }),
    )
    render(<TeamPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Desativar' }))
    expect(handleDeleteConfirm).toHaveBeenCalledOnce()
  })

  it('calls setDeleteTarget(null) when the delete dialog is canceled', async () => {
    const setDeleteTarget = vi.fn()
    mockUseTeamPage.mockReturnValue(
      makeState({ deleteTarget: { id: 'member-1', name: 'Ana Silva' }, setDeleteTarget }),
    )
    render(<TeamPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(setDeleteTarget).toHaveBeenCalledWith(null)
  })

  it('closes the create modal via setCreateOpen(false)', async () => {
    const setCreateOpen = vi.fn()
    mockUseTeamPage.mockReturnValue(makeState({ createOpen: true, setCreateOpen }))
    render(<TeamPageContainer />)
    const dialogs = screen.getAllByRole('dialog')
    await userEvent.click(within(dialogs[0]).getByRole('button', { name: 'Cancelar' }))
    expect(setCreateOpen).toHaveBeenCalledWith(false)
  })

  it('clears the edit target via setEditTarget(null)', async () => {
    const setEditTarget = vi.fn()
    mockUseTeamPage.mockReturnValue(makeState({ editTarget: makeMember(), setEditTarget }))
    render(<TeamPageContainer />)
    const dialogs = screen.getAllByRole('dialog')
    await userEvent.click(within(dialogs[0]).getByRole('button', { name: 'Cancelar' }))
    expect(setEditTarget).toHaveBeenCalledWith(null)
  })

  it('clears the password target via setPasswordTarget(null)', async () => {
    const setPasswordTarget = vi.fn()
    mockUseTeamPage.mockReturnValue(
      makeState({ passwordTarget: { id: 'member-1', name: 'Ana Silva' }, setPasswordTarget }),
    )
    render(<TeamPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(setPasswordTarget).toHaveBeenCalledWith(null)
  })
})
