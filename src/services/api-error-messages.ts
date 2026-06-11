const ERROR_MESSAGE_TRANSLATIONS: Record<string, string> = {
  Unauthorized: 'Sessão expirada. Faça login novamente.',
  'Bad Request': 'Não foi possível processar os dados enviados.',
  Forbidden: 'Você não tem permissão para acessar este recurso.',
  'Not Found': 'Recurso não encontrado.',
  Conflict: 'Não foi possível concluir a ação por conflito de dados.',
  'Too Many Requests': 'Muitas tentativas. Aguarde um momento e tente novamente.',
  'Internal Server Error': 'Erro interno do servidor. Tente novamente em instantes.',
  'Service Unavailable': 'Serviço indisponível no momento. Tente novamente em instantes.',
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
  502: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
  503: 'Serviço indisponível no momento. Tente novamente em instantes.',
  504: 'A requisição demorou muito. Tente novamente.',
}

const VALIDATION_MESSAGE_TRANSLATIONS: Array<[RegExp, string]> = [
  [
    /addressState must be longer than or equal to 2 characters/i,
    'UF deve ter exatamente 2 caracteres.',
  ],
  [
    /addressState must be shorter than or equal to 2 characters/i,
    'UF deve ter exatamente 2 caracteres.',
  ],
  [/page must not be less than 1/i, 'Página deve ser maior ou igual a 1.'],
  [/page must be an integer number/i, 'Página deve ser um número inteiro.'],
  [/limit must not be greater than 100/i, 'Limite deve ser menor ou igual a 100.'],
  [/limit must not be less than 1/i, 'Limite deve ser maior ou igual a 1.'],
  [/limit must be an integer number/i, 'Limite deve ser um número inteiro.'],
]

export function translateApiErrorMessage(message: string | null, status?: number) {
  if (!message) {
    return status ? STATUS_FALLBACKS[status] : null
  }

  const normalizedMessage = message.trim()
  const translated = ERROR_MESSAGE_TRANSLATIONS[normalizedMessage]

  if (translated) {
    return translated
  }

  const translatedValidationMessages = VALIDATION_MESSAGE_TRANSLATIONS.filter(([pattern]) =>
    pattern.test(normalizedMessage),
  ).map(([, translation]) => translation)

  if (translatedValidationMessages.length) {
    return [...new Set(translatedValidationMessages)].join(' ')
  }

  if (normalizedMessage.toLowerCase().includes('unauthorized')) {
    return STATUS_FALLBACKS[401]
  }

  if (normalizedMessage.toLowerCase().includes('forbidden')) {
    return STATUS_FALLBACKS[403]
  }

  if (
    normalizedMessage.toLowerCase().includes('not found') ||
    /^cannot\s+(get|post|put|patch|delete)\s+/i.test(normalizedMessage)
  ) {
    return STATUS_FALLBACKS[404]
  }

  if (normalizedMessage.toLowerCase().includes('bad request')) {
    return STATUS_FALLBACKS[400]
  }

  if (normalizedMessage.toLowerCase().includes('internal server error')) {
    return STATUS_FALLBACKS[500]
  }

  if (normalizedMessage.toLowerCase().includes('network error')) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
  }

  return normalizedMessage
}

export function getStatusFallbackMessage(status: number) {
  return STATUS_FALLBACKS[status] ?? 'Erro ao comunicar com o servidor.'
}
