const ERROR_MESSAGE_TRANSLATIONS: Record<string, string> = {
  Unauthorized: 'Sessão expirada. Faça login novamente.',
  'Access denied': 'Acesso negado.',
  'Invalid credentials': 'E-mail ou senha inválidos.',
  'Invalid refresh token': 'Sessão inválida. Faça login novamente.',
  'Refresh token expired': 'Sessão expirada. Faça login novamente.',
  'Refresh token already used': 'Sessão inválida. Faça login novamente.',
  'Insufficient permissions': 'Você não tem permissão para acessar este recurso.',
  'Email already in use': 'Este e-mail já está em uso.',
  'Forbidden resource': 'Você não tem permissão para acessar este recurso.',
}

const STATUS_FALLBACKS: Record<number, string> = {
  400: 'Não foi possível processar os dados enviados.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para acessar este recurso.',
  404: 'Recurso não encontrado.',
  409: 'Não foi possível concluir a ação por conflito de dados.',
  429: 'Muitas tentativas. Aguarde um momento e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente em instantes.',
}

export function translateApiErrorMessage(message: string | null, status?: number) {
  if (!message) {
    return status ? STATUS_FALLBACKS[status] : null
  }

  const normalizedMessage = message.trim()
  const translated = ERROR_MESSAGE_TRANSLATIONS[normalizedMessage]

  if (translated) {
    return translated
  }

  if (normalizedMessage.toLowerCase().includes('unauthorized')) {
    return STATUS_FALLBACKS[401]
  }

  if (normalizedMessage.toLowerCase().includes('forbidden')) {
    return STATUS_FALLBACKS[403]
  }

  return normalizedMessage
}

export function getStatusFallbackMessage(status: number) {
  return STATUS_FALLBACKS[status] ?? 'Erro ao comunicar com o servidor.'
}
