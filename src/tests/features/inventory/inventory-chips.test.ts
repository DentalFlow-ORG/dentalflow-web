import type { StockSummary } from '@/features/inventory/types/inventory.types'
import { buildAttentionChips } from '@/features/inventory/utils/inventory-chips'

function makeSummary(overrides: Partial<StockSummary> = {}): StockSummary {
  return {
    total: 0,
    active: 0,
    emptyStock: 0,
    lowStock: 0,
    expiring: 0,
    expired: 0,
    inactive: 0,
    ...overrides,
  } as StockSummary
}

describe('buildAttentionChips', () => {
  it('returns no chips when every count is zero', () => {
    expect(buildAttentionChips(makeSummary())).toEqual([])
  })

  it('includes only chips with a non-zero count', () => {
    const chips = buildAttentionChips(makeSummary({ emptyStock: 3, lowStock: 0, expired: 1 }))
    expect(chips.map((c) => c.status)).toEqual(['EMPTY', 'EXPIRED'])
  })

  it('includes all chips when every count is non-zero, in a fixed order', () => {
    const chips = buildAttentionChips(
      makeSummary({ emptyStock: 1, lowStock: 2, expiring: 3, expired: 4, inactive: 5 }),
    )
    expect(chips.map((c) => c.status)).toEqual(['EMPTY', 'LOW', 'EXPIRING', 'EXPIRED', 'INACTIVE'])
    expect(chips.map((c) => c.count)).toEqual([1, 2, 3, 4, 5])
  })

  it('carries the count and label through for each chip', () => {
    const chips = buildAttentionChips(makeSummary({ lowStock: 7 }))
    expect(chips[0]).toMatchObject({ status: 'LOW', label: 'Baixo estoque', count: 7 })
  })
})
