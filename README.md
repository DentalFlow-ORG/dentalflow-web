# DentalFlow - Frontend

DentalFlow is a SaaS frontend for dentists and clinics. The product focuses on
clinic management, patient acquisition, digital presence, revenue growth, and
measurable business outcomes.

This repository contains only the frontend application.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui patterns where used
- TanStack Router
- Vitest + React Testing Library

Do not change the stack without explicit approval.

## Frontend Responsibilities

The frontend is responsible for UI, UX, routing, stateful interactions, and API
integration through typed services.

The frontend must not contain critical backend business logic, payment rules,
subscription validation, sensitive authorization rules, or credential handling.

## Current Structure

```txt
src/
  app/
    RootRoute.tsx
    route-components.tsx
    router.tsx
  components/
    brand/
    common/
    layout/
    ui/
  config/
  features/
    <feature-name>/
      components/
      containers/
      constants/
      data/
      hooks/
      pages/
      providers/
      services/
      types/
      utils/
  hooks/
  lib/
  services/
  test/
  tests/
```

## Architecture Rules

- New product areas live under `src/features/<feature-name>`.
- `pages/` files should stay thin and usually render a container.
- `containers/` orchestrate page state, handlers, loading/error states, and
  feature composition.
- `components/` contain reusable UI pieces for that feature.
- `hooks/` contain reusable or stateful feature logic.
- `services/` contain API/client integration. Components should not call
  backend services directly.
- `types/` contain shared TypeScript contracts.
- `constants/` contain reusable static values.
- `utils/` contain pure helpers, mappers, and formatters.
- `data/` contains static marketing, legal, product, or demo content.
- `src/services/http.ts` owns cross-feature HTTP behavior.
- Every lazy export in `src/app/route-components.tsx` must be connected to a
  real route in `src/app/router.tsx` or be removed.

## UI Direction

DentalFlow should feel premium, clean, modern, trustworthy, responsive, and
business-oriented. Reuse existing shared components and design conventions
before creating new patterns.

## Testing

Tests use Vitest and React Testing Library.

- Shared test utilities live in `src/test/` (render-utils, setup, TestProviders).
- Test suites live in `src/tests/`, mirroring the source tree. Use `@/` aliases for all imports inside test files.
- Prefer behavior tests over brittle snapshots.
- Mock hooks or services when testing UI that depends on auth, routing, or API
  state.
- Add tests for components, hooks, services, and utilities when they contain
  meaningful logic.

## Documentation

- Frontend architecture and agent guidance: `AGENTS.md`
- Role and scheduling model: `docs/roles-and-scheduling.md`
- Theme rules: `docs/design/theme-rules.md`
- Button and card guidelines: `docs/design/button-and-card-theme-guidelines.md`
