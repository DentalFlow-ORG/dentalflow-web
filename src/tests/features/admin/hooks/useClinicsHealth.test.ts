import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockGetClinicsHealth = vi.fn()
vi.mock('@/features/admin/services/admin-clinics.service', () => ({
  getClinicsHealth: (...args: unknown[]) => mockGetClinicsHealth(...args),
}))

import { useClinicsHealth } from '@/features/admin/hooks/useClinicsHealth'

beforeEach(() => {
  mockGetClinicsHealth.mockReset()
})

describe('useClinicsHealth', () => {
  it('loads clinic health rows on mount', async () => {
    const rows = [{ clinic: { id: '1', name: 'Clínica A' } }]
    mockGetClinicsHealth.mockResolvedValue(rows)

    const { result } = renderHook(() => useClinicsHealth())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.rows).toEqual(rows)
    expect(result.current.loadError).toBeNull()
  })

  it('sets loadError with the Error message on failure', async () => {
    mockGetClinicsHealth.mockRejectedValue(new Error('Falha na rede'))

    const { result } = renderHook(() => useClinicsHealth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.loadError).toBe('Falha na rede')
    expect(result.current.rows).toEqual([])
  })

  it('sets a generic loadError for a non-Error rejection', async () => {
    mockGetClinicsHealth.mockRejectedValue('boom')

    const { result } = renderHook(() => useClinicsHealth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.loadError).toBe('Não foi possível carregar a saúde das clínicas.')
  })

  it('reloads when load() is called again', async () => {
    mockGetClinicsHealth.mockResolvedValue([])
    const { result } = renderHook(() => useClinicsHealth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockGetClinicsHealth.mockResolvedValue([{ clinic: { id: '2', name: 'Clínica B' } }])
    await act(async () => {
      result.current.load()
    })
    await waitFor(() => expect(result.current.rows).toHaveLength(1))
  })
})
