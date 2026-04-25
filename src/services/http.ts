const API_URL = import.meta.env.VITE_API_URL

type ApiRequestOptions = RequestInit & {
  accessToken?: string
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const { accessToken, headers, ...requestOptions } = options

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    throw new Error('Erro ao comunicar com o servidor.')
  }

  return response.json() as Promise<TResponse>
}
