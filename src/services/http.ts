import { env } from '@/config/env'
import { notifySessionExpired } from '@/features/auth/utils/auth-events'
import {
  clearSession,
  getRefreshToken,
  setTokens,
} from '@/features/auth/utils/session-storage'

import {
  getStatusFallbackMessage,
  translateApiErrorMessage,
} from './api-error-messages'

type ApiRequestOptions = RequestInit & {
  accessToken?: string | null
  skipAuthRefresh?: boolean
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
let refreshSessionPromise: Promise<string | null> | null = null

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  if (!env.apiUrl) {
    throw new Error('VITE_API_URL não está configurada.')
  }

  const {
    accessToken,
    headers,
    signal: externalSignal,
    skipAuthRefresh = false,
    ...requestOptions
  } = options

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort())
  }

  try {
    let response = await request(path, requestOptions, {
      accessToken,
      headers,
      signal: controller.signal,
    })

    if (response.status === 401 && accessToken && !skipAuthRefresh) {
      const nextAccessToken = await refreshAccessToken()

      if (nextAccessToken) {
        response = await request(path, requestOptions, {
          accessToken: nextAccessToken,
          headers,
          signal: controller.signal,
        })
      }
    }

    if (!response.ok) {
      const body = await parseResponseBody(response)
      const message =
        translateApiErrorMessage(getErrorMessage(body), response.status) ??
        getStatusFallbackMessage(response.status)

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

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    clearExpiredSession()
    return null
  }

  refreshSessionPromise ??= fetch(`${env.apiUrl}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) {
        return null
      }

      const session = (await response.json()) as {
        accessToken?: string
        refreshToken?: string
      }

      if (!session.accessToken || !session.refreshToken) {
        return null
      }

      setTokens(session.accessToken, session.refreshToken)
      return session.accessToken
    })
    .catch(() => null)
    .finally(() => {
      refreshSessionPromise = null
    })

  const accessToken = await refreshSessionPromise

  if (!accessToken) {
    clearExpiredSession()
  }

  return accessToken
}

function clearExpiredSession() {
  clearSession()
  notifySessionExpired()
}
