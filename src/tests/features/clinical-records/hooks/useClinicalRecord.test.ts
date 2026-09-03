import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockGetClinicalRecord = vi.fn()
const mockGetClinicalRecordByAppointment = vi.fn()
const mockUpdateClinicalRecord = vi.fn()
const mockCompleteClinicalRecord = vi.fn()
const mockLockClinicalRecord = vi.fn()
const mockCancelClinicalRecord = vi.fn()
const mockRestoreClinicalRecord = vi.fn()

vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  getClinicalRecord: (...args: unknown[]) => mockGetClinicalRecord(...args),
  getClinicalRecordByAppointment: (...args: unknown[]) =>
    mockGetClinicalRecordByAppointment(...args),
  updateClinicalRecord: (...args: unknown[]) => mockUpdateClinicalRecord(...args),
  completeClinicalRecord: (...args: unknown[]) => mockCompleteClinicalRecord(...args),
  lockClinicalRecord: (...args: unknown[]) => mockLockClinicalRecord(...args),
  cancelClinicalRecord: (...args: unknown[]) => mockCancelClinicalRecord(...args),
  restoreClinicalRecord: (...args: unknown[]) => mockRestoreClinicalRecord(...args),
}))

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

import {
  useClinicalRecord,
  useClinicalRecordByAppointment,
} from '@/features/clinical-records/hooks/useClinicalRecord'

function makeRecord(overrides = {}) {
  return { id: 'r1', status: 'DRAFT', ...overrides }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useClinicalRecord — load', () => {
  it('loads the record on mount', async () => {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    const { result } = renderHook(() => useClinicalRecord('r1'))
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.record).toEqual(makeRecord())
  })

  it('sets an error when loading fails', async () => {
    mockGetClinicalRecord.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Não foi possível carregar o prontuário.')
  })

  it('ignores a stale response after unmount', async () => {
    let resolve: (v: unknown) => void = () => {}
    mockGetClinicalRecord.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const { result, unmount } = renderHook(() => useClinicalRecord('r1'))
    unmount()
    resolve(makeRecord())
    expect(result.current.record).toBeNull()
  })
})

describe('useClinicalRecord — save', () => {
  it('does nothing when there is no record yet', async () => {
    mockGetClinicalRecord.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await act(async () => {
      await result.current.save({ chiefComplaint: 'dor' })
    })
    expect(mockUpdateClinicalRecord).not.toHaveBeenCalled()
  })

  it('saves and shows a success alert', async () => {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    mockUpdateClinicalRecord.mockResolvedValue(makeRecord({ chiefComplaint: 'dor' }))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.save({ chiefComplaint: 'dor' })
    })

    expect(result.current.record?.chiefComplaint).toBe('dor')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Prontuário salvo.', tone: 'success' }),
    )
  })

  it('shows an error alert when saving fails', async () => {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    mockUpdateClinicalRecord.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.save({ chiefComplaint: 'dor' })
    })

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao salvar.', tone: 'error' }),
    )
  })
})

describe('useClinicalRecord — saveQuiet', () => {
  it('does nothing when there is no record', async () => {
    mockGetClinicalRecord.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await act(async () => {
      await result.current.saveQuiet({ chiefComplaint: 'x' })
    })
    expect(mockUpdateClinicalRecord).not.toHaveBeenCalled()
  })

  it('updates the record silently without showing an alert', async () => {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    mockUpdateClinicalRecord.mockResolvedValue(makeRecord({ chiefComplaint: 'quiet' }))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.saveQuiet({ chiefComplaint: 'quiet' })
    })

    expect(result.current.record?.chiefComplaint).toBe('quiet')
    expect(mockShowAlert).not.toHaveBeenCalled()
  })

  it('propagates the error so the caller can react', async () => {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    mockUpdateClinicalRecord.mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(result.current.saveQuiet({ chiefComplaint: 'x' })).rejects.toThrow('boom')
  })
})

