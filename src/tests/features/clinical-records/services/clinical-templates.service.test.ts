import {
  createClinicalTemplate,
  deactivateClinicalTemplate,
  listClinicalTemplates,
  updateClinicalTemplate,
} from '@/features/clinical-records/services/clinical-templates.service'

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

describe('listClinicalTemplates', () => {
  it('calls GET /clinical-records/templates/list', async () => {
    await listClinicalTemplates()
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/templates/list')
    expect(options.method).toBe('GET')
    expect(options.accessToken).toBe('tok-123')
  })
})

describe('createClinicalTemplate', () => {
  it('POSTs the JSON-serialized payload to /clinical-records/templates', async () => {
    const dto = { name: 'Consulta padrão' }
    await createClinicalTemplate(dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/templates')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('updateClinicalTemplate', () => {
  it('PATCHes the JSON-serialized payload', async () => {
    const dto = { name: 'Novo nome' }
    await updateClinicalTemplate('t1', dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/templates/t1')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('deactivateClinicalTemplate', () => {
  it('DELETEs the template', async () => {
    await deactivateClinicalTemplate('t1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/templates/t1')
    expect(options.method).toBe('DELETE')
  })
})
