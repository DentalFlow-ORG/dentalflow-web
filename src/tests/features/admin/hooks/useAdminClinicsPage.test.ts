import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockListAdminClinicsPage = vi.fn()
const mockDeleteAdminClinic = vi.fn()
vi.mock('@/features/admin/services/admin-clinics.service', () => ({
  listAdminClinicsPage: (...args: unknown[]) => mockListAdminClinicsPage(...args),
  deleteAdminClinic: (...args: unknown[]) => mockDeleteAdminClinic(...args),
}))

import { useAdminClinicsPage } from '@/features/admin/hooks/useAdminClinicsPage'
import type { AdminClinic } from '@/features/admin/types/admin.types'

function makeClinic(overrides: Partial<AdminClinic> = {}): AdminClinic {
  return {
    id: '1',
    name: 'Clínica Demo',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  mockShowAlert.mockReset()
  mockListAdminClinicsPage.mockReset()
  mockDeleteAdminClinic.mockReset()
})

describe('useAdminClinicsPage', () => {
  it('loads clinics on mount', async () => {
    mockListAdminClinicsPage.mockResolvedValue({
      data: [makeClinic()],
      total: 1,
      page: 1,
      limit: 500,
    })
    const { result } = renderHook(() => useAdminClinicsPage())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.allClinics).toHaveLength(1)
  })

  it('sets loadError and shows an alert on failure', async () => {
    mockListAdminClinicsPage.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.loadError).toBe('offline')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao carregar clínicas', tone: 'error' }),
    )
  })

  it('uses a generic message for a non-Error rejection', async () => {
    mockListAdminClinicsPage.mockRejectedValue('boom')
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.loadError).toBe('Não foi possível carregar as clínicas.')
  })

  it('formats dates via formatDate, with a fallback for missing values', async () => {
    mockListAdminClinicsPage.mockResolvedValue({ data: [], total: 0, page: 1, limit: 500 })
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.formatDate('2026-06-15T12:00:00.000Z')).toBe('15/06/2026')
    expect(result.current.formatDate(undefined)).toBe('—')
  })

  it('filters clinics by status via the status filter fn', async () => {
    mockListAdminClinicsPage.mockResolvedValue({
      data: [makeClinic({ id: '1', isActive: true }), makeClinic({ id: '2', isActive: false })],
      total: 2,
      page: 1,
      limit: 500,
    })
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setFilter('status', 'active'))
    expect(result.current.clinics).toHaveLength(1)
    expect(result.current.clinics[0].id).toBe('1')

    act(() => result.current.setFilter('status', 'inactive'))
    expect(result.current.clinics).toHaveLength(1)
    expect(result.current.clinics[0].id).toBe('2')
  })

  it('treats isActive === undefined as active for the status filter', async () => {
    mockListAdminClinicsPage.mockResolvedValue({
      data: [makeClinic({ id: '1', isActive: undefined as unknown as boolean })],
      total: 1,
      page: 1,
      limit: 500,
    })
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setFilter('status', 'active'))
    expect(result.current.clinics).toHaveLength(1)
  })

  it('filters clinics by search query', async () => {
    mockListAdminClinicsPage.mockResolvedValue({
      data: [
        makeClinic({ id: '1', name: 'Sorriso Feliz' }),
        makeClinic({ id: '2', name: 'Odonto Plus' }),
      ],
      total: 2,
      page: 1,
      limit: 500,
    })
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setSearchQuery('sorriso'))
    expect(result.current.clinics).toHaveLength(1)
  })

  it('handleCreateSuccess closes the create modal, shows a success alert, and reloads', async () => {
    mockListAdminClinicsPage.mockResolvedValue({ data: [], total: 0, page: 1, limit: 500 })
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setCreateOpen(true))
    mockListAdminClinicsPage.mockClear()
    act(() => result.current.handleCreateSuccess(makeClinic({ name: 'Nova Clínica' })))

    expect(result.current.createOpen).toBe(false)
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Clínica criada', tone: 'success' }),
    )
    expect(mockListAdminClinicsPage).toHaveBeenCalled()
  })

  it('handleEditSuccess replaces the clinic in the list without reloading', async () => {
    const original = makeClinic({ id: '1', name: 'Original' })
    mockListAdminClinicsPage.mockResolvedValue({ data: [original], total: 1, page: 1, limit: 500 })
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setEditTarget(original))
    mockListAdminClinicsPage.mockClear()
    const updated = makeClinic({ id: '1', name: 'Renomeada' })
    act(() => result.current.handleEditSuccess(updated))

    expect(result.current.editTarget).toBeNull()
    expect(result.current.allClinics.find((c) => c.id === '1')?.name).toBe('Renomeada')
    expect(mockListAdminClinicsPage).not.toHaveBeenCalled()
  })

  it('handleDeleteConfirm does nothing when there is no deleteTarget', async () => {
    mockListAdminClinicsPage.mockResolvedValue({ data: [], total: 0, page: 1, limit: 500 })
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => result.current.handleDeleteConfirm())
    expect(mockDeleteAdminClinic).not.toHaveBeenCalled()
  })

  it('handleDeleteConfirm deletes the clinic, removes it locally, and shows a success alert', async () => {
    const clinic = makeClinic({ id: '1', name: 'A remover' })
    mockListAdminClinicsPage.mockResolvedValue({ data: [clinic], total: 1, page: 1, limit: 500 })
    mockDeleteAdminClinic.mockResolvedValue(undefined)
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setDeleteTarget({ id: '1', name: 'A remover' }))
    await act(async () => result.current.handleDeleteConfirm())

    expect(mockDeleteAdminClinic).toHaveBeenCalledWith('1')
    expect(result.current.deleteTarget).toBeNull()
    expect(result.current.allClinics).toHaveLength(0)
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Clínica removida', tone: 'success' }),
    )
  })

  it('handleDeleteConfirm shows an error alert and keeps the target on failure', async () => {
    const clinic = makeClinic({ id: '1', name: 'A remover' })
    mockListAdminClinicsPage.mockResolvedValue({ data: [clinic], total: 1, page: 1, limit: 500 })
    mockDeleteAdminClinic.mockRejectedValue(new Error('não autorizado'))
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setDeleteTarget({ id: '1', name: 'A remover' }))
    await act(async () => result.current.handleDeleteConfirm())

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao excluir',
        description: 'não autorizado',
        tone: 'error',
      }),
    )
    expect(result.current.allClinics).toHaveLength(1)
    expect(result.current.isDeleting).toBe(false)
  })

  it('shows a generic error message when delete rejects with a non-Error', async () => {
    const clinic = makeClinic({ id: '1' })
    mockListAdminClinicsPage.mockResolvedValue({ data: [clinic], total: 1, page: 1, limit: 500 })
    mockDeleteAdminClinic.mockRejectedValue('boom')
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setDeleteTarget({ id: '1', name: 'A remover' }))
    await act(async () => result.current.handleDeleteConfirm())

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Erro ao excluir clínica.' }),
    )
  })

  it('exposes pagination and pageSize controls', async () => {
    mockListAdminClinicsPage.mockResolvedValue({ data: [], total: 0, page: 1, limit: 500 })
    const { result } = renderHook(() => useAdminClinicsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.pageSize).toBe(10)
    act(() => result.current.setPageSize(25))
    expect(result.current.pageSize).toBe(25)
  })
})
