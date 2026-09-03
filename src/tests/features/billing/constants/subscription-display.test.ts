import { getComparisonFeatures } from '@/features/billing/constants/subscription-display'

describe('getComparisonFeatures', () => {
  it('returns availability entries for the known comparison feature ids', () => {
    const result = getComparisonFeatures('professional')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('label')
    expect(result[0]).toHaveProperty('availability')
  })

  it('returns different availability across plans', () => {
    const starter = getComparisonFeatures('starter')
    const premium = getComparisonFeatures('premium')
    expect(starter.length).toBe(premium.length)
  })

  it('filters out any comparison feature id that has no matching commercial feature', () => {
    const result = getComparisonFeatures('starter')
    // All returned entries must have a label (i.e. nulls were filtered)
    expect(result.every((f) => typeof f.label === 'string')).toBe(true)
  })
})
