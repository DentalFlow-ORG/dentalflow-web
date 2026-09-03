import { renderHook, waitFor } from '@/test-utils/render-utils'

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
    expect(mockGetHistory).toHaveBeenCalledWith('a@clinica.com')
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
    expect(mockGetHistory).toHaveBeenCalledWith('b@clinica.com')
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
