import {
  batchGetPatientAvatars,
  getPatientAvatar,
  getPatientHistory,
  listPatients,
  upsertPatientAvatar,
} from '@/features/patients/services/patients.service'

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

describe('listPatients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiRequest.mockResolvedValue({ patients: [] })
  })

  it('calls GET /patients with no query string when search is omitted', async () => {
    await listPatients()
    const [path, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    expect(path).toBe('/patients')
    expect(options.method).toBe('GET')
  })

  it('omits the query string when search is only whitespace', async () => {
    await listPatients('   ')
    const [path] = mockApiRequest.mock.calls[0] as [string]
    expect(path).toBe('/patients')
  })

  it('appends an encoded search query when provided', async () => {
    await listPatients('Ana Silva & Co')
    const [path] = mockApiRequest.mock.calls[0] as [string]
    expect(path).toBe('/patients?search=Ana%20Silva%20%26%20Co')
  })
})

describe('getPatientHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiRequest.mockResolvedValue({ appointments: [] })
  })

  it('calls GET /patients/history with the encoded identifier', async () => {
    await getPatientHistory('a b@c.com')
    const [path, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    expect(path).toBe('/patients/history?identifier=a%20b%40c.com')
    expect(options.method).toBe('GET')
  })
})

describe('getPatientAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiRequest.mockResolvedValue({ avatarUrl: null })
  })

  it('calls GET /patients/avatar with the encoded identifier', async () => {
    await getPatientAvatar('a@b.com')
    const [path, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    expect(path).toBe('/patients/avatar?identifier=a%40b.com')
    expect(options.method).toBe('GET')
  })
})

describe('upsertPatientAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiRequest.mockResolvedValue(undefined)
  })

  it('calls PUT /patients/avatar with identifier and avatarBase64 in the body', async () => {
    await upsertPatientAvatar('a@b.com', 'base64data')
    const [path, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    expect(path).toBe('/patients/avatar')
    expect(options.method).toBe('PUT')
    expect(JSON.parse(options.body as string)).toEqual({
      identifier: 'a@b.com',
      avatarBase64: 'base64data',
    })
  })

  it('allows a null avatarBase64 (clearing the avatar)', async () => {
    await upsertPatientAvatar('a@b.com', null)
    const [, options] = mockApiRequest.mock.calls[0] as [string, Record<string, unknown>]
    expect(JSON.parse(options.body as string).avatarBase64).toBeNull()
  })
})
