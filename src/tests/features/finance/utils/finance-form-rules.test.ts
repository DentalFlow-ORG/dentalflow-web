import {
  financeFieldErrors,
  hasRequiredFinanceFields,
} from '@/features/finance/utils/finance-form-rules'

describe('required finance fields', () => {
  const valid = { categoryId: 'category-1', amount: '12,50', description: 'Consulta' }

  it.each(['transactionDate', 'startDate'])(
    'rejects clearing required %s while retaining the other fields',
    (field) => {
      expect(hasRequiredFinanceFields({ ...valid, [field]: '' })).toBe(false)
      expect(hasRequiredFinanceFields({ ...valid, [field]: '2026-09-28' })).toBe(true)
    },
  )

  it.each([{ categoryId: '' }, { amount: '' }, { amount: '0,00' }, { description: '   ' }])(
    'rejects an incomplete financial entry: %j',
    (missing) => {
      expect(hasRequiredFinanceFields({ ...valid, ...missing })).toBe(false)
    },
  )
})

describe('finance error associations', () => {
  it('does not mark fields before a rejected submit', () => {
    expect(financeFieldErrors({ name: '', amount: '', dueDay: '32' }, null)).toEqual({})
  })
  it('marks only invalid fields and keeps API errors at form level for valid input', () => {
    expect(
      financeFieldErrors(
        {
          name: '   ',
          categoryId: '',
          amount: '0,00',
          description: 'Consulta',
          transactionDate: '',
          dueDay: '32',
          startDate: '2026-09-28',
          endDate: '2026-09-01',
        },
        'Corrija os campos.',
      ),
    ).toEqual({
      name: 'Informe o nome da categoria.',
      categoryId: 'Selecione uma categoria.',
      amount: 'Informe um valor maior que zero.',
      transactionDate: 'Informe a data do lançamento.',
      dueDay: 'Informe um dia de vencimento entre 1 e 31.',
      endDate: 'A data de término não pode ser anterior à data de início.',
    })
    expect(
      financeFieldErrors(
        {
          name: 'Consulta',
          amount: '10,00',
          dueDay: '1',
          startDate: '2026-09-01',
          endDate: '2026-09-28',
        },
        'Servidor indisponível',
      ),
    ).toEqual({})
  })
})
