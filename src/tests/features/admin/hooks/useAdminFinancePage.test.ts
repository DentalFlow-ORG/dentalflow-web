import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockGetSummary = vi.fn()
const mockListPlans = vi.fn()
const mockListSubscriptions = vi.fn()
const mockListEvents = vi.fn()
vi.mock('@/features/admin/services/admin-finance.service', () => ({
  getAdminFinanceSummary: (...args: unknown[]) => mockGetSummary(...args),
  listAdminFinancePlans: (...args: unknown[]) => mockListPlans(...args),
  listAdminFinanceSubscriptions: (...args: unknown[]) => mockListSubscriptions(...args),
  listAdminFinanceStripeEvents: (...args: unknown[]) => mockListEvents(...args),
}))

import { useAdminFinancePage } from '@/features/admin/hooks/useAdminFinancePage'
import type { AdminSubscriptionStatus } from '@/features/admin/types/admin-finance.types'

const EMPTY_PAGE = { data: [], total: 0, page: 1, limit: 10 }

beforeEach(() => {
  mockShowAlert.mockReset()
  mockGetSummary.mockReset().mockResolvedValue({ totalClinics: 5 })
  mockListPlans.mockReset().mockResolvedValue([{ id: 'p1', name: 'Pro' }])
  mockListSubscriptions.mockReset().mockResolvedValue(EMPTY_PAGE)
  mockListEvents.mockReset().mockResolvedValue(EMPTY_PAGE)
})

async function renderLoaded() {
  const hook = renderHook(() => useAdminFinancePage())
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false))
  return hook
}

describe('useAdminFinancePage — initial load', () => {
  it('loads summary, plans, subscriptions and events on mount', async () => {
    mockListSubscriptions.mockResolvedValue({ data: [{ id: 's1' }], total: 1, page: 1, limit: 10 })
    const { result } = await renderLoaded()
    expect(result.current.summary).toEqual({ totalClinics: 5 })
    expect(result.current.plans).toEqual([{ id: 'p1', name: 'Pro' }])
    expect(result.current.subscriptions).toHaveLength(1)
  })

  it('derives planOptions from plans', async () => {
    const { result } = await renderLoaded()
    expect(result.current.planOptions).toEqual([{ value: 'p1', label: 'Pro' }])
  })

  it('sets loadError and shows an alert when the initial load fails', async () => {
    mockGetSummary.mockRejectedValue(new Error('offline'))
    const { result } = await renderLoaded()
    expect(result.current.loadError).toBe('offline')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao carregar gestão financeira', tone: 'error' }),
    )
  })

  it('uses a generic message when the initial load fails with a non-Error', async () => {
    mockGetSummary.mockRejectedValue('boom')
    const { result } = await renderLoaded()
    expect(result.current.loadError).toBe('Não foi possível carregar os dados financeiros.')
  })

  it('does not update state after unmount', async () => {
    let resolveSummary: (value: unknown) => void = () => {}
    mockGetSummary.mockReturnValue(
      new Promise((resolve) => {
        resolveSummary = resolve
      }),
    )
    const { unmount } = renderHook(() => useAdminFinancePage())
    unmount()
    expect(() => resolveSummary({ totalClinics: 1 })).not.toThrow()
  })
})

