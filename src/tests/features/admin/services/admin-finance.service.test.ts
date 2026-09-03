import { apiRequest } from '@/services/http'

vi.mock('@/services/http', () => ({ apiRequest: vi.fn() }))
vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => 'token-123',
}))

import {
  getAdminFinanceSummary,
  listAdminFinancePlans,
  listAdminFinanceStripeEvents,
  listAdminFinanceSubscriptions,
} from '@/features/admin/services/admin-finance.service'

const mockApiRequest = vi.mocked(apiRequest)

beforeEach(() => {
  mockApiRequest.mockReset()
  mockApiRequest.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 })
})

describe('getAdminFinanceSummary', () => {
  it('fetches the summary endpoint', async () => {
    await getAdminFinanceSummary()
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/finance/summary', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})

describe('listAdminFinancePlans', () => {
  it('fetches the plans endpoint', async () => {
    await listAdminFinancePlans()
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/finance/plans', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})

describe('listAdminFinanceSubscriptions', () => {
  it('builds a query string from non-empty filters', async () => {
    await listAdminFinanceSubscriptions({ status: 'ACTIVE', page: 2, limit: 10 } as never)
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toContain('/admin/finance/subscriptions?')
    expect(path).toContain('status=ACTIVE')
    expect(path).toContain('page=2')
  })

  it('omits the query string entirely when all filters are empty/undefined', async () => {
    await listAdminFinanceSubscriptions({ status: '', page: undefined } as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/finance/subscriptions', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})

describe('listAdminFinanceStripeEvents', () => {
  it('builds a query string from non-empty filters', async () => {
    await listAdminFinanceStripeEvents({ type: 'invoice.paid' } as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/finance/stripe-events?type=invoice.paid', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })

  it('omits the query string entirely when filters are empty', async () => {
    await listAdminFinanceStripeEvents({} as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/finance/stripe-events', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})
