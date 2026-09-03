import {
  getClinicProfile,
  updateClinicProfile,
} from '@/features/settings/services/settings.service'

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

describe('getClinicProfile', () => {
  it('calls GET /clinic/profile with the access token', async () => {
    mockApiRequest.mockResolvedValue({ id: 'clinic-1' })
    await getClinicProfile()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/profile')
    expect(options.method).toBe('GET')
    expect(options.accessToken).toBe('tok-123')
  })
})

describe('updateClinicProfile', () => {
  it('calls PATCH /clinic/profile with the JSON-serialized payload', async () => {
    mockApiRequest.mockResolvedValue({ id: 'clinic-1' })
    await updateClinicProfile({ name: 'Nova Clínica' })

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/profile')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify({ name: 'Nova Clínica' }))
    expect(options.accessToken).toBe('tok-123')
  })
})