describe('useAdminFinancePage — subscription filters', () => {
  it('reloads subscriptions when setSubscriptionFilter changes a field, resetting to page 1', async () => {
    const { result } = await renderLoaded()
    mockListSubscriptions.mockResolvedValue({
      data: [{ id: 's-active' }],
      total: 1,
      page: 1,
      limit: 10,
    })
    act(() => result.current.setSubscriptionFilter('status', 'ACTIVE'))
    await waitFor(() => expect(result.current.subscriptions).toHaveLength(1))
    expect(result.current.subscriptionFilters).toEqual(
      expect.objectContaining({ status: 'ACTIVE', page: 1 }),
    )
  })

  it('clears a filter field to undefined when given a falsy value', async () => {
    const { result } = await renderLoaded()
    act(() => result.current.setSubscriptionFilter('status', 'ACTIVE'))
    await waitFor(() => expect(mockListSubscriptions).toHaveBeenCalledTimes(2))
    act(() => result.current.setSubscriptionFilter('status', '' as AdminSubscriptionStatus))
    await waitFor(() => expect(mockListSubscriptions).toHaveBeenCalledTimes(3))
    expect(result.current.subscriptionFilters.status).toBeUndefined()
  })

  it('shows an alert with the Error message when the subscription reload fails', async () => {
    const { result } = await renderLoaded()
    mockListSubscriptions.mockRejectedValue(new Error('falha nas assinaturas'))
    act(() => result.current.setSubscriptionFilter('status', 'ACTIVE'))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro ao carregar assinaturas',
          description: 'falha nas assinaturas',
        }),
      ),
    )
  })

  it('shows a generic alert message when the subscription reload fails with a non-Error', async () => {
    const { result } = await renderLoaded()
    mockListSubscriptions.mockRejectedValue('boom')
    act(() => result.current.setSubscriptionFilter('status', 'ACTIVE'))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Não foi possível carregar assinaturas.' }),
      ),
    )
  })

  it('computes subscriptionsTotalPages from total and limit', async () => {
    mockListSubscriptions.mockResolvedValue({ data: [], total: 25, page: 1, limit: 10 })
    const { result } = await renderLoaded()
    expect(result.current.subscriptionsTotalPages).toBe(3)
  })

  it('subscriptionsTotalPages is at least 1', async () => {
    const { result } = await renderLoaded()
    expect(result.current.subscriptionsTotalPages).toBe(1)
  })
})

describe('useAdminFinancePage — event filters', () => {
  it('reloads events when setEventFilter changes a field', async () => {
    const { result } = await renderLoaded()
    mockListEvents.mockResolvedValue({ data: [{ id: 'e1' }], total: 1, page: 1, limit: 10 })
    act(() => result.current.setEventFilter('type', 'invoice.paid'))
    await waitFor(() => expect(result.current.events).toHaveLength(1))
  })

  it('shows an alert with the Error message when the event reload fails', async () => {
    const { result } = await renderLoaded()
    mockListEvents.mockRejectedValue(new Error('falha nos eventos'))
    act(() => result.current.setEventFilter('type', 'invoice.paid'))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro ao carregar eventos Stripe',
          description: 'falha nos eventos',
        }),
      ),
    )
  })

  it('shows a generic alert message when the event reload fails with a non-Error', async () => {
    const { result } = await renderLoaded()
    mockListEvents.mockRejectedValue('boom')
    act(() => result.current.setEventFilter('type', 'invoice.paid'))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Não foi possível carregar eventos Stripe.' }),
      ),
    )
  })

  it('computes eventsTotalPages from total and limit', async () => {
    mockListEvents.mockResolvedValue({ data: [], total: 15, page: 1, limit: 10 })
    const { result } = await renderLoaded()
    expect(result.current.eventsTotalPages).toBe(2)
  })
})

describe('useAdminFinancePage — manual load()', () => {
  it('reloads all data and applies it, using current filters', async () => {
    const { result } = await renderLoaded()
    mockGetSummary.mockResolvedValue({ totalClinics: 9 })
    act(() => result.current.load())
    await waitFor(() => expect(result.current.summary).toEqual({ totalClinics: 9 }))
    expect(result.current.isLoading).toBe(false)
  })

  it('sets loadError and shows an alert when load() fails', async () => {
    const { result } = await renderLoaded()
    mockGetSummary.mockRejectedValue(new Error('erro ao recarregar'))
    act(() => result.current.load())
    await waitFor(() => expect(result.current.loadError).toBe('erro ao recarregar'))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao carregar gestão financeira' }),
    )
  })
})
