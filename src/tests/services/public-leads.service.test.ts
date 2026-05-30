import { submitPublicLead } from '@/services/public-leads.service'

const mockApiRequest = vi.fn()

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

describe('submitPublicLead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls apiRequest with endpoint /public/leads and method POST', async () => {
    mockApiRequest.mockResolvedValue({ success: true, message: 'ok' })

    await submitPublicLead({
      name: 'Ana Silva',
      phone: '(11) 99999-9999',
      acceptedPrivacyPolicy: true,
    })

    expect(mockApiRequest).toHaveBeenCalledTimes(1)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/public/leads')
    expect(options.method).toBe('POST')
  })

  it('sends Content-Type: application/json in headers', async () => {
    mockApiRequest.mockResolvedValue({ success: true, message: 'ok' })

    await submitPublicLead({
      name: 'Ana Silva',
      phone: '(11) 99999-9999',
      acceptedPrivacyPolicy: true,
    })

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' })
  })

  it('serializes the full payload correctly, including acceptedPrivacyPolicy and optional fields', async () => {
    mockApiRequest.mockResolvedValue({ success: true, message: 'ok' })

    await submitPublicLead({
      name: 'Ana Silva',
      phone: '(11) 99999-9999',
      clinicName: 'Clínica Central',
      preferredTime: 'Manhã',
      context: 'Melhorar controle financeiro',
      acceptedPrivacyPolicy: true,
    })

    const [, options] = mockApiRequest.mock.calls[0]
    expect(JSON.parse(options.body as string)).toEqual({
      name: 'Ana Silva',
      phone: '(11) 99999-9999',
      clinicName: 'Clínica Central',
      preferredTime: 'Manhã',
      context: 'Melhorar controle financeiro',
      acceptedPrivacyPolicy: true,
    })
  })

  it('serializes a minimal payload correctly, including acceptedPrivacyPolicy false and omitted optional fields', async () => {
    mockApiRequest.mockResolvedValue({ success: true, message: 'ok' })

    await submitPublicLead({
      name: 'João Costa',
      phone: '(21) 98888-7777',
      acceptedPrivacyPolicy: false,
    })

    const [, options] = mockApiRequest.mock.calls[0]
    const body = JSON.parse(options.body as string)
    expect(body).toEqual({
      name: 'João Costa',
      phone: '(21) 98888-7777',
      acceptedPrivacyPolicy: false,
    })
    expect(body).not.toHaveProperty('clinicName')
    expect(body).not.toHaveProperty('preferredTime')
    expect(body).not.toHaveProperty('context')
  })

  it('returns the resolved apiRequest value unchanged', async () => {
    const expected = { success: true as const, message: 'Lead criado com sucesso.' }
    mockApiRequest.mockResolvedValue(expected)

    const result = await submitPublicLead({
      name: 'Ana Silva',
      phone: '(11) 99999-9999',
      acceptedPrivacyPolicy: true,
    })

    expect(result).toBe(expected)
  })

  it('propagates apiRequest rejection to the caller', async () => {
    const error = new Error('network failure')
    mockApiRequest.mockRejectedValue(error)

    await expect(
      submitPublicLead({
        name: 'Ana Silva',
        phone: '(11) 99999-9999',
        acceptedPrivacyPolicy: true,
      }),
    ).rejects.toThrow('network failure')
  })
})
