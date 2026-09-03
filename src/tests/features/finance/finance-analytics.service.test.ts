import { fetchProcedureMargins } from '@/features/finance/services/finance-analytics.service'

const mockApiRequest = vi.fn()

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => 'tok-123',
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockApiRequest.mockResolvedValue({})
})

describe('fetchProcedureMargins', () => {
  it('calls the endpoint with no query string when no filters are given', async () => {
    await fetchProcedureMargins()
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/analytics/procedure-margins')
  })

  it('builds the query string from month only', async () => {
    await fetchProcedureMargins({ month: '2026-06' })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/analytics/procedure-margins?month=2026-06')
  })

  it('builds the query string from a full date range and profileId', async () => {
    await fetchProcedureMargins({
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      profileId: 'prof-1',
    })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe(
      '/finance/analytics/procedure-margins?startDate=2026-06-01&endDate=2026-06-30&profileId=prof-1',
    )
  })
})
