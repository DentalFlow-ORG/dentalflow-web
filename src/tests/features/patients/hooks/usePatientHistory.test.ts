import { act, renderHook, waitFor } from '@/test-utils/render-utils'

import { usePatientHistory } from '@/features/patients/hooks/usePatientHistory'
import type { PatientAppointment, PatientSummary } from '@/features/patients/types/patients.types'
import { ApiError } from '@/services/http'

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

vi.mock('@/features/patients/services/patients.service', () => ({
  getPatientHistory: vi.fn(),
}))

import { getPatientHistory } from '@/features/patients/services/patients.service'

const mockGetHistory = vi.mocked(getPatientHistory)

function makePatient(overrides: Partial<PatientSummary> = {}): PatientSummary {
  return {
    patientId: null,
    identifier: 'a@clinica.com',
    patientName: 'Ana',
    patientEmail: 'a@clinica.com',
    patientPhone: null,
    totalAppointments: 2,
    completedAppointments: 1,
    canceledAppointments: 0,
    lastVisit: null,
    ...overrides,
  }
}

function makeAppointment(overrides: Partial<PatientAppointment> = {}): PatientAppointment {
  return {
    id: 'appt-1',
    appointmentDate: '2026-06-01',
    startTime: '09:00',
    endTime: '09:30',
    status: 'COMPLETED',
    patientName: 'Ana',
    patientEmail: 'a@clinica.com',
    patientPhone: null,
    notes: null,
    service: null,
    profile: null,
    ...overrides,
  }
}

describe('usePatientHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty appointments and isLoading=false when patient is null', () => {
    const { result } = renderHook(() => usePatientHistory(null))
    expect(result.current.appointments).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('loads and returns appointments for the given patient', async () => {
    mockGetHistory.mockResolvedValue({ appointments: [makeAppointment()] })
    const { result } = renderHook(() => usePatientHistory(makePatient()))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.appointments).toHaveLength(1)
    expect(mockGetHistory).toHaveBeenCalledWith('a@clinica.com', null)
  })

  it('shows an ApiError message and falls back to empty appointments on failure', async () => {
    mockGetHistory.mockRejectedValue(new ApiError('Histórico indisponível.', 500, null))
    const { result } = renderHook(() => usePatientHistory(makePatient()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.appointments).toEqual([])
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Erro',
      description: 'Histórico indisponível.',
      tone: 'error',
    })
  })

  it('shows a generic error message for a non-ApiError failure', async () => {
    mockGetHistory.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => usePatientHistory(makePatient()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Erro ao carregar histórico.' }),
    )
  })

  it('re-fetches when the patient identifier changes', async () => {
    mockGetHistory.mockResolvedValue({ appointments: [makeAppointment({ id: 'a1' })] })
    const { result, rerender } = renderHook(({ patient }) => usePatientHistory(patient), {
      initialProps: { patient: makePatient({ identifier: 'a@clinica.com' }) },
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockGetHistory.mockResolvedValue({ appointments: [makeAppointment({ id: 'b1' })] })
    rerender({ patient: makePatient({ identifier: 'b@clinica.com' }) })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.appointments[0].id).toBe('b1')
    expect(mockGetHistory).toHaveBeenCalledWith('b@clinica.com', null)
  })

  it('discards a stale response when the patient changes before it resolves', async () => {
    let resolveFirst: (value: { appointments: PatientAppointment[] }) => void = () => {}
    mockGetHistory.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve
        }),
    )
    const { result, rerender, unmount } = renderHook(({ patient }) => usePatientHistory(patient), {
      initialProps: { patient: makePatient({ identifier: 'a@clinica.com' }) },
    })

    mockGetHistory.mockResolvedValueOnce({ appointments: [makeAppointment({ id: 'b1' })] })
    rerender({ patient: makePatient({ identifier: 'b@clinica.com' }) })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    resolveFirst({ appointments: [makeAppointment({ id: 'a1' })] })
    // Give the stale promise a tick to (not) apply its effect.
    await Promise.resolve()

    expect(result.current.appointments[0].id).toBe('b1')
    unmount()
  })

  it('does nothing on unmount while a request is in flight', () => {
    mockGetHistory.mockImplementation(() => new Promise(() => {}))
    const { unmount } = renderHook(() => usePatientHistory(makePatient()))
    expect(() => unmount()).not.toThrow()
  })
})

// ── Two patients sharing one contact identifier ───────────────────────────────

describe('usePatientHistory — two patients sharing an email address', () => {
  it.each([
    ['A', 'B'],
    ['B', 'A'],
  ])('isolates %s and %s through loading and a late response', async (first, second) => {
    let finish!: (value: { appointments: PatientAppointment[] }) => void
    mockGetHistory
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finish = resolve
        }),
      )
      .mockResolvedValueOnce({ appointments: [makeAppointment({ id: second })] })
    const { result, rerender } = renderHook(
      ({ id }) =>
        usePatientHistory(
          makePatient({ patientId: id, identifier: 'same@example.test', patientName: 'Same Name' }),
        ),
      { initialProps: { id: first } },
    )
    rerender({ id: second })
    expect(result.current.appointments).toEqual([])
    await waitFor(() => expect(result.current.appointments[0]?.id).toBe(second))
    await act(async () => {
      finish({ appointments: [makeAppointment({ id: first })] })
    })
    expect(result.current.appointments[0]?.id).toBe(second)
  })
  const SHARED = 'familia@clinica.com'

  const marta = makePatient({
    patientId: 'patient-a',
    identifier: SHARED,
    patientName: 'Marta Lima',
  })
  const pedro = makePatient({
    patientId: 'patient-b',
    identifier: SHARED,
    patientName: 'Pedro Lima',
  })

  it('does not show one patient appointments under the other while loading', async () => {
    // Regression: the cached history was keyed on the contact identifier, which
    // a household shares. Switching patients kept the previous person's
    // appointments on screen with isLoading already false, so they read as the
    // new patient's real history.
    mockGetHistory.mockResolvedValue({ appointments: [makeAppointment({ id: 'appt-marta' })] })
    const { result, rerender } = renderHook(
      ({ patient }: { patient: PatientSummary }) => usePatientHistory(patient),
      { initialProps: { patient: marta } },
    )
    await waitFor(() => expect(result.current.appointments).toHaveLength(1))

    let resolvePedro: (value: { appointments: PatientAppointment[] }) => void = () => {}
    mockGetHistory.mockReturnValue(
      new Promise((resolve) => {
        resolvePedro = resolve
      }),
    )
    rerender({ patient: pedro })

    // Pedro's request is still in flight: Marta's appointments must be gone.
    expect(result.current.appointments).toEqual([])
    expect(result.current.isLoading).toBe(true)

    resolvePedro({ appointments: [makeAppointment({ id: 'appt-pedro' })] })
    await waitFor(() => expect(result.current.appointments).toHaveLength(1))
    expect(result.current.appointments[0].id).toBe('appt-pedro')
  })

  it('refetches with the new identity even though the identifier is unchanged', async () => {
    mockGetHistory.mockResolvedValue({ appointments: [] })
    const { rerender } = renderHook(
      ({ patient }: { patient: PatientSummary }) => usePatientHistory(patient),
      { initialProps: { patient: marta } },
    )
    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledWith(SHARED, 'patient-a'))

    rerender({ patient: pedro })

    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledWith(SHARED, 'patient-b'))
  })
})