describe('useClinicalRecord — saveAndComplete', () => {
  it('does nothing when there is no record', async () => {
    mockGetClinicalRecord.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await act(async () => {
      await result.current.saveAndComplete({})
    })
    expect(mockCompleteClinicalRecord).not.toHaveBeenCalled()
  })

  it('skips the update call when the dto is empty, then completes', async () => {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    mockCompleteClinicalRecord.mockResolvedValue(makeRecord({ status: 'COMPLETED' }))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.saveAndComplete({})
    })

    expect(mockUpdateClinicalRecord).not.toHaveBeenCalled()
    expect(result.current.record?.status).toBe('COMPLETED')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Atendimento concluído.', tone: 'success' }),
    )
  })

  it('updates then completes when the dto has fields', async () => {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    mockUpdateClinicalRecord.mockResolvedValue(makeRecord({ chiefComplaint: 'dor' }))
    mockCompleteClinicalRecord.mockResolvedValue(makeRecord({ status: 'COMPLETED' }))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.saveAndComplete({ chiefComplaint: 'dor' })
    })

    expect(mockUpdateClinicalRecord).toHaveBeenCalled()
    expect(mockCompleteClinicalRecord).toHaveBeenCalled()
  })

  it('shows the thrown Error message on failure', async () => {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    mockCompleteClinicalRecord.mockRejectedValue(new Error('regra de negócio violada'))
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.saveAndComplete({})
    })

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro', description: 'regra de negócio violada' }),
    )
  })

  it('shows a generic message when a non-Error is thrown', async () => {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    mockCompleteClinicalRecord.mockRejectedValue('some string error')
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.saveAndComplete({})
    })

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Não foi possível concluir o prontuário.' }),
    )
  })
})

describe('useClinicalRecord — lock / cancel / restore', () => {
  async function loaded() {
    mockGetClinicalRecord.mockResolvedValue(makeRecord())
    const { result } = renderHook(() => useClinicalRecord('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    return result
  }

  it('lock: does nothing without a record, succeeds and shows an alert, fails and shows an alert', async () => {
    mockGetClinicalRecord.mockReturnValue(new Promise(() => {}))
    const { result: unloaded } = renderHook(() => useClinicalRecord('r1'))
    await act(async () => {
      await unloaded.current.lock()
    })
    expect(mockLockClinicalRecord).not.toHaveBeenCalled()

    const result = await loaded()
    mockLockClinicalRecord.mockResolvedValue(makeRecord({ status: 'LOCKED' }))
    await act(async () => {
      await result.current.lock()
    })
    expect(result.current.record?.status).toBe('LOCKED')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Prontuário bloqueado.', tone: 'success' }),
    )

    mockShowAlert.mockClear()
    mockLockClinicalRecord.mockRejectedValue(new Error('fail'))
    await act(async () => {
      await result.current.lock()
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro', tone: 'error' }),
    )
  })

  it('cancel: does nothing without a record, succeeds and shows an alert, fails and shows an alert', async () => {
    mockGetClinicalRecord.mockReturnValue(new Promise(() => {}))
    const { result: unloaded } = renderHook(() => useClinicalRecord('r1'))
    await act(async () => {
      await unloaded.current.cancel()
    })
    expect(mockCancelClinicalRecord).not.toHaveBeenCalled()

    const result = await loaded()
    mockCancelClinicalRecord.mockResolvedValue(makeRecord({ status: 'CANCELED' }))
    await act(async () => {
      await result.current.cancel()
    })
    expect(result.current.record?.status).toBe('CANCELED')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Prontuário cancelado.', tone: 'info' }),
    )

    mockShowAlert.mockClear()
    mockCancelClinicalRecord.mockRejectedValue(new Error('fail'))
    await act(async () => {
      await result.current.cancel()
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro', tone: 'error' }),
    )
  })

  it('restore: does nothing without a record, succeeds and shows an alert, fails and shows an alert', async () => {
    mockGetClinicalRecord.mockReturnValue(new Promise(() => {}))
    const { result: unloaded } = renderHook(() => useClinicalRecord('r1'))
    await act(async () => {
      await unloaded.current.restore()
    })
    expect(mockRestoreClinicalRecord).not.toHaveBeenCalled()

    const result = await loaded()
    mockRestoreClinicalRecord.mockResolvedValue(makeRecord({ status: 'DRAFT' }))
    await act(async () => {
      await result.current.restore()
    })
    expect(result.current.record?.status).toBe('DRAFT')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Prontuário restaurado.', tone: 'success' }),
    )

    mockShowAlert.mockClear()
    mockRestoreClinicalRecord.mockRejectedValue(new Error('fail'))
    await act(async () => {
      await result.current.restore()
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro', tone: 'error' }),
    )
  })
})

describe('useClinicalRecordByAppointment', () => {
  it('loads the record by appointment id', async () => {
    mockGetClinicalRecordByAppointment.mockResolvedValue(makeRecord())
    const { result } = renderHook(() => useClinicalRecordByAppointment('a1'))
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.record).toEqual(makeRecord())
  })

  it('sets an error on failure', async () => {
    mockGetClinicalRecordByAppointment.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useClinicalRecordByAppointment('a1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Não foi possível carregar o prontuário.')
  })

  it('ignores a stale response after unmount', async () => {
    let resolve: (v: unknown) => void = () => {}
    mockGetClinicalRecordByAppointment.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const { result, unmount } = renderHook(() => useClinicalRecordByAppointment('a1'))
    unmount()
    resolve(makeRecord())
    expect(result.current.record).toBeNull()
  })
})
