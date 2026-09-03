import {
  generateCopilotSummary,
  getLatestCopilotSummary,
} from '@/features/inventory/services/stock-copilot.service'

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

describe('getLatestCopilotSummary', () => {
  it('calls GET /stock/purchase-list/copilot-summary/latest', async () => {
    await getLatestCopilotSummary()
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/purchase-list/copilot-summary/latest', {
      method: 'GET',
      accessToken: 'tok-123',
    })
  })
})

describe('generateCopilotSummary', () => {
  it('POSTs to /stock/purchase-list/copilot-summary with forceRefresh: true', async () => {
    await generateCopilotSummary()
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/purchase-list/copilot-summary', {
      method: 'POST',
      accessToken: 'tok-123',
      body: JSON.stringify({ forceRefresh: true }),
    })
  })
})
