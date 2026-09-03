import {
  analyzeFinanceWithAi,
  getLatestFinanceAnalysis,
} from '@/features/finance/services/finance-ai.service'

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

describe('analyzeFinanceWithAi', () => {
  it('POSTs the serialized date range params', async () => {
    mockApiRequest.mockResolvedValue({ data: {}, quota: {} })
    await analyzeFinanceWithAi({ from: '2026-06-01', to: '2026-06-30' })
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/ai-assistant/finance/analyze')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ from: '2026-06-01', to: '2026-06-30' }))
  })
})

describe('getLatestFinanceAnalysis', () => {
  it('returns the response on success', async () => {
    const response = { data: null, quota: {}, dataReadiness: { ready: true }, visibility: 'FULL' }
    mockApiRequest.mockResolvedValue(response)
    const result = await getLatestFinanceAnalysis()
    expect(result).toEqual(response)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/ai-assistant/finance/latest')
    expect(options.method).toBe('GET')
  })

  it('returns null when the request fails', async () => {
    mockApiRequest.mockRejectedValue(new Error('not found'))
    const result = await getLatestFinanceAnalysis()
    expect(result).toBeNull()
  })
})
