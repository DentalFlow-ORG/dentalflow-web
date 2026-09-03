import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CepNotFoundError, fetchAddressByCep } from '@/services/cep/cep.service'

// ── fetch mock setup ──────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function makeFetchResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  })
}

// ── fetchAddressByCep ─────────────────────────────────────────────────────────

describe('fetchAddressByCep', () => {
  it('throws if CEP has fewer than 8 digits', async () => {
    await expect(fetchAddressByCep('0131010')).rejects.toThrow('CEP inválido')
  })

  it('throws if CEP has more than 8 digits', async () => {
    await expect(fetchAddressByCep('013101001')).rejects.toThrow('CEP inválido')
  })

  it('does not call fetch for an invalid CEP', async () => {
    await expect(fetchAddressByCep('123')).rejects.toThrow()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls the ViaCEP API with only digits when a masked CEP is provided', async () => {
    mockFetch.mockReturnValue(
      makeFetchResponse({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        complemento: '',
      }),
    )
    await fetchAddressByCep('01310-100')
    expect(mockFetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/')
  })

  it('returns correct AddressByCep shape on success', async () => {
    mockFetch.mockReturnValue(
      makeFetchResponse({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        complemento: 'de 610 a 1500 - lado par',
      }),
    )
    const result = await fetchAddressByCep('01310100')
    expect(result).toEqual({
      cep: '01310-100',
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      uf: 'SP',
      complement: 'de 610 a 1500 - lado par',
    })
  })

  it('falls back to empty strings and the requested digits when fields are missing/non-string', async () => {
    mockFetch.mockReturnValue(makeFetchResponse({}))
    const result = await fetchAddressByCep('01310100')
    expect(result).toEqual({
      cep: '01310100',
      street: '',
      neighborhood: '',
      city: '',
      uf: '',
      complement: undefined,
    })
  })

  it('omits complement when ViaCEP returns empty string', async () => {
    mockFetch.mockReturnValue(
      makeFetchResponse({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        complemento: '',
      }),
    )
    const result = await fetchAddressByCep('01310100')
    expect(result.complement).toBeUndefined()
  })

  it('throws CepNotFoundError when ViaCEP responds with { erro: true }', async () => {
    mockFetch.mockReturnValue(makeFetchResponse({ erro: true }))
    await expect(fetchAddressByCep('99999000')).rejects.toBeInstanceOf(CepNotFoundError)
  })

  it('throws CepNotFoundError when ViaCEP responds with { erro: "true" }', async () => {
    mockFetch.mockReturnValue(makeFetchResponse({ erro: 'true' }))
    await expect(fetchAddressByCep('99999000')).rejects.toBeInstanceOf(CepNotFoundError)
  })

  it('throws a generic error when fetch fails (network error)', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(fetchAddressByCep('01310100')).rejects.toThrow(/conexão|consultar/i)
  })

  it('throws a generic error when HTTP response is not ok', async () => {
    mockFetch.mockReturnValue(Promise.resolve({ ok: false, json: () => Promise.resolve({}) }))
    await expect(fetchAddressByCep('01310100')).rejects.toThrow(/consultar/i)
  })

  it('throws when response JSON is not parseable', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      }),
    )
    await expect(fetchAddressByCep('01310100')).rejects.toThrow(/inesperada/i)
  })
})

// ── CepNotFoundError ──────────────────────────────────────────────────────────

describe('CepNotFoundError', () => {
  it('has the correct name', () => {
    expect(new CepNotFoundError().name).toBe('CepNotFoundError')
  })

  it('has a user-facing message', () => {
    expect(new CepNotFoundError().message).toBe('CEP não encontrado.')
  })

  it('is an instance of Error', () => {
    expect(new CepNotFoundError()).toBeInstanceOf(Error)
  })
})
