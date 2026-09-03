import { act, renderHook, waitFor } from '@/test-utils/render-utils'

import { useTeamPage } from '@/features/team/hooks/useTeamPage'
import type { MemberListItem, UserLimitUsage } from '@/features/team/types/team.types'

const mockShowAlert = vi.fn()
const mockListClinicMembers = vi.fn()
const mockDeleteClinicMember = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

vi.mock('@/features/team/services/team.service', () => ({
  listClinicMembers: (...args: unknown[]) => mockListClinicMembers(...args),
  deleteClinicMember: (...args: unknown[]) => mockDeleteClinicMember(...args),
}))

function makeMember(overrides: Partial<MemberListItem> = {}): MemberListItem {
  return {
    id: 'm1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana@clinica.com',
    role: 'DENTIST',
    isActive: true,
    ...overrides,
  } as MemberListItem
}

function makeUsage(overrides: Partial<UserLimitUsage> = {}): UserLimitUsage {
  return { limit: 5, used: 1, remaining: 4, planSlug: 'pro', planName: 'Pro', ...overrides }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockListClinicMembers.mockResolvedValue({ members: [makeMember()], usage: makeUsage() })
})

describe('useTeamPage', () => {
  it('loads members and usage on mount', async () => {
    const { result } = renderHook(() => useTeamPage())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.allMembers).toHaveLength(1)
    expect(result.current.usage.limit).toBe(5)
    expect(result.current.error).toBeNull()
  })

  it('sets an error and shows an alert when loading fails', async () => {
    mockListClinicMembers.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('network down')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao carregar equipe', tone: 'error' }),
    )
  })

  it('falls back to a generic error message for a non-Error rejection', async () => {
    mockListClinicMembers.mockRejectedValue('boom')
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Não foi possível carregar a equipe.')
  })

  it('opens the create modal when under the user limit', async () => {
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.handleCreateClick())
    expect(result.current.createOpen).toBe(true)
  })

  it('shows a warning and does not open the create modal when the user limit is reached', async () => {
    mockListClinicMembers.mockResolvedValue({
      members: [],
      usage: makeUsage({ limit: 3, used: 3, remaining: 0 }),
    })
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.handleCreateClick())
    expect(result.current.createOpen).toBe(false)
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Limite de usuários atingido', tone: 'warning' }),
    )
  })

  it('does not treat a zero-limit plan as "reached"', async () => {
    mockListClinicMembers.mockResolvedValue({
      members: [],
      usage: makeUsage({ limit: 0, used: 0, remaining: 0 }),
    })
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasReachedUserLimit).toBe(false)
  })

  it('closes the create modal, shows a success alert, and reloads on create success', async () => {
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    mockListClinicMembers.mockClear()
    act(() => result.current.setCreateOpen(true))

    act(() => result.current.handleCreateSuccess(makeMember({ firstName: 'Beto' })))

    expect(result.current.createOpen).toBe(false)
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Usuário criado' }))
    await waitFor(() => expect(mockListClinicMembers).toHaveBeenCalled())
  })

  it('clears the edit target, shows a success alert, and reloads on edit success', async () => {
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    mockListClinicMembers.mockClear()
    act(() => result.current.setEditTarget(makeMember()))

    act(() => result.current.handleEditSuccess(makeMember()))

    expect(result.current.editTarget).toBeNull()
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Usuário atualizado' }),
    )
    await waitFor(() => expect(mockListClinicMembers).toHaveBeenCalled())
  })

  it('clears the password target and shows a success alert on password success', async () => {
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setPasswordTarget({ id: 'm1', name: 'Ana' }))

    act(() => result.current.handlePasswordSuccess())

    expect(result.current.passwordTarget).toBeNull()
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Senha redefinida' }),
    )
  })

  it('does nothing when confirming deletion with no delete target', async () => {
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => result.current.handleDeleteConfirm())
    expect(mockDeleteClinicMember).not.toHaveBeenCalled()
  })

  it('deletes the member, shows a success alert, clears the target, and reloads', async () => {
    mockDeleteClinicMember.mockResolvedValue(undefined)
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    mockListClinicMembers.mockClear()
    act(() => result.current.setDeleteTarget({ id: 'm1', name: 'Ana Silva' }))

    await act(async () => result.current.handleDeleteConfirm())

    expect(mockDeleteClinicMember).toHaveBeenCalledWith('m1')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Usuário desativado' }),
    )
    expect(result.current.deleteTarget).toBeNull()
    await waitFor(() => expect(mockListClinicMembers).toHaveBeenCalled())
  })

  it('shows an error alert and keeps the delete target set when deletion fails', async () => {
    mockDeleteClinicMember.mockRejectedValue(new Error('cannot delete'))
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setDeleteTarget({ id: 'm1', name: 'Ana Silva' }))

    await act(async () => result.current.handleDeleteConfirm())

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao desativar', description: 'cannot delete' }),
    )
    expect(result.current.deleteTarget).toEqual({ id: 'm1', name: 'Ana Silva' })
    expect(result.current.isDeleting).toBe(false)
  })

  it('falls back to a generic error message for a non-Error delete rejection', async () => {
    mockDeleteClinicMember.mockRejectedValue('boom')
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setDeleteTarget({ id: 'm1', name: 'Ana Silva' }))

    await act(async () => result.current.handleDeleteConfirm())

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Erro ao desativar usuário.' }),
    )
  })

  it('filters members by search query', async () => {
    mockListClinicMembers.mockResolvedValue({
      members: [
        makeMember({ id: 'm1', firstName: 'Ana' }),
        makeMember({ id: 'm2', firstName: 'Beto', email: 'beto@clinica.com' }),
      ],
      usage: makeUsage(),
    })
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setSearchQuery('ana'))
    expect(result.current.members.map((m) => m.id)).toEqual(['m1'])
  })

  it('filters members by role', async () => {
    mockListClinicMembers.mockResolvedValue({
      members: [
        makeMember({ id: 'm1', role: 'DENTIST' }),
        makeMember({ id: 'm2', role: 'ASSISTANT' }),
      ],
      usage: makeUsage(),
    })
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setFilter('role', 'ASSISTANT'))
    expect(result.current.members.map((m) => m.id)).toEqual(['m2'])
  })

  it('filters members by active/inactive status', async () => {
    mockListClinicMembers.mockResolvedValue({
      members: [
        makeMember({ id: 'm1', isActive: true }),
        makeMember({ id: 'm2', isActive: false }),
      ],
      usage: makeUsage(),
    })
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setFilter('status', 'inactive'))
    expect(result.current.members.map((m) => m.id)).toEqual(['m2'])
  })

  it('clears search and filters via clearAll', async () => {
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setSearchQuery('ana'))
    act(() => result.current.clearAll())
    expect(result.current.searchQuery).toBe('')
    expect(result.current.activeFilters).toEqual({})
  })

  it('exposes the role label map and filter defs', async () => {
    const { result } = renderHook(() => useTeamPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.roleLabel.DENTIST).toBe('Profissional')
    expect(result.current.filterDefs).toHaveLength(2)
    expect(result.current.pageSize).toBe(10)
  })
})
