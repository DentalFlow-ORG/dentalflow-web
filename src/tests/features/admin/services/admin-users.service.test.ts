import { apiRequest } from '@/services/http'

vi.mock('@/services/http', () => ({ apiRequest: vi.fn() }))
vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => 'token-123',
}))

import {
  createAdminUser,
  deleteAdminUser,
  listAdminClinics,
  listAdminUsers,
  updateAdminUser,
  updateAdminUserPassword,
} from '@/features/admin/services/admin-users.service'

const mockApiRequest = vi.mocked(apiRequest)

beforeEach(() => {
  mockApiRequest.mockReset()
  mockApiRequest.mockResolvedValue({})
})

describe('listAdminClinics', () => {
  it('fetches the clinics endpoint', async () => {
    await listAdminClinics()
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/users/clinics', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})

describe('listAdminUsers', () => {
  it('defaults page and limit', async () => {
    await listAdminUsers()
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/users?page=1&limit=20', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })

  it('uses the given page and limit', async () => {
    await listAdminUsers(3, 50)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/users?page=3&limit=50', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})

describe('createAdminUser', () => {
  it('posts the dto', async () => {
    await createAdminUser({ email: 'a@b.com' } as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/users', {
      method: 'POST',
      accessToken: 'token-123',
      body: JSON.stringify({ email: 'a@b.com' }),
    })
  })
})

describe('updateAdminUser', () => {
  it('patches the dto', async () => {
    await updateAdminUser('u1', { firstName: 'Ana' } as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/users/u1', {
      method: 'PATCH',
      accessToken: 'token-123',
      body: JSON.stringify({ firstName: 'Ana' }),
    })
  })
})

describe('updateAdminUserPassword', () => {
  it('patches the password endpoint', async () => {
    await updateAdminUserPassword('u1', { newPassword: 'secret123' } as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/users/u1/password', {
      method: 'PATCH',
      accessToken: 'token-123',
      body: JSON.stringify({ newPassword: 'secret123' }),
    })
  })
})

describe('deleteAdminUser', () => {
  it('deletes the user', async () => {
    await deleteAdminUser('u1')
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/users/u1', {
      method: 'DELETE',
      accessToken: 'token-123',
    })
  })
})
