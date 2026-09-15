import * as routeComponents from '@/app/route-components'

// Every route component is a React.lazy wrapper around a dynamic import that
// re-maps a named export onto `default`. A typo in either the module path or the
// named export produces a component that only fails when a user first navigates
// to that route, so these tests resolve every wrapper up front.
//
// React stores the un-invoked factory on the lazy payload until the component is
// first rendered. Reading it here runs the real import without mounting the page
// (several of these pull in WebGL, charting and media modules that cannot mount
// in jsdom). If React changes that shape the shape assertion below fails loudly
// rather than silently skipping the check.

type LazyFactory = () => Promise<{ default: unknown }>

type LazyComponent = {
  _payload?: { _status?: number; _result?: LazyFactory }
}

const entries = Object.entries(routeComponents)

function getFactory(component: unknown): LazyFactory {
  const payload = (component as LazyComponent)._payload
  if (typeof payload?._result !== 'function') {
    throw new Error('route component is not an un-initialised React.lazy wrapper')
  }
  return payload._result
}

// Resolving these imports is the expensive part: they pull in real page
// modules with large dependency graphs (charts, 3D, media). Measured under
// coverage, the first entry took 17.7s and DashboardPage 7.1s while most took
// under 200ms — the first import of any shared dependency is billed to
// whichever test happens to trigger it. Paying that inside a per-test budget
// made the slowest entries flaky under parallel load, timing out at 30s.
//
// So resolve everything once, up front, and keep the per-route assertions
// synchronous. The same imports still run for real, each route still reports
// its own failure, and no individual test carries shared start-up cost.
const resolutions = new Map<string, { default: unknown } | Error>()

beforeAll(async () => {
  for (const [name, component] of entries) {
    try {
      resolutions.set(name, await getFactory(component)())
    } catch (error) {
      resolutions.set(name, error instanceof Error ? error : new Error(String(error)))
    }
  }
}, 180_000)

describe('route-components', () => {
  it('exports at least one lazy route component', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  it('resolves every exported route component', () => {
    expect(resolutions.size).toBe(entries.length)
  })

  it.each(entries)('%s resolves to a renderable component', (name) => {
    const resolution = resolutions.get(name)
    if (resolution instanceof Error) throw resolution
    expect(typeof resolution?.default).toBe('function')
  })
})
