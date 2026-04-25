import {
  createRoute,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'

import { AuthRoutePage } from '@/features/auth/pages/AuthRoutePage'
import type { AuthMode } from '@/features/auth/types'
import { LandingPage } from '@/features/marketing/pages/LandingPage'

const rootRoute = createRootRoute()

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/acessar',
  validateSearch: (search: Record<string, unknown>): { mode: AuthMode } => ({
    mode: search.mode === 'register' ? 'register' : 'login',
  }),
  component: AuthRoutePage,
})

const routeTree = rootRoute.addChildren([indexRoute, authRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
