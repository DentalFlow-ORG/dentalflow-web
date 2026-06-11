import { normalizeDigits } from '@/lib/validators/br'

export type AddressByCep = {
  cep: string
  street: string
  neighborhood: string
  city: string
  uf: string
  complement?: string
}

export class CepNotFoundError extends Error {
  constructor() {
    super('CEP não encontrado.')
    this.name = 'CepNotFoundError'
  }
}

export async function fetchAddressByCep(cep: string): Promise<AddressByCep> {
  const digits = normalizeDigits(cep)
  if (digits.length !== 8) {
    throw new Error('CEP inválido.')
  }

  let response: Response
  try {
    response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  } catch {
    throw new Error('Não foi possível consultar o CEP. Verifique sua conexão.')
  }

  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP.')
  }

  let data: Record<string, unknown>
  try {
    data = await response.json()
  } catch {
    throw new Error('Resposta inesperada do serviço de CEP.')
  }

  if (data.erro === true || data.erro === 'true') {
    throw new CepNotFoundError()
  }

  return {
    cep: typeof data.cep === 'string' ? data.cep : digits,
    street: typeof data.logradouro === 'string' ? data.logradouro : '',
    neighborhood: typeof data.bairro === 'string' ? data.bairro : '',
    city: typeof data.localidade === 'string' ? data.localidade : '',
    uf: typeof data.uf === 'string' ? data.uf : '',
    complement:
      typeof data.complemento === 'string' && data.complemento ? data.complemento : undefined,
  }
}
