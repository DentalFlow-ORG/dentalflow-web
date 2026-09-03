import { getProductivitySummary } from '@/features/dashboard/services/productivity.service'

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'tok-123')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getProductivitySummary', () => {
  it('calls GET /metrics/productivity', async () => {
    mockApiRequest.mockResolvedValue({})
    await getProductivitySummary()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/metrics/productivity')
    expect(options.method).toBe('GET')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-prod')
    mockApiRequest.mockResolvedValue({})
    await getProductivitySummary()

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-prod')
  })

  it('returns the resolved value from apiRequest unchanged', async () => {
    const summary = { totalAppointments: 5 }
    mockApiRequest.mockResolvedValue(summary)

    const result = await getProductivitySummary()
    expect(result).toBe(summary)
  })

  it('rejects with the same error apiRequest throws', async () => {
    const error = new Error('Network error')
    mockApiRequest.mockRejectedValue(error)
    await expect(getProductivitySummary()).rejects.toThrow('Network error')
  })
})
