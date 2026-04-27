import { env } from '@/config/env'

type ApiRequestOptions = RequestInit & {
  accessToken?: string | null
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

const REQUEST_TIMEOUT_MS = 15_000

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  if (!env.apiUrl) {
    throw new Error('VITE_API_URL não está configurada.')
  }

  const { accessToken, headers, signal: externalSignal, ...requestOptions } = options

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await fetch(`${env.apiUrl}${path}`, {
      ...requestOptions,
      signal: controller.signal,
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
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('A requisição demorou muito. Tente novamente.', 408, null)
    }

    throw err
  } finally {
    window.clearTimeout(timeoutId)
  }
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
