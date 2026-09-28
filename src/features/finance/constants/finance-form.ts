// Mirrors the API's finance DTO limits (modules/finance/dto).

/** Largest finance amount accepted by the API (R$ 99.999.999,99), in cents. */
export const FINANCE_MAX_AMOUNT_CENTS = 9_999_999_999

export const FINANCE_FIELD_LIMITS = {
  categoryName: 80,
  description: 160,
} as const

export const FINANCE_REQUIRED_FIELDS_MESSAGE =
  'Informe a categoria, um valor maior que zero, a descrição e a data.'

export const CATEGORY_NAME_REQUIRED_MESSAGE = 'O nome da categoria é obrigatório.'

export const FINANCE_FIELD_MESSAGES = {
  name: 'Informe o nome da categoria.',
  categoryId: 'Selecione uma categoria.',
  amount: 'Informe um valor maior que zero.',
  description: 'Informe a descrição.',
  transactionDate: 'Informe a data do lançamento.',
  startDate: 'Informe a data de início.',
  endDate: 'A data de término não pode ser anterior à data de início.',
  dueDay: 'Informe um dia de vencimento entre 1 e 31.',
} as const

export const FIXED_EXPENSE_DUE_DAY_MESSAGE = 'Informe um dia de vencimento entre 1 e 31.'

export const FIXED_EXPENSE_END_DATE_MESSAGE =
  'A data de término não pode ser anterior à data de início.'
