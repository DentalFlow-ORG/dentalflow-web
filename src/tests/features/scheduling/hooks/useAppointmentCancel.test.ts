import { useAppointmentCancel } from '@/features/scheduling/hooks/useAppointmentCancel'
import { cancelAppointment } from '@/features/scheduling/services/scheduling.service'
import type { Appointment } from '@/features/scheduling/types/scheduling.types'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { act, renderHook } from '@testing-library/react'
import type { Dispatch, SetStateAction } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockShowAlert = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  cancelAppointment: vi.fn(),
}))

let setAppointments: ReturnType<typeof vi.fn>
let setDrawerAppointment: ReturnType<typeof vi.fn>
let setIsActionLoading: ReturnType<typeof vi.fn>
let setCancelTarget: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  setAppointments = vi.fn()
  setDrawerAppointment = vi.fn()
  setIsActionLoading = vi.fn()
  setCancelTarget = vi.fn()
})

function renderHookWithCancel(
  cancelTarget: Appointment | null = null,
  drawerAppointment: Appointment | null = null,
) {
  return renderHook(() =>
    useAppointmentCancel({
      setAppointments: setAppointments as unknown as Dispatch<SetStateAction<Appointment[]>>,
      drawerAppointment,
      setDrawerAppointment: setDrawerAppointment as unknown as (appt: Appointment | null) => void,
      setIsActionLoading: setIsActionLoading as unknown as Dispatch<SetStateAction<boolean>>,
      cancelTarget,
      setCancelTarget: setCancelTarget as unknown as (appt: Appointment | null) => void,
    }),
  )
}

// ─── handleCancelRequest ──────────────────────────────────────────────────────

describe('handleCancelRequest', () => {
  it('calls setCancelTarget with the given appointment', () => {
    const appt = makeAppointment({ id: 'appt-1' })
    const { result } = renderHookWithCancel()
    act(() => {
      result.current.handleCancelRequest(appt)
    })
    expect(setCancelTarget).toHaveBeenCalledWith(appt)
  })
})

// ─── service call ─────────────────────────────────────────────────────────────

describe('service call', () => {
  it('calls cancelAppointment with the cancelTarget id and the given reason', async () => {
    vi.mocked(cancelAppointment).mockResolvedValue(makeAppointment())
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }))
    await act(async () => {
      await result.current.handleCancelConfirm('Paciente cancelou')
    })
    expect(cancelAppointment).toHaveBeenCalledWith('appt-1', 'Paciente cancelou')
  })

  it('passes undefined as reason when an empty string is provided', async () => {
    vi.mocked(cancelAppointment).mockResolvedValue(makeAppointment())
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }))
    await act(async () => {
      await result.current.handleCancelConfirm('')
    })
    expect(cancelAppointment).toHaveBeenCalledWith('appt-1', undefined)
  })

  it('does nothing when cancelTarget is null', async () => {
    const { result } = renderHookWithCancel(null)
    await act(async () => {
      await result.current.handleCancelConfirm('reason')
    })
    expect(cancelAppointment).not.toHaveBeenCalled()
    expect(setIsActionLoading).not.toHaveBeenCalled()
  })
})

// ─── state update ─────────────────────────────────────────────────────────────

describe('state update', () => {
  it('passes setAppointments a mapper that replaces only the matching appointment', async () => {
    const updated = makeAppointment({ id: 'appt-1', status: 'CANCELED' })
    vi.mocked(cancelAppointment).mockResolvedValue(updated)
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }))
    await act(async () => {
      await result.current.handleCancelConfirm('No show')
    })

    expect(setAppointments).toHaveBeenCalledWith(expect.any(Function))
    const mapper = setAppointments.mock.calls[0][0] as (prev: Appointment[]) => Appointment[]
    const original = makeAppointment({ id: 'appt-1' })
    const other = makeAppointment({ id: 'appt-2' })
    const mapped = mapper([original, other])
    expect(mapped[0]).toBe(updated)
    expect(mapped[1]).toBe(other)
  })
})

// ─── drawer sync ──────────────────────────────────────────────────────────────

