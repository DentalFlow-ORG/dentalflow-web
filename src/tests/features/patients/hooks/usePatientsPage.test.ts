import { act } from '@testing-library/react'

import { renderHook, waitFor } from '@/test-utils/render-utils'

import { usePatientsPage } from '@/features/patients/hooks/usePatientsPage'
import type { PatientSummary } from '@/features/patients/types/patients.types'
import { ApiError } from '@/services/http'

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

vi.mock('@/features/patients/services/patients.service', () => ({
  listPatients: vi.fn(),
}))

const mockSetCachedAvatar = vi.fn()
vi.mock('@/features/patients/hooks/usePatientAvatar', () => ({
  setCachedPatientAvatar: (...args: unknown[]) => mockSetCachedAvatar(...args),
  // The pre-warm keys on identity so two patients sharing an email address do
  // not overwrite each other's cached avatar.
  patientAvatarCacheKey: (identifier: string | null, patientId?: string | null) =>
    patientId ?? identifier,
}))

import { listPatients } from '@/features/patients/services/patients.service'

const mockListPatients = vi.mocked(listPatients)

function makePatient(overrides: Partial<PatientSummary> = {}): PatientSummary {
  return {
    patientId: null,
    identifier: 'a@clinica.com',
    patientName: 'Ana',
    patientEmail: 'a@clinica.com',
    patientPhone: null,
    totalAppointments: 1,
    completedAppointments: 1,
    canceledAppointments: 0,
    lastVisit: '2026-06-10',
    avatarUrl: null,
    ...overrides,
  }
}

describe('usePatientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListPatients.mockResolvedValue({ data: [], total: 0 })
  })

  it('loads patients on mount and pre-warms the avatar cache', async () => {
    mockListPatients.mockResolvedValue({
      data: [makePatient({ identifier: 'a@clinica.com', avatarUrl: 'url-a' })],
      total: 1,
    })
    const { result } = renderHook(() => usePatientsPage())

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.patients).toHaveLength(1)
    expect(mockSetCachedAvatar).toHaveBeenCalledWith('a@clinica.com', 'url-a')
  })

  it('shows an error and preserves an empty list on load failure', async () => {
    mockListPatients.mockRejectedValue(new ApiError('Falha ao buscar.', 500, null))
    const { result } = renderHook(() => usePatientsPage())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Falha ao buscar.')
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Erro ao carregar pacientes',
      description: 'Falha ao buscar.',
      tone: 'error',
    })
  })

  it('shows a generic error message for a non-ApiError failure', async () => {
    mockListPatients.mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => usePatientsPage())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Erro ao carregar pacientes.')
  })

  it('debounces search input and resets to page 1', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePatientsPage())
    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })
    mockListPatients.mockClear()

    act(() => result.current.setPage(3))
    act(() => result.current.handleSearchChange('ana'))
    expect(result.current.search).toBe('ana')
    expect(result.current.page).toBe(1)
    expect(mockListPatients).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(400)
      await vi.runOnlyPendingTimersAsync()
    })
    expect(mockListPatients).toHaveBeenCalledWith('ana')
    vi.useRealTimers()
  })

  it('clears the pending debounce timer when search changes again quickly', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePatientsPage())
    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })
    mockListPatients.mockClear()

    act(() => result.current.handleSearchChange('a'))
    act(() => vi.advanceTimersByTime(200))
    act(() => result.current.handleSearchChange('ab'))
    await act(async () => {
      vi.advanceTimersByTime(400)
      await vi.runOnlyPendingTimersAsync()
    })

    expect(mockListPatients).toHaveBeenCalledTimes(1)
    expect(mockListPatients).toHaveBeenCalledWith('ab')
    vi.useRealTimers()
  })

  it('filters patients by dateFrom and dateTo', async () => {
    mockListPatients.mockResolvedValue({
      data: [
        makePatient({ identifier: 'a', lastVisit: '2026-06-01' }),
        makePatient({ identifier: 'b', lastVisit: '2026-06-15' }),
        makePatient({ identifier: 'c', lastVisit: '2026-06-30' }),
      ],
      total: 3,
    })
    const { result } = renderHook(() => usePatientsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleDateFromChange('2026-06-05'))
    act(() => result.current.handleDateToChange('2026-06-20'))

    expect(result.current.filteredPatients.map((p) => p.identifier)).toEqual(['b'])
    expect(result.current.hasFilters).toBe(true)
  })

  it('does not filter out patients with no lastVisit when a date range is set', async () => {
    mockListPatients.mockResolvedValue({
      data: [makePatient({ identifier: 'a', lastVisit: null })],
      total: 1,
    })
    const { result } = renderHook(() => usePatientsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleDateFromChange('2026-06-05'))
    expect(result.current.filteredPatients).toHaveLength(1)
  })

  it('paginates the filtered list and clamps the current page', async () => {
    mockListPatients.mockResolvedValue({
      data: Array.from({ length: 12 }, (_, i) => makePatient({ identifier: `p${i}` })),
      total: 12,
    })
    const { result } = renderHook(() => usePatientsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setPageSize(10))
    expect(result.current.totalPages).toBe(2)
    expect(result.current.paginatedPatients).toHaveLength(10)

    act(() => result.current.setPage(5))
    expect(result.current.page).toBe(2)
    expect(result.current.paginatedPatients).toHaveLength(2)
  })

  it('sets and clears the selected patient', async () => {
    const { result } = renderHook(() => usePatientsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const patient = makePatient()
    act(() => result.current.setSelectedPatient(patient))
    expect(result.current.selectedPatient).toEqual(patient)

    act(() => result.current.setSelectedPatient(null))
    expect(result.current.selectedPatient).toBeNull()
  })

  it('reloads with the current debounced search on handleRefresh', async () => {
    const { result } = renderHook(() => usePatientsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    mockListPatients.mockClear()

    act(() => result.current.handleRefresh())
    expect(mockListPatients).toHaveBeenCalledWith(undefined)
  })

  it('clears the debounce timer on unmount', async () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() => usePatientsPage())
    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })
    act(() => result.current.handleSearchChange('x'))
    expect(() => unmount()).not.toThrow()
    vi.useRealTimers()
  })
})
