import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockListClinicalTemplates = vi.fn()
const mockCreateClinicalTemplate = vi.fn()
const mockUpdateClinicalTemplate = vi.fn()
const mockDeactivateClinicalTemplate = vi.fn()

vi.mock('@/features/clinical-records/services/clinical-templates.service', () => ({
  listClinicalTemplates: (...args: unknown[]) => mockListClinicalTemplates(...args),
  createClinicalTemplate: (...args: unknown[]) => mockCreateClinicalTemplate(...args),
  updateClinicalTemplate: (...args: unknown[]) => mockUpdateClinicalTemplate(...args),
  deactivateClinicalTemplate: (...args: unknown[]) => mockDeactivateClinicalTemplate(...args),
}))

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

import { useClinicalTemplates } from '@/features/clinical-records/hooks/useClinicalTemplates'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useClinicalTemplates — load', () => {
  it.each(['success', 'failure'] as const)(
    'discards a late load %s after unmount',
    async (outcome) => {
      let resolve!: (value: unknown[]) => void
      let reject!: (reason: Error) => void
      mockListClinicalTemplates.mockReturnValueOnce(
        new Promise((yes, no) => {
          resolve = yes
          reject = no
        }),
      )
      const { result, unmount } = renderHook(() => useClinicalTemplates())
      unmount()
      await act(async () => {
        if (outcome === 'success') resolve([{ id: 'late' }])
        else reject(new Error('late failure'))
      })
      expect(result.current.templates).toEqual([])
      expect(result.current.error).toBeNull()
      expect(mockShowAlert).not.toHaveBeenCalled()
    },
  )

  it('loads templates on mount', async () => {
    mockListClinicalTemplates.mockResolvedValue([{ id: 't1', name: 'Modelo' }])
    const { result } = renderHook(() => useClinicalTemplates())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.templates).toEqual([{ id: 't1', name: 'Modelo' }])
  })

  it('sets an error when loading fails', async () => {
    mockListClinicalTemplates.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useClinicalTemplates())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Não foi possível carregar os modelos clínicos.')
  })

  it('refresh reloads the list', async () => {
    mockListClinicalTemplates.mockResolvedValue([])
    const { result } = renderHook(() => useClinicalTemplates())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    mockListClinicalTemplates.mockResolvedValue([{ id: 't1' }])
    act(() => {
      result.current.refresh()
    })
    await waitFor(() => expect(result.current.templates).toHaveLength(1))
  })
})

describe('useClinicalTemplates — create', () => {
  it('appends the created template and shows a success alert', async () => {
    mockListClinicalTemplates.mockResolvedValue([])
    const { result } = renderHook(() => useClinicalTemplates())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockCreateClinicalTemplate.mockResolvedValue({ id: 't1', name: 'Novo' })
    let created: unknown
    await act(async () => {
      created = await result.current.create({ name: 'Novo' } as never)
    })

    expect(created).toEqual({ id: 't1', name: 'Novo' })
    expect(result.current.templates).toEqual([{ id: 't1', name: 'Novo' }])
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Modelo criado.', tone: 'success' }),
    )
  })

  it('returns null and shows an error alert on failure', async () => {
    mockListClinicalTemplates.mockResolvedValue([])
    const { result } = renderHook(() => useClinicalTemplates())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockCreateClinicalTemplate.mockRejectedValue(new Error('fail'))
    let created: unknown = 'not-set'
    await act(async () => {
      created = await result.current.create({ name: 'Novo' } as never)
    })

    expect(created).toBeNull()
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro', tone: 'error' }),
    )
  })
})

describe('useClinicalTemplates — update', () => {
  it('replaces the matching template and shows a success alert', async () => {
    mockListClinicalTemplates.mockResolvedValue([
      { id: 't1', name: 'Antigo' },
      { id: 't2', name: 'Preservado' },
    ])
    const { result } = renderHook(() => useClinicalTemplates())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockUpdateClinicalTemplate.mockResolvedValue({ id: 't1', name: 'Atualizado' })
    let updated: unknown
    await act(async () => {
      updated = await result.current.update('t1', { name: 'Atualizado' } as never)
    })

    expect(updated).toEqual({ id: 't1', name: 'Atualizado' })
    expect(result.current.templates).toEqual([
      { id: 't1', name: 'Atualizado' },
      { id: 't2', name: 'Preservado' },
    ])
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Modelo atualizado.', tone: 'success' }),
    )
  })

  it('returns null and shows an error alert on failure', async () => {
    mockListClinicalTemplates.mockResolvedValue([{ id: 't1', name: 'Antigo' }])
    const { result } = renderHook(() => useClinicalTemplates())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockUpdateClinicalTemplate.mockRejectedValue(new Error('fail'))
    let updated: unknown = 'not-set'
    await act(async () => {
      updated = await result.current.update('t1', { name: 'x' } as never)
    })

    expect(updated).toBeNull()
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro', tone: 'error' }),
    )
  })
})

describe('useClinicalTemplates — deactivate', () => {
  it('removes the template and shows an info alert', async () => {
    mockListClinicalTemplates.mockResolvedValue([{ id: 't1' }])
    const { result } = renderHook(() => useClinicalTemplates())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeactivateClinicalTemplate.mockResolvedValue(undefined)
    await act(async () => {
      await result.current.deactivate('t1')
    })

    expect(result.current.templates).toEqual([])
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Modelo removido.', tone: 'info' }),
    )
  })

  it('shows an error alert on failure', async () => {
    mockListClinicalTemplates.mockResolvedValue([{ id: 't1' }])
    const { result } = renderHook(() => useClinicalTemplates())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeactivateClinicalTemplate.mockRejectedValue(new Error('fail'))
    await act(async () => {
      await result.current.deactivate('t1')
    })

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro', tone: 'error' }),
    )
  })
})
