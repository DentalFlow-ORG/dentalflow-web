import { ApiError, apiRequest } from '@/services/http'

vi.mock('@/services/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/http')>()
  return { ...actual, apiRequest: vi.fn() }
})
vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => 'token-123',
}))

import {
  createAdminClinic,
  deleteAdminClinic,
  getClinicsHealth,
  listAdminClinicsPage,
  updateAdminClinic,
} from '@/features/admin/services/admin-clinics.service'

const mockApiRequest = vi.mocked(apiRequest)

beforeEach(() => {
  mockApiRequest.mockReset()
})

describe('listAdminClinicsPage', () => {
  it('returns the response as-is when it is already paginated', async () => {
    const response = { data: [], total: 0, page: 2, limit: 20 }
    mockApiRequest.mockResolvedValue(response)
    const result = await listAdminClinicsPage(2, 20)
    expect(result).toBe(response)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/users/clinics', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })

  it('wraps a bare array response into a paginated shape', async () => {
    const clinics = [{ id: '1' }, { id: '2' }]
    mockApiRequest.mockResolvedValue(clinics)
    const result = await listAdminClinicsPage(3, 10)
    expect(result).toEqual({ data: clinics, total: 2, page: 3, limit: 10 })
  })

  it('defaults page and limit', async () => {
    mockApiRequest.mockResolvedValue([])
    const result = await listAdminClinicsPage()
    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 })
  })
})

describe('getClinicsHealth', () => {
  it('fetches the clinic health endpoint', async () => {
    mockApiRequest.mockResolvedValue([])
    await getClinicsHealth()
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/users/clinics/health', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})

describe('createAdminClinic / updateAdminClinic / deleteAdminClinic', () => {
  it('creates a clinic', async () => {
    mockApiRequest.mockResolvedValue({ id: '1' })
    await createAdminClinic({ name: 'Nova clínica' } as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/clinics', {
      method: 'POST',
      accessToken: 'token-123',
      body: JSON.stringify({ name: 'Nova clínica' }),
    })
  })

  it('updates a clinic', async () => {
    mockApiRequest.mockResolvedValue({ id: '1' })
    await updateAdminClinic('1', { name: 'Renomeada' } as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/clinics/1', {
      method: 'PATCH',
      accessToken: 'token-123',
      body: JSON.stringify({ name: 'Renomeada' }),
    })
  })

  it('deletes a clinic', async () => {
    mockApiRequest.mockResolvedValue(undefined)
    await deleteAdminClinic('1')
    expect(mockApiRequest).toHaveBeenCalledWith('/admin/clinics/1', {
      method: 'DELETE',
      accessToken: 'token-123',
    })
  })

  it('translates a 404 ApiError into a friendlier message', async () => {
    mockApiRequest.mockRejectedValue(new ApiError('Not Found', 404, null))
    await expect(deleteAdminClinic('1')).rejects.toThrow(
      'O backend ainda não disponibiliza esta ação para clínicas.',
    )
  })

  it('rethrows a non-404 ApiError unchanged', async () => {
    const error = new ApiError('Server error', 500, null)
    mockApiRequest.mockRejectedValue(error)
    await expect(deleteAdminClinic('1')).rejects.toBe(error)
  })

  it('rethrows a non-ApiError unchanged', async () => {
    const error = new Error('network down')
    mockApiRequest.mockRejectedValue(error)
    await expect(deleteAdminClinic('1')).rejects.toBe(error)
  })
})
