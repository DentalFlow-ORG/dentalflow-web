import {
  formatInventoryTimestamp,
  getMovementTypeLabel,
} from '@/features/inventory/utils/inventory-format'

describe('inventory formatting fallbacks', () => {
  it.each([null, undefined, ''])('omits an absent analysis timestamp: %s', (value) => {
    expect(formatInventoryTimestamp(value)).toBe('')
  })

  it('preserves an invalid timestamp as supplied instead of crashing the analysis', () => {
    expect(formatInventoryTimestamp('data indisponível')).toBe('data indisponível')
  })

  it('preserves an unrecognized movement label for readable history', () => {
    expect(getMovementTypeLabel('IMPORTAÇÃO')).toBe('IMPORTAÇÃO')
  })
})
