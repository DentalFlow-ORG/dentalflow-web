import { useAppointmentStatusChange } from '@/features/scheduling/hooks/useAppointmentStatusChange'
import { updateAppointmentStatus } from '@/features/scheduling/services/scheduling.service'
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
  updateAppointmentStatus: vi.fn(),
}))

let setAppointments: ReturnType<typeof vi.fn>
let setDrawerAppointment: ReturnType<typeof vi.fn>
let setIsActionLoading: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  setAppointments = vi.fn()
  setDrawerAppointment = vi.fn()
  setIsActionLoading = vi.fn()
})

function renderHookWithDrawer(drawerAppointment: Appointment | null = null) {
  return renderHook(() =>
    useAppointmentStatusChange({
      setAppointments: setAppointments as unknown as Dispatch<SetStateAction<Appointment[]>>,
      drawerAppointment,
      setDrawerAppointment: setDrawerAppointment as unknown as (appt: Appointment | null) => void,
      setIsActionLoading: setIsActionLoading as unknown as Dispatch<SetStateAction<boolean>>,
    }),
  )
}

// ─── service call ─────────────────────────────────────────────────────────────

describe('service call', () => {
  it('calls updateAppointmentStatus with the given id and status', async () => {
    vi.mocked(updateAppointmentStatus).mockResolvedValue(makeAppointment())
    const { result } = renderHookWithDrawer()
    await act(async () => {
      await result.current.handleStatusChange('appt-1', 'CONFIRMED')
    })
    expect(updateAppointmentStatus).toHaveBeenCalledWith('appt-1', { status: 'CONFIRMED' })
  })
})

// ─── state update ─────────────────────────────────────────────────────────────

describe('state update', () => {
  it('passes setAppointments a mapper that replaces only the matching appointment', async () => {
    const updated = makeAppointment({ id: 'appt-1', status: 'CONFIRMED' })
    vi.mocked(updateAppointmentStatus).mockResolvedValue(updated)
    const { result } = renderHookWithDrawer()
    await act(async () => {
      await result.current.handleStatusChange('appt-1', 'CONFIRMED')
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
    const updated = makeAppointment({ id: 'appt-1', status: 'CONFIRMED' })
    vi.mocked(updateAppointmentStatus).mockResolvedValue(updated)
    const { result } = renderHookWithDrawer(makeAppointment({ id: 'appt-1' }))
    await act(async () => {
      await result.current.handleStatusChange('appt-1', 'CONFIRMED')
    })
    expect(setDrawerAppointment).toHaveBeenCalledWith(updated)
  })

  it('does not call setDrawerAppointment when drawerAppointment is null', async () => {
    vi.mocked(updateAppointmentStatus).mockResolvedValue(makeAppointment())
    const { result } = renderHookWithDrawer(null)
    await act(async () => {
      await result.current.handleStatusChange('appt-1', 'CONFIRMED')
    })
    expect(setDrawerAppointment).not.toHaveBeenCalled()
  })

  it('does not call setDrawerAppointment when drawer appointment id differs', async () => {
    vi.mocked(updateAppointmentStatus).mockResolvedValue(makeAppointment({ id: 'appt-1' }))
    const { result } = renderHookWithDrawer(makeAppointment({ id: 'appt-99' }))
    await act(async () => {
      await result.current.handleStatusChange('appt-1', 'CONFIRMED')
    })
    expect(setDrawerAppointment).not.toHaveBeenCalled()
  })
})

// ─── alerts ───────────────────────────────────────────────────────────────────

describe('alerts', () => {
  it('shows a success alert when the status update succeeds', async () => {
    vi.mocked(updateAppointmentStatus).mockResolvedValue(makeAppointment())
    const { result } = renderHookWithDrawer()
    await act(async () => {
      await result.current.handleStatusChange('appt-1', 'CONFIRMED')
    })
    expect(mockShowAlert).toHaveBeenCalledWith({ title: 'Status atualizado', tone: 'success' })
  })

  it('shows an error alert with the error description when the status update fails', async () => {
    vi.mocked(updateAppointmentStatus).mockRejectedValue(new Error('Appointment not found'))
    const { result } = renderHookWithDrawer()
    await act(async () => {
      await result.current.handleStatusChange('appt-1', 'CONFIRMED')
    })
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Erro ao atualizar status',
      description: 'Appointment not found',
      tone: 'error',
    })
  })
})

// ─── loading flag ─────────────────────────────────────────────────────────────

describe('loading flag', () => {
  it('sets isActionLoading(true) while pending and isActionLoading(false) after success', async () => {
    let resolveStatus!: (appt: Appointment) => void
    vi.mocked(updateAppointmentStatus).mockImplementation(
      () =>
        new Promise<Appointment>((r) => {
          resolveStatus = r
        }),
    )
    const { result } = renderHookWithDrawer()

    // handleStatusChange sets loading(true) synchronously before its first await
    const callPromise = result.current.handleStatusChange('appt-1', 'CONFIRMED')
    expect(setIsActionLoading).toHaveBeenCalledWith(true)
    expect(setIsActionLoading).toHaveBeenCalledTimes(1)

    resolveStatus(makeAppointment({ id: 'appt-1', status: 'CONFIRMED' }))
    await act(async () => {
      await callPromise
    })

    expect(setIsActionLoading).toHaveBeenLastCalledWith(false)
  })

  it('sets isActionLoading(false) in the finally block after an error', async () => {
    vi.mocked(updateAppointmentStatus).mockRejectedValue(new Error('fail'))
    const { result } = renderHookWithDrawer()
    await act(async () => {
      await result.current.handleStatusChange('appt-1', 'CONFIRMED')
    })
    expect(setIsActionLoading).toHaveBeenCalledWith(true)
    expect(setIsActionLoading).toHaveBeenLastCalledWith(false)
  })
})