describe('drawer sync', () => {
  it('calls setDrawerAppointment with the updated appointment when ids match', async () => {
    const updated = makeAppointment({ id: 'appt-1', status: 'CANCELED' })
    vi.mocked(cancelAppointment).mockResolvedValue(updated)
    const { result } = renderHookWithCancel(
      makeAppointment({ id: 'appt-1' }),
      makeAppointment({ id: 'appt-1' }),
    )
    await act(async () => {
      await result.current.handleCancelConfirm('reason')
    })
    expect(setDrawerAppointment).toHaveBeenCalledWith(updated)
  })

  it('does not call setDrawerAppointment when drawerAppointment is null', async () => {
    vi.mocked(cancelAppointment).mockResolvedValue(makeAppointment({ id: 'appt-1' }))
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }), null)
    await act(async () => {
      await result.current.handleCancelConfirm('reason')
    })
    expect(setDrawerAppointment).not.toHaveBeenCalled()
  })

  it('does not call setDrawerAppointment when drawer appointment id differs', async () => {
    vi.mocked(cancelAppointment).mockResolvedValue(makeAppointment({ id: 'appt-1' }))
    const { result } = renderHookWithCancel(
      makeAppointment({ id: 'appt-1' }),
      makeAppointment({ id: 'appt-99' }),
    )
    await act(async () => {
      await result.current.handleCancelConfirm('reason')
    })
    expect(setDrawerAppointment).not.toHaveBeenCalled()
  })
})

// ─── cancel target cleared ────────────────────────────────────────────────────

describe('cancel target cleared', () => {
  it('calls setCancelTarget(null) after a successful cancel', async () => {
    vi.mocked(cancelAppointment).mockResolvedValue(makeAppointment())
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }))
    await act(async () => {
      await result.current.handleCancelConfirm('reason')
    })
    expect(setCancelTarget).toHaveBeenCalledWith(null)
  })

  it('does not call setCancelTarget when the cancel request fails', async () => {
    vi.mocked(cancelAppointment).mockRejectedValue(new Error('fail'))
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }))
    await act(async () => {
      await result.current.handleCancelConfirm('reason')
    })
    expect(setCancelTarget).not.toHaveBeenCalled()
  })
})

// ─── alerts ───────────────────────────────────────────────────────────────────

describe('alerts', () => {
  it('shows a success alert when the cancel succeeds', async () => {
    vi.mocked(cancelAppointment).mockResolvedValue(makeAppointment())
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }))
    await act(async () => {
      await result.current.handleCancelConfirm('reason')
    })
    expect(mockShowAlert).toHaveBeenCalledWith({ title: 'Agendamento cancelado', tone: 'success' })
  })

  it('shows an error alert with the error description when the cancel fails', async () => {
    vi.mocked(cancelAppointment).mockRejectedValue(new Error('Appointment not found'))
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }))
    await act(async () => {
      await result.current.handleCancelConfirm('reason')
    })
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Erro ao cancelar agendamento',
      description: 'Appointment not found',
      tone: 'error',
    })
  })
})

// ─── loading flag ─────────────────────────────────────────────────────────────

describe('loading flag', () => {
  it('sets isActionLoading(true) while pending and isActionLoading(false) after success', async () => {
    let resolveCancel!: (appt: Appointment) => void
    vi.mocked(cancelAppointment).mockImplementation(
      () =>
        new Promise<Appointment>((r) => {
          resolveCancel = r
        }),
    )
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }))

    const callPromise = result.current.handleCancelConfirm('reason')
    expect(setIsActionLoading).toHaveBeenCalledWith(true)
    expect(setIsActionLoading).toHaveBeenCalledTimes(1)

    resolveCancel(makeAppointment({ id: 'appt-1', status: 'CANCELED' }))
    await act(async () => {
      await callPromise
    })

    expect(setIsActionLoading).toHaveBeenLastCalledWith(false)
  })

  it('sets isActionLoading(false) in the finally block after an error', async () => {
    vi.mocked(cancelAppointment).mockRejectedValue(new Error('fail'))
    const { result } = renderHookWithCancel(makeAppointment({ id: 'appt-1' }))
    await act(async () => {
      await result.current.handleCancelConfirm('reason')
    })
    expect(setIsActionLoading).toHaveBeenCalledWith(true)
    expect(setIsActionLoading).toHaveBeenLastCalledWith(false)
  })
})
