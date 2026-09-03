import { getPatientsAttention } from '@/features/patients/services/attention.service'

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'tok-test')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

describe('getPatientsAttention', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiRequest.mockResolvedValue({ items: [] })
  })

  it('calls GET /patients/attention', async () => {
    await getPatientsAttention()
    const [path, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    expect(path).toBe('/patients/attention')
    expect(options.method).toBe('GET')
  })

  it('passes the access token from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-premium')
    await getPatientsAttention()
    const [, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    expect(options.accessToken).toBe('tok-premium')
  })

  it('returns the API response', async () => {
    mockApiRequest.mockResolvedValue({ items: [{ identifier: 'p1' }] })
    const result = await getPatientsAttention()
    expect(result.items).toHaveLength(1)
  })
})
