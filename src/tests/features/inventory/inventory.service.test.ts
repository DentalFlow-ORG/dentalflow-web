import {
  createStockCategory,
  createStockMovement,
  createStockProduct,
  deleteStockCategory,
  deleteStockProduct,
  getStockProduct,
  getStockPurchaseList,
  getStockSummary,
  listProductStockMovements,
  listStockCategories,
  listStockProducts,
  reactivateStockProduct,
  updateStockCategory,
  updateStockProduct,
} from '@/features/inventory/services/inventory.service'

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
  mockApiRequest.mockResolvedValue({})
})

describe('getStockSummary', () => {
  it('calls GET /stock/summary', async () => {
    await getStockSummary()
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/stock/summary')
    expect(options.method).toBe('GET')
    expect(options.accessToken).toBe('tok-123')
  })
})

describe('getStockPurchaseList', () => {
  it('calls GET /stock/purchase-list', async () => {
    await getStockPurchaseList()
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/stock/purchase-list',
      expect.objectContaining({ method: 'GET' }),
    )
  })
})

describe('stock categories', () => {
  it('lists categories via GET /stock/categories', async () => {
    await listStockCategories()
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/stock/categories',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('creates a category via POST with JSON body', async () => {
    const payload = { name: 'Descartáveis' }
    await createStockCategory(payload as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/categories', {
      method: 'POST',
      accessToken: 'tok-123',
      body: JSON.stringify(payload),
    })
  })

  it('updates a category via PATCH', async () => {
    const payload = { name: 'Renomeado' }
    await updateStockCategory('cat-1', payload as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/categories/cat-1', {
      method: 'PATCH',
      accessToken: 'tok-123',
      body: JSON.stringify(payload),
    })
  })

  it('deletes a category via DELETE', async () => {
    await deleteStockCategory('cat-1')
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/categories/cat-1', {
      method: 'DELETE',
      accessToken: 'tok-123',
    })
  })
})

describe('listStockProducts', () => {
  it('builds a query string from provided filters', async () => {
    await listStockProducts({
      search: 'gaze',
      categoryId: 'cat-1',
      status: 'ACTIVE',
      page: 2,
      limit: 10,
    })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/stock/products?search=gaze&categoryId=cat-1&status=ACTIVE&page=2&limit=10')
  })

  it('omits undefined and empty-string filters from the query string', async () => {
    await listStockProducts({ search: '', page: 1 })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/stock/products?page=1')
  })

  it('produces no query string when called with no filters', async () => {
    await listStockProducts()
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/stock/products')
  })
})

describe('stock products', () => {
  it('gets a single product via GET', async () => {
    await getStockProduct('prod-1')
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/stock/products/prod-1',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('creates a product via POST with JSON body', async () => {
    const payload = { name: 'Luva' }
    await createStockProduct(payload as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/products', {
      method: 'POST',
      accessToken: 'tok-123',
      body: JSON.stringify(payload),
    })
  })

  it('updates a product via PATCH', async () => {
    const payload = { name: 'Luva M' }
    await updateStockProduct('prod-1', payload as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/products/prod-1', {
      method: 'PATCH',
      accessToken: 'tok-123',
      body: JSON.stringify(payload),
    })
  })

  it('deletes (deactivates) a product via DELETE', async () => {
    await deleteStockProduct('prod-1')
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/products/prod-1', {
      method: 'DELETE',
      accessToken: 'tok-123',
    })
  })

  it('reactivates a product via PATCH', async () => {
    await reactivateStockProduct('prod-1')
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/products/prod-1/reactivate', {
      method: 'PATCH',
      accessToken: 'tok-123',
    })
  })
})

describe('stock movements', () => {
  it('creates a movement via POST with JSON body', async () => {
    const payload = { productId: 'prod-1', type: 'IN', quantity: 5 }
    await createStockMovement(payload as never)
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/movements', {
      method: 'POST',
      accessToken: 'tok-123',
      body: JSON.stringify(payload),
    })
  })

  it('lists movements for a product with a query string', async () => {
    await listProductStockMovements('prod-1', {
      type: 'OUT',
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      page: 1,
      limit: 20,
    })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe(
      '/stock/products/prod-1/movements?type=OUT&dateFrom=2026-01-01&dateTo=2026-01-31&page=1&limit=20',
    )
  })

  it('lists movements for a product with no filters', async () => {
    await listProductStockMovements('prod-1')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/stock/products/prod-1/movements')
  })
})
