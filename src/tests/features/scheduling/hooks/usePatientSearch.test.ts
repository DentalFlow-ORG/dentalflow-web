import { act, renderHook } from '@testing-library/react'

import { listPatients } from '@/features/patients/services/patients.service'
import type { PatientSummary } from '@/features/patients/types/patients.types'
import { usePatientSearch } from '@/features/scheduling/hooks/usePatientSearch'

vi.mock('@/features/patients/services/patients.service', () => ({
  listPatients: vi.fn(),
}))

const mockedListPatients = vi.mocked(listPatients)

function patient(overrides: Partial<PatientSummary> = {}): PatientSummary {
  return {
    patientId: 'patient-1',
    identifier: 'ana@exemplo.com',
    patientName: 'Ana Martins',
    patientEmail: 'ana@exemplo.com',
    patientPhone: '11987654321',
    totalAppointments: 1,
    completedAppointments: 1,
    canceledAppointments: 0,
    lastVisit: null,
    ...overrides,
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

async function flushDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(300)
  })
}

describe('usePatientSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockedListPatients.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stays idle without querying for a blank search', async () => {
    const { result } = renderHook(() => usePatientSearch('   ', true))
    await flushDebounce()

    expect(result.current.status).toBe('idle')
    expect(mockedListPatients).not.toHaveBeenCalled()
  })

  it('does not query while disabled (a patient is already selected)', async () => {
    const { result } = renderHook(() => usePatientSearch('Ana', false))
    await flushDebounce()

    expect(result.current.status).toBe('idle')
    expect(mockedListPatients).not.toHaveBeenCalled()
  })

  it('waits 300 ms of inactivity before searching, then sends exactly one trimmed query', async () => {
    mockedListPatients.mockResolvedValue({ data: [patient()], total: 1 })
    const { rerender } = renderHook(({ query }) => usePatientSearch(query, true), {
      initialProps: { query: 'A' },
    })

    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    rerender({ query: '  Ana  ' })
    // The earlier keystroke's timer was reset, so nothing has gone out yet.
    await act(async () => {
      vi.advanceTimersByTime(299)
    })
    expect(mockedListPatients).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(1)
    })
    expect(mockedListPatients).toHaveBeenCalledTimes(1)
    expect(mockedListPatients).toHaveBeenCalledWith('Ana')
  })

  it('keeps only rows with a stable patientId', async () => {
    mockedListPatients.mockResolvedValue({
      data: [patient(), patient({ patientId: null, identifier: 'legacy' })],
      total: 2,
    })
    const { result } = renderHook(() => usePatientSearch('Ana', true))

    expect(result.current.status).toBe('loading')
    await flushDebounce()

    expect(result.current.status).toBe('success')
    expect(result.current.results.map((row) => row.patientId)).toEqual(['patient-1'])
  })

  it('reports an error status when the search fails', async () => {
    mockedListPatients.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => usePatientSearch('Ana', true))
    await flushDebounce()

    expect(result.current.status).toBe('error')
    expect(result.current.results).toEqual([])
  })

  it('ignores a slow earlier response that resolves after a newer query', async () => {
    const first = deferred<{ data: PatientSummary[]; total: number }>()
    const second = deferred<{ data: PatientSummary[]; total: number }>()
    mockedListPatients.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    const { result, rerender } = renderHook(({ query }) => usePatientSearch(query, true), {
      initialProps: { query: 'An' },
    })
    await flushDebounce()
    rerender({ query: 'Bruno' })
    await flushDebounce()

    await act(async () => {
      second.resolve({
        data: [patient({ patientId: 'patient-2', patientName: 'Bruno' })],
        total: 1,
      })
    })
    await act(async () => {
      first.resolve({ data: [patient()], total: 1 })
    })

    expect(result.current.results.map((row) => row.patientId)).toEqual(['patient-2'])
    expect(result.current.status).toBe('success')
  })

  it('ignores a slow earlier failure that arrives after a newer query succeeded', async () => {
    const first = deferred<{ data: PatientSummary[]; total: number }>()
    mockedListPatients
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce({ data: [patient({ patientId: 'patient-2' })], total: 1 })

    const { result, rerender } = renderHook(({ query }) => usePatientSearch(query, true), {
      initialProps: { query: 'An' },
    })
    await flushDebounce()
    rerender({ query: 'Bruno' })
    await flushDebounce()
    await act(async () => {
      first.reject(new Error('timeout'))
    })

    expect(result.current.status).toBe('success')
    expect(result.current.results.map((row) => row.patientId)).toEqual(['patient-2'])
  })
})
