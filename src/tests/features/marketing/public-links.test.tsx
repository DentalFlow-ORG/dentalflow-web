import { router } from '@/app/router'
import { FEATURED_MODULES, OTHER_MODULES } from '@/features/marketing/pages/FeaturesPage'

/**
 * Every feature the public site advertises must point at a route that exists.
 *
 * This is the guard the codebase was missing. The features page advertised a
 * "CRM de leads" card linking to `/funcionalidades/leads` for three months
 * after that feature was retired, and nothing noticed — the card rendered
 * fine, and the suite asserted only that the link was *present*. Only a
 * visitor clicking it would have discovered there was no such page.
 *
 * So this compares the marketing configuration against the real route table
 * rather than against a hard-coded list. A future dead link fails here
 * whatever it is called, and a feature page that is renamed rather than
 * removed fails too.
 */

const ALL_MODULES = [...FEATURED_MODULES, ...OTHER_MODULES]

/** Every path the router can actually serve. */
function knownRoutePaths(): Set<string> {
  const { routesById } = router as unknown as {
    routesById: Record<string, unknown>
  }
  return new Set(Object.keys(routesById))
}

describe('public feature navigation', () => {
  it('advertises at least the modules the product ships', () => {
    // A guard against the list being emptied to make the rest pass.
    expect(ALL_MODULES.length).toBeGreaterThanOrEqual(9)
  })

  it('points every advertised module at a route the router serves', () => {
    const known = knownRoutePaths()

    const broken = ALL_MODULES.filter((module) => !known.has(module.href)).map(
      (module) => `${module.id} -> ${module.href}`,
    )

    expect(broken).toEqual([])
  })

  it('advertises no retired leads feature', () => {
    const leadModules = ALL_MODULES.filter(
      (module) =>
        module.id.includes('lead') ||
        /lead/i.test(module.label) ||
        /lead/i.test(module.description),
    )

    expect(leadModules).toEqual([])
  })

  it('no longer routes /funcionalidades/leads at all', () => {
    // Belt and braces: even if the card came back, the route is gone, so the
    // previous test and this one cannot both be satisfied by accident.
    expect(knownRoutePaths().has('/funcionalidades/leads')).toBe(false)
  })

  it('keeps the self-service signup route the CTAs depend on', () => {
    // There is no public lead form; `/acessar` is the only way a visitor
    // enters the product, so every marketing CTA targets it.
    expect(knownRoutePaths().has('/acessar')).toBe(true)
  })
})
