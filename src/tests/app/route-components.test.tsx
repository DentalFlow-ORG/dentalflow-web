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

describe('route-components', () => {
  it('exports at least one lazy route component', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  // These import real page modules with large dependency graphs (charts, 3D,
  // media), so they need more than the default per-test budget.
  it.each(entries)(
    '%s resolves to a renderable component',
    async (_name, component) => {
      const resolved = await getFactory(component)()
      expect(typeof resolved.default).toBe('function')
    },
    30_000,
  )
})
