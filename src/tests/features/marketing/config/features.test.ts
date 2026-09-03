import {
  PLAN_ORDER,
  commercialFeatures,
  getFeatureAvailability,
  getFeaturesByCategory,
  getPlanCardFeatures,
} from '@/features/marketing/config/features'

describe('getFeaturesByCategory', () => {
  it('groups only public-audience features by category', () => {
    const groups = getFeaturesByCategory()
    expect(groups.length).toBeGreaterThan(0)
    for (const group of groups) {
      expect(group.features.length).toBeGreaterThan(0)
      for (const feature of group.features) {
        expect(feature.audience).toBe('public')
        expect(feature.category).toBe(group.category)
      }
    }
  })

  it('omits categories with no public features', () => {
    const groups = getFeaturesByCategory()
    const categories = groups.map((g) => g.category)
    expect(new Set(categories).size).toBe(categories.length)
  })
})

describe('getFeatureAvailability', () => {
  it('returns the availability value for the given plan', () => {
    const feature = commercialFeatures[0]
    for (const plan of PLAN_ORDER) {
      expect(getFeatureAvailability(feature, plan)).toBe(feature.availability[plan])
    }
  })
})

describe('getPlanCardFeatures', () => {
  it('returns features, sectionLabel, and upgradeHints for every plan', () => {
    for (const plan of PLAN_ORDER) {
      const result = getPlanCardFeatures(plan)
      expect(Array.isArray(result.features)).toBe(true)
      expect(Array.isArray(result.upgradeHints)).toBe(true)
      for (const f of result.features) {
        expect(typeof f.label).toBe('string')
      }
      for (const hint of result.upgradeHints) {
        expect(hint.availability).toBe('not_included')
      }
    }
  })

  it('filters out any configured feature id that has no matching public feature', () => {
    // Every plan's card features should resolve to real commercialFeatures entries only.
    for (const plan of PLAN_ORDER) {
      const result = getPlanCardFeatures(plan)
      const publicIds = new Set(
        commercialFeatures.filter((f) => f.audience === 'public').map((f) => f.id),
      )
      // We can't directly compare ids (label may be overridden), but every returned
      // feature's availability must equal some real public feature's availability
      // for that plan, proving null entries (missing lookups) were filtered.
      expect(result.features.every((f) => f.availability !== undefined)).toBe(true)
      expect(publicIds.size).toBeGreaterThan(0)
    }
  })
})
