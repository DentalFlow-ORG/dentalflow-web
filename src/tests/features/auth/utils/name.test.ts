import { getUserDisplayName, splitFullName } from '@/features/auth/utils/name'

describe('splitFullName', () => {
  it('splits a two-word name', () => {
    expect(splitFullName('Ana Martins')).toEqual({ firstName: 'Ana', lastName: 'Martins' })
  })

  it('joins remaining words into lastName for a multi-word name', () => {
    expect(splitFullName('Ana Paula Martins Silva')).toEqual({
      firstName: 'Ana',
      lastName: 'Paula Martins Silva',
    })
  })

  it('uses firstName as lastName fallback for a single-word name', () => {
    expect(splitFullName('Ana')).toEqual({ firstName: 'Ana', lastName: 'Ana' })
  })

  it('collapses repeated whitespace', () => {
    expect(splitFullName('Ana   Martins')).toEqual({ firstName: 'Ana', lastName: 'Martins' })
  })

  it('trims leading/trailing whitespace', () => {
    expect(splitFullName('  Ana Martins  ')).toEqual({ firstName: 'Ana', lastName: 'Martins' })
  })

  it('returns empty strings for an empty input', () => {
    expect(splitFullName('')).toEqual({ firstName: '', lastName: '' })
  })

  it('returns empty strings for whitespace-only input', () => {
    expect(splitFullName('   ')).toEqual({ firstName: '', lastName: '' })
  })
})

describe('getUserDisplayName', () => {
  it('joins firstName and lastName', () => {
    expect(
      getUserDisplayName({ firstName: 'Ana', lastName: 'Martins', email: 'a@b.com', id: '1' }),
    ).toBe('Ana Martins')
  })

  it('falls back to email when both names are empty', () => {
    expect(getUserDisplayName({ firstName: '', lastName: '', email: 'a@b.com', id: '1' })).toBe(
      'a@b.com',
    )
  })

  it('uses only firstName when lastName is empty', () => {
    expect(getUserDisplayName({ firstName: 'Ana', lastName: '', email: 'a@b.com', id: '1' })).toBe(
      'Ana',
    )
  })
})
