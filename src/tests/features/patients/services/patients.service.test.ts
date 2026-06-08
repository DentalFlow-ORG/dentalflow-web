import { batchGetPatientAvatars } from '@/features/patients/services/patients.service'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'tok-test')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

// ── batchGetPatientAvatars ────────────────────────────────────────────────────

describe('batchGetPatientAvatars', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiRequest.mockResolvedValue({
      avatars: { 'a@test.com': 'base64a', 'b@test.com': null },
    })
  })

  it('calls POST /patients/avatars/batch', async () => {
    await batchGetPatientAvatars(['a@test.com'])

    const [path, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    expect(path).toBe('/patients/avatars/batch')
    expect(options.method).toBe('POST')
  })

  it('sends identifiers in the JSON body', async () => {
    await batchGetPatientAvatars(['a@test.com', 'b@test.com'])

    const [, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    const body = JSON.parse(options.body as string) as { identifiers: string[] }
    expect(body.identifiers).toEqual(['a@test.com', 'b@test.com'])
  })

  it('passes the access token from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-premium')

    await batchGetPatientAvatars(['x@test.com'])

    const [, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    expect(options.accessToken).toBe('tok-premium')
  })

  it('sets Content-Type: application/json', async () => {
    await batchGetPatientAvatars(['x@test.com'])

    const [, options] = mockApiRequest.mock.calls[0] as [
      string,
      { headers: Record<string, string> },
    ]
    expect(options.headers['Content-Type']).toBe('application/json')
  })

  it('returns the avatars map from the API response', async () => {
    const result = await batchGetPatientAvatars(['a@test.com', 'b@test.com'])

    expect(result.avatars['a@test.com']).toBe('base64a')
    expect(result.avatars['b@test.com']).toBeNull()
  })
})
