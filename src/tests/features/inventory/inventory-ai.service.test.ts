import {
  analyzeInventoryWithAi,
  getLatestInventoryAnalysis,
} from '@/features/inventory/services/inventory-ai.service'

const mockApiRequest = vi.fn()

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => 'tok-123',
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('analyzeInventoryWithAi', () => {
  it('POSTs to /ai-assistant/inventory/analyze with an empty JSON body', async () => {
    mockApiRequest.mockResolvedValue({ data: {}, quota: {} })
    await analyzeInventoryWithAi()
    expect(mockApiRequest).toHaveBeenCalledWith('/ai-assistant/inventory/analyze', {
      method: 'POST',
      accessToken: 'tok-123',
      body: JSON.stringify({}),
    })
  })
})

describe('getLatestInventoryAnalysis', () => {
  it('returns the response on success', async () => {
    const response = { data: null, quota: {}, dataReadiness: {}, visibility: 'FULL' }
    mockApiRequest.mockResolvedValue(response)
    await expect(getLatestInventoryAnalysis()).resolves.toEqual(response)
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/ai-assistant/inventory/latest',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('returns null when the request rejects', async () => {
    mockApiRequest.mockRejectedValue(new Error('network error'))
    await expect(getLatestInventoryAnalysis()).resolves.toBeNull()
  })
})
