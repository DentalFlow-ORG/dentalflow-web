import {
  createMember,
  deleteClinicMember,
  listClinicMembers,
  updateClinicMember,
  updateClinicMemberPassword,
} from '@/features/team/services/team.service'

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

describe('listClinicMembers', () => {
  it('calls GET /users/clinic/members with the access token', async () => {
    mockApiRequest.mockResolvedValue({ items: [] })
    await listClinicMembers()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/users/clinic/members')
    expect(options.method).toBe('GET')
    expect(options.accessToken).toBe('tok-123')
  })
})

describe('createMember', () => {
  it('calls POST /users/clinic/members with the JSON-serialized payload', async () => {
    mockApiRequest.mockResolvedValue({ id: 'm1' })
    const dto = { firstName: 'Ana', lastName: 'Silva', email: 'ana@clinica.com' }
    await createMember(dto as never)

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/users/clinic/members')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(dto))
    expect(options.accessToken).toBe('tok-123')
  })
})

describe('updateClinicMember', () => {
  it('calls PATCH /users/clinic/members/:id with the JSON-serialized payload', async () => {
    mockApiRequest.mockResolvedValue({ id: 'm1' })
    const dto = { firstName: 'Ana' }
    await updateClinicMember('m1', dto as never)

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/users/clinic/members/m1')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify(dto))
    expect(options.accessToken).toBe('tok-123')
  })
})

describe('updateClinicMemberPassword', () => {
  it('calls PATCH /users/clinic/members/:id/password with the JSON-serialized payload', async () => {
    mockApiRequest.mockResolvedValue(undefined)
    const dto = { newPassword: 'password123' }
    await updateClinicMemberPassword('m1', dto as never)

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/users/clinic/members/m1/password')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify(dto))
    expect(options.accessToken).toBe('tok-123')
  })
})

describe('deleteClinicMember', () => {
  it('calls DELETE /users/clinic/members/:id with the access token', async () => {
    mockApiRequest.mockResolvedValue(undefined)
    await deleteClinicMember('m1')

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/users/clinic/members/m1')
    expect(options.method).toBe('DELETE')
    expect(options.accessToken).toBe('tok-123')
  })
})
