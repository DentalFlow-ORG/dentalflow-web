import { env } from '@/config/env'
import { notifySessionExpired } from '@/features/auth/utils/auth-events'
import {clearSession} from '@/features/auth/utils/session-storage'

import {
  getStatusFallbackMessage,
  translateApiErrorMessage,
} from './api-error-messages'

type ApiRequestOptions = RequestInit & {
  accessToken?: string | null
  _skipRefresh?: boolean
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

type RefreshConfig = {
  refreshTokens: () => Promise<{ accessToken: string }>
  onTokenRefreshed: (accessToken: string) => void
  onRefreshFailed: () => void
}

let refreshConfig: RefreshConfig | null = null
let pendingRefresh: Promise<{ accessToken: string }> | null = null

export function setupAuthRefresh(config: RefreshConfig) {
  refreshConfig = config
}

const REQUEST_TIMEOUT_MS = 15_000

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  if (!env.apiUrl) {
    throw new Error('VITE_API_URL não está configurada.')
  }

  const { accessToken, headers, signal: externalSignal, _skipRefresh, ...requestOptions } = options

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await request(path, requestOptions, {
      accessToken,
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      const body = await parseResponseBody(response)
      const message =
        translateApiErrorMessage(getErrorMessage(body), response.status) ??
        getStatusFallbackMessage(response.status)

      if (response.status === 401 && !_skipRefresh && refreshConfig) {
        try {
          if (!pendingRefresh) {
            pendingRefresh = refreshConfig.refreshTokens().finally(() => {
              pendingRefresh = null
            })
          }
          const { accessToken: newAccessToken } = await pendingRefresh
          refreshConfig.onTokenRefreshed(newAccessToken)
          return apiRequest<TResponse>(path, {
            ...options,
            accessToken: newAccessToken,
            _skipRefresh: true,
          })
        } catch {
          clearSession()
          notifySessionExpired()
          refreshConfig.onRefreshFailed()
          throw new ApiError(message, response.status, body)
        }
      }

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

    if (err instanceof TypeError) {
      throw new ApiError(
        'Não foi possível conectar ao servidor. Verifique se a API está em execução.',
        0,
        null,
      )
    }

    throw err
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    try {
      return (await response.json()) as ApiErrorBody
    } catch {
      return null
    }
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

function request(
  path: string,
  requestOptions: RequestInit,
  options: Pick<ApiRequestOptions, 'accessToken' | 'headers'> & { signal: AbortSignal },
) {
  return fetch(`${env.apiUrl}${path}`, {
    ...requestOptions,
    credentials: requestOptions.credentials ?? 'include',
    signal: options.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      ...options.headers,
    },
  })
}
