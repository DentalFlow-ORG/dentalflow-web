import { router } from '@/app/router'
import { NotFoundPage } from '@/components/common/NotFoundPage'

/**
 * Guards the wiring, not just the component: without this the router silently
 * falls back to its English built-in again.
 */
describe('router not-found handling', () => {
  it('uses the product 404 page rather than the router default', () => {
    const { options } = router as unknown as {
      options: { defaultNotFoundComponent?: unknown }
    }

    expect(options.defaultNotFoundComponent).toBe(NotFoundPage)
  })
})
