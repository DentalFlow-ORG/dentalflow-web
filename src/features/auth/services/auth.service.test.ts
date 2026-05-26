import {
  completeProfile,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
  resetPassword,
} from './auth.service'

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

// ── login ─────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('calls POST /auth/login with serialized payload', async () => {
    mockApiRequest.mockResolvedValue({ user: {}, accessToken: 'x' })
    await login({ email: 'a@b.com', password: 'secret' })

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/auth/login')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ email: 'a@b.com', password: 'secret' })
  })

  it('sets _skipRefresh: true to prevent refresh loops on 401', async () => {
    mockApiRequest.mockResolvedValue({ user: {}, accessToken: 'x' })
    await login({ email: 'a@b.com', password: 'secret' })

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options._skipRefresh).toBe(true)
  })

  it('does not include an accessToken in the request', async () => {
    mockApiRequest.mockResolvedValue({ user: {}, accessToken: 'x' })
    await login({ email: 'a@b.com', password: 'secret' })

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBeUndefined()
  })
})

// ── register ──────────────────────────────────────────────────────────────────

describe('register', () => {
  it('calls POST /auth/register with serialized payload', async () => {
    mockApiRequest.mockResolvedValue({ user: {}, accessToken: 'x' })
    await register({ email: 'a@b.com', password: 'secret', firstName: 'Ana', lastName: 'Silva', clinicName: 'Clínica', acceptedTerms: true })

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/auth/register')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toMatchObject({ email: 'a@b.com', password: 'secret' })
  })

  it('sets _skipRefresh: true', async () => {
    mockApiRequest.mockResolvedValue({ user: {}, accessToken: 'x' })
    await register({ email: 'a@b.com', password: 'secret', firstName: 'Ana', lastName: 'Silva', clinicName: 'Clínica', acceptedTerms: true })

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options._skipRefresh).toBe(true)
  })
})

// ── getCurrentUser ────────────────────────────────────────────────────────────

describe('getCurrentUser', () => {
  it('calls GET /auth/me', async () => {
    mockApiRequest.mockResolvedValue({ id: '1' })
    await getCurrentUser()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/auth/me')
    expect(options.method).toBe('GET')
  })

  it('passes the accessToken returned by getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('session-token')
    mockApiRequest.mockResolvedValue({ id: '1' })
    await getCurrentUser()

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('session-token')
  })
})

// ── logout ────────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('calls POST /auth/logout with the current accessToken', async () => {
    mockGetAccessToken.mockReturnValue('tok-abc')
    mockApiRequest.mockResolvedValue(undefined)
    await logout()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/auth/logout')
    expect(options.method).toBe('POST')
    expect(options.accessToken).toBe('tok-abc')
  })
})

// ── forgotPassword ────────────────────────────────────────────────────────────

describe('forgotPassword', () => {
  it('calls POST /auth/forgot-password with { email } body', async () => {
    mockApiRequest.mockResolvedValue({ message: 'ok' })
    await forgotPassword('a@b.com')

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/auth/forgot-password')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ email: 'a@b.com' })
  })

  it('sets _skipRefresh: true', async () => {
    mockApiRequest.mockResolvedValue({ message: 'ok' })
    await forgotPassword('a@b.com')

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options._skipRefresh).toBe(true)
  })
})

// ── resetPassword ─────────────────────────────────────────────────────────────

describe('resetPassword', () => {
  it('calls POST /auth/reset-password with { token, newPassword } body', async () => {
    mockApiRequest.mockResolvedValue({ message: 'ok' })
    await resetPassword('reset-tok', 'newPass123')

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/auth/reset-password')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ token: 'reset-tok', newPassword: 'newPass123' })
  })

  it('sets _skipRefresh: true', async () => {
    mockApiRequest.mockResolvedValue({ message: 'ok' })
    await resetPassword('reset-tok', 'newPass123')

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options._skipRefresh).toBe(true)
  })
})

// ── completeProfile ───────────────────────────────────────────────────────────

describe('completeProfile', () => {
  it('calls POST /auth/complete-profile with serialized payload and accessToken', async () => {
    mockGetAccessToken.mockReturnValue('tok-cp')
    mockApiRequest.mockResolvedValue({ user: {}, accessToken: 'x' })
    await completeProfile({ firstName: 'Ana', lastName: 'Silva', clinicName: 'Clínica', acceptedTerms: true })

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/auth/complete-profile')
    expect(options.method).toBe('POST')
    expect(options.accessToken).toBe('tok-cp')
    expect(JSON.parse(options.body)).toEqual({ firstName: 'Ana', lastName: 'Silva', clinicName: 'Clínica', acceptedTerms: true })
  })
})

// ── refresh — deduplication ───────────────────────────────────────────────────

describe('refresh', () => {
  it('concurrent calls share one pending promise — apiRequest called exactly once', async () => {
    let resolve!: (v: unknown) => void
    const deferred = new Promise((r) => { resolve = r })
    mockApiRequest.mockReturnValue(deferred)

    const p1 = refresh()
    const p2 = refresh()

    expect(mockApiRequest).toHaveBeenCalledTimes(1)

    resolve({ accessToken: 'new-tok' })
    await Promise.all([p1, p2])
  })

  it('calls POST /auth/refresh with _skipRefresh: true', async () => {
    mockApiRequest.mockResolvedValue({ accessToken: 'new-tok' })
    await refresh()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/auth/refresh')
    expect(options.method).toBe('POST')
    expect(options._skipRefresh).toBe(true)
  })
})
