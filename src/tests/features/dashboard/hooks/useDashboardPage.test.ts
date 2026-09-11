import { act, renderHook, waitFor } from '@/test-utils/render-utils'

import { useDashboardPage } from '@/features/dashboard/hooks/useDashboardPage'
import type { Appointment } from '@/features/scheduling/types/scheduling.types'

const mockUseAuth = vi.fn()
const mockListAppointments = vi.fn()
const mockGetFinanceSummary = vi.fn()

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))
vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAppointments: (...args: unknown[]) => mockListAppointments(...args),
}))
vi.mock('@/features/finance/services/finance.service', () => ({
  getFinanceSummary: (...args: unknown[]) => mockGetFinanceSummary(...args),
}))

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'appt-1',
    status: 'CONFIRMED',
    startTime: '09:00',
    endTime: '09:30',
    profile: { id: 'prof-1', displayName: 'Dra. Ana' },
    ...overrides,
  } as Appointment
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ user: { role: 'ASSISTANT' } })
  mockListAppointments.mockResolvedValue([])
  mockGetFinanceSummary.mockResolvedValue(null)
})

describe('useDashboardPage', () => {
  it('starts loading and fetches today appointments', async () => {
    const { result } = renderHook(() => useDashboardPage())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockListAppointments).toHaveBeenCalledWith(result.current.today)
  })

  it('does not fetch a finance summary for a non-OWNER user', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ASSISTANT' } })
    const { result } = renderHook(() => useDashboardPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetFinanceSummary).not.toHaveBeenCalled()
    expect(result.current.financeTodaySummary).toBeNull()
  })

  it('fetches a finance summary for an OWNER user', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'OWNER' } })
    mockGetFinanceSummary.mockResolvedValue({
      kpis: { totalIncome: 500, pendingReceivables: 200 },
    })
    const { result } = renderHook(() => useDashboardPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetFinanceSummary).toHaveBeenCalledOnce()
    expect(result.current.financeTodaySummary).toEqual({
      received: 500,
      pendingReceivables: 200,
      expectedTotal: 700,
    })
  })

  it('sets an error message when the fetch fails', async () => {
    mockListAppointments.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useDashboardPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe(
      'Não foi possível carregar os dados do dia. Tente recarregar a página.',
    )
  })

  it('computes status counts from the loaded appointments', async () => {
    mockListAppointments.mockResolvedValue([
      makeAppointment({ id: '1', status: 'CONFIRMED' }),
      makeAppointment({ id: '2', status: 'PENDING' }),
      makeAppointment({ id: '3', status: 'COMPLETED' }),
      makeAppointment({ id: '4', status: 'CANCELED' }),
      makeAppointment({ id: '5', status: 'NO_SHOW' }),
    ])
    const { result } = renderHook(() => useDashboardPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.statusCounts).toEqual({
      total: 5,
      confirmed: 1,
      pending: 1,
      completed: 1,
      canceledOrNoShow: 2,
    })
  })

  it('limits upcoming appointments to PENDING/CONFIRMED, sorted by startTime, max 6', async () => {
    mockListAppointments.mockResolvedValue([
      makeAppointment({ id: '1', status: 'CONFIRMED', startTime: '14:00' }),
      makeAppointment({ id: '2', status: 'PENDING', startTime: '09:00' }),
      makeAppointment({ id: '3', status: 'COMPLETED', startTime: '08:00' }),
      makeAppointment({ id: '4', status: 'CONFIRMED', startTime: '10:00' }),
      makeAppointment({ id: '5', status: 'CONFIRMED', startTime: '11:00' }),
      makeAppointment({ id: '6', status: 'CONFIRMED', startTime: '12:00' }),
      makeAppointment({ id: '7', status: 'CONFIRMED', startTime: '13:00' }),
    ])
    const { result } = renderHook(() => useDashboardPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.upcomingAppointments).toHaveLength(6)
    expect(result.current.upcomingAppointments.map((a) => a.id)).toEqual([
      '2',
      '4',
      '5',
      '6',
      '7',
      '1',
    ])
  })

  it('sorts appointments with a missing startTime first', async () => {
    mockListAppointments.mockResolvedValue([
      makeAppointment({ id: '1', status: 'CONFIRMED', startTime: '09:00' }),
      makeAppointment({ id: '2', status: 'CONFIRMED', startTime: null }),
      makeAppointment({ id: '3', status: 'PENDING', startTime: null }),
    ])
    const { result } = renderHook(() => useDashboardPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.upcomingAppointments.map((a) => a.id)).toEqual(['2', '3', '1'])
  })

  it('deduplicates active dentist names, falling back for a missing profile', async () => {
    mockListAppointments.mockResolvedValue([
      makeAppointment({ id: '1', profile: { id: 'p1', displayName: 'Dra. Ana', userId: 'u1' } }),
      makeAppointment({ id: '2', profile: { id: 'p1', displayName: 'Dra. Ana', userId: 'u1' } }),
      makeAppointment({ id: '3', profile: null }),
    ])
    const { result } = renderHook(() => useDashboardPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.activeDentists).toEqual(['Dra. Ana', 'Profissional não informado'])
  })

  it('sets and clears the drawer appointment', async () => {
    const { result } = renderHook(() => useDashboardPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const appt = makeAppointment()
    act(() => result.current.setDrawerAppointment(appt))
    expect(result.current.drawerAppointment).toBe(appt)

    act(() => result.current.setDrawerAppointment(null))
    expect(result.current.drawerAppointment).toBeNull()
  })
})
