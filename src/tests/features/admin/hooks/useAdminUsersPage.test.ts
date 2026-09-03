import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockListAdminUsers = vi.fn()
const mockDeleteAdminUser = vi.fn()
vi.mock('@/features/admin/services/admin-users.service', () => ({
  listAdminUsers: (...args: unknown[]) => mockListAdminUsers(...args),
  deleteAdminUser: (...args: unknown[]) => mockDeleteAdminUser(...args),
}))

import { useAdminUsersPage } from '@/features/admin/hooks/useAdminUsersPage'
import type { AdminUser } from '@/features/admin/types/admin.types'

function makeUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: '1',
    firstName: 'Ana',
    lastName: 'Martins',
    email: 'ana@clinica.com',
    role: 'OWNER',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as AdminUser
}

beforeEach(() => {
  mockShowAlert.mockReset()
  mockListAdminUsers.mockReset()
  mockDeleteAdminUser.mockReset()
})

async function renderLoaded(users: AdminUser[] = []) {
  mockListAdminUsers.mockResolvedValue({ data: users, total: users.length, page: 1, limit: 500 })
  const hook = renderHook(() => useAdminUsersPage())
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false))
  return hook
}

describe('useAdminUsersPage', () => {
  it('loads users on mount', async () => {
    const { result } = await renderLoaded([makeUser()])
    expect(result.current.allUsers).toHaveLength(1)
  })

  it('sets loadError and shows an alert on failure', async () => {
    mockListAdminUsers.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useAdminUsersPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.loadError).toBe('offline')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao carregar usuários', tone: 'error' }),
    )
  })

  it('uses a generic message for a non-Error rejection', async () => {
    mockListAdminUsers.mockRejectedValue('boom')
    const { result } = renderHook(() => useAdminUsersPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.loadError).toBe('Não foi possível carregar os usuários.')
  })

  it('formats dates', async () => {
    const { result } = await renderLoaded()
    expect(result.current.formatDate('2026-06-15T12:00:00.000Z')).toBe('15/06/2026')
  })

  it('filters by role', async () => {
    const { result } = await renderLoaded([
      makeUser({ id: '1', role: 'OWNER' }),
      makeUser({ id: '2', role: 'ASSISTANT' }),
    ])
    act(() => result.current.setFilter('role', 'OWNER'))
    expect(result.current.users).toHaveLength(1)
    expect(result.current.users[0].id).toBe('1')
  })

  it('filters by status', async () => {
    const { result } = await renderLoaded([
      makeUser({ id: '1', isActive: true }),
      makeUser({ id: '2', isActive: false }),
    ])
    act(() => result.current.setFilter('status', 'active'))
    expect(result.current.users).toHaveLength(1)
    act(() => result.current.setFilter('status', 'inactive'))
    expect(result.current.users).toHaveLength(1)
    expect(result.current.users[0].id).toBe('2')
  })

  it('filters by search query across name and email', async () => {
    const { result } = await renderLoaded([
      makeUser({ id: '1', firstName: 'Ana', lastName: 'Martins', email: 'ana@x.com' }),
      makeUser({ id: '2', firstName: 'Bruno', lastName: 'Souza', email: 'bruno@x.com' }),
    ])
    act(() => result.current.setSearchQuery('bruno'))
    expect(result.current.users).toHaveLength(1)
    expect(result.current.users[0].id).toBe('2')
  })

  it('handleCreateSuccess closes the modal, alerts, and reloads', async () => {
    const { result } = await renderLoaded()
    act(() => result.current.setCreateOpen(true))
    mockListAdminUsers.mockClear()
    act(() =>
      result.current.handleCreateSuccess(makeUser({ firstName: 'Nova', lastName: 'Pessoa' })),
    )
    expect(result.current.createOpen).toBe(false)
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Usuário criado' }))
    expect(mockListAdminUsers).toHaveBeenCalled()
  })

  it('handleEditSuccess replaces the user without reloading', async () => {
    const original = makeUser({ id: '1', firstName: 'Original' })
    const { result } = await renderLoaded([original])
    act(() => result.current.setEditTarget(original))
    mockListAdminUsers.mockClear()
    act(() => result.current.handleEditSuccess(makeUser({ id: '1', firstName: 'Renomeado' })))
    expect(result.current.editTarget).toBeNull()
    expect(result.current.allUsers[0].firstName).toBe('Renomeado')
    expect(mockListAdminUsers).not.toHaveBeenCalled()
  })

  it('handlePasswordSuccess closes the password modal and shows a success alert', async () => {
    const { result } = await renderLoaded()
    act(() => result.current.setPasswordTarget({ id: '1', name: 'Ana' }))
    act(() => result.current.handlePasswordSuccess())
    expect(result.current.passwordTarget).toBeNull()
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Senha redefinida' }),
    )
  })

  it('handleDeleteConfirm does nothing without a deleteTarget', async () => {
    const { result } = await renderLoaded()
    await act(async () => result.current.handleDeleteConfirm())
    expect(mockDeleteAdminUser).not.toHaveBeenCalled()
  })

  it('handleDeleteConfirm deactivates the user and removes it locally', async () => {
    const user = makeUser({ id: '1', firstName: 'Ana' })
    const { result } = await renderLoaded([user])
    mockDeleteAdminUser.mockResolvedValue(undefined)
    act(() => result.current.setDeleteTarget({ id: '1', name: 'Ana' }))
    await act(async () => result.current.handleDeleteConfirm())
    expect(mockDeleteAdminUser).toHaveBeenCalledWith('1')
    expect(result.current.deleteTarget).toBeNull()
    expect(result.current.allUsers).toHaveLength(0)
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Usuário desativado' }),
    )
  })

  it('handleDeleteConfirm shows an error alert on failure', async () => {
    const user = makeUser({ id: '1', firstName: 'Ana' })
    const { result } = await renderLoaded([user])
    mockDeleteAdminUser.mockRejectedValue(new Error('sem permissão'))
    act(() => result.current.setDeleteTarget({ id: '1', name: 'Ana' }))
    await act(async () => result.current.handleDeleteConfirm())
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao excluir', description: 'sem permissão' }),
    )
    expect(result.current.allUsers).toHaveLength(1)
  })

  it('shows a generic error message when delete rejects with a non-Error', async () => {
    const user = makeUser({ id: '1' })
    const { result } = await renderLoaded([user])
    mockDeleteAdminUser.mockRejectedValue('boom')
    act(() => result.current.setDeleteTarget({ id: '1', name: 'Ana' }))
    await act(async () => result.current.handleDeleteConfirm())
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Erro ao excluir usuário.' }),
    )
  })

  it('exposes roleLabel and roleTone lookups', async () => {
    const { result } = await renderLoaded()
    expect(result.current.roleLabel).toBeDefined()
    expect(result.current.roleTone).toBeDefined()
  })
})
