import { env } from '@/config/env'

type ApiRequestOptions = RequestInit & {
  accessToken?: string
}

type ApiErrorBody = {
  message?: string | string[]
  error?: string
  statusCode?: number
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  if (!env.apiUrl) {
    throw new Error('VITE_API_URL nao esta configurada.')
  }

  const { accessToken, headers, ...requestOptions } = options

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    const body = await parseResponseBody(response)
    const message = getErrorMessage(body) ?? 'Erro ao comunicar com o servidor.'

    throw new ApiError(message, response.status, body)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return response.json() as Promise<ApiErrorBody>
  }

  return response.text()
}

function getErrorMessage(body: unknown) {
  if (typeof body === 'string') {
    return body
  }

  if (!body || typeof body !== 'object') {
    return null
  }

  const apiBody = body as ApiErrorBody

  if (Array.isArray(apiBody.message)) {
    return apiBody.message.join(' ')
  }

  return apiBody.message ?? apiBody.error ?? null
}
