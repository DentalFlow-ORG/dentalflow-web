# DentalFlow - Frontend Instructions

## Product Context

DentalFlow is a SaaS platform for dentists focused on revenue growth, digital presence, patient acquisition, and measurable business outcomes.

The frontend must always feel premium, clean, modern, trustworthy, and business-oriented.

## Stack

Do not change the frontend stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Router

## Architecture

Use a feature-first architecture. New product areas must live under `src/features/<feature-name>`.

Required structure:

```txt
src/
  app/
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
```

### Folder Responsibilities

- `src/app`: application composition, router setup, providers, and app-level wiring.
- `src/components/ui`: reusable shadcn/ui primitives and shared UI components only.
- `src/components/brand`: shared brand presentation components.
- `src/components/common`: generic visual building blocks such as cards, badges, and section headings.
- `src/components/layout`: shared layout-level components such as footer and shell elements.
- `src/config`: static configuration such as company data, environment config, and app constants.
- `src/features/<feature>`: feature-owned pages, containers, components, hooks, providers, services, types, constants, utils, and data.
- `src/hooks`: cross-feature reusable hooks that do not belong to any single feature, such as `useListFilter` and `useIsMobile`.
- `src/services`: cross-feature infrastructure services such as HTTP clients.
- `src/lib`: framework-agnostic utilities.
- `src/test`: shared test setup and helpers for Vitest and React Testing Library.

### Feature Directory Responsibilities

- `pages`: thin route-level renderers only. A page should usually render a container and avoid orchestration logic.
- `containers`: page orchestration and composition. Containers connect hooks, page state, handlers, loading/error/empty states, and feature components.
- `components`: reusable UI pieces owned by the feature. Components should be presentational or focused interactions.
- `hooks`: feature-specific stateful or reusable logic, such as `useAuth`. Do not hide reusable or complex hooks inside components.
- `providers`: feature context providers and state wiring.
- `services`: backend or client integration for that feature. API calls and backend SDK usage belong here, not in visual components.
- `types`: shared TypeScript contracts for the feature, split by concern when useful.
- `constants`: static data with no logic owned by the feature — status/tone/color maps, label records, filter option arrays, tab configs, and navigation card arrays. Do not place functions or computed values here.
- `utils`: pure functions with logic owned by the feature — formatters, calculators, validators, state machine helpers, layout algorithms, and storage adapters. Do not place plain static records or option arrays here; those belong in `constants/`.
- `data`: static marketing, legal, product, or mock/demo content owned by the feature.
- Test files (`.test.ts`, `.test.tsx`) are colocated beside the source file they cover. There is no top-level `tests/` folder per feature.

## Routing Rules

- Use TanStack Router for all application routes.
- Keep route definitions in `src/app/router.tsx` unless the route tree becomes large enough to split.
- Pages must be imported from feature folders.
- Every lazy export in `src/app/route-components.tsx` must be connected to a real route in `src/app/router.tsx`; otherwise remove it with the unused page/container/hook files.
- Do not implement page switching with local state when a route is appropriate.
- Use query params for simple UI modes that should be shareable, such as `/acessar?mode=login`.

## API Integration Rules

- All API calls must be centralized in services.
- Never call `fetch` or backend SDKs directly inside React components.
- Cross-feature HTTP behavior belongs in `src/services/http.ts`.
- Feature-specific API calls belong in `src/features/<feature>/services`.
- Visual components should not call services directly. If a component grows orchestration or service calls, move that logic into a container or feature hook and keep the component focused on UI.
- Use typed payloads and typed responses.
- Prepare services so React Query can be added later without rewriting API access.
- The frontend must not contain business logic, payment logic, or sensitive rules.

### Current Backend Contract

Until the backend provides an official OpenAPI/Swagger contract, the frontend assumes:

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `POST /auth/logout`
- `Authorization: Bearer <accessToken>` for authenticated requests.

If the backend moves to HTTP-only cookies, keep components unchanged and update only `src/services/http.ts`, `src/features/auth/services`, and session handling.

## Component Rules

- Reusable components first.
- Avoid duplicating UI patterns across pages.
- Keep components small and strongly typed.
- Pages should compose feature sections and avoid containing large JSX blocks.
- Do not create large pages with state, API calls, and handlers inline; extract a container and feature hooks.
- Static content for complex pages belongs in feature-level `data/` files.
- Extract repeated card, metric, badge, heading, brand, and form-field patterns before adding new page-specific markup.
- Extract shared components, hooks, services, constants, or utils when a pattern repeats across files.
- Do not define inline display maps, label records, tone maps, or filter option arrays inside component or container files. Place them in the feature's `constants/` directory.
- Feature-only components stay inside their feature.
- Shared components must be genuinely reusable before moving to `src/components`.

## Testing Rules

- Use Vitest and React Testing Library for behavior-focused tests.
- Prefer `src/test/render-utils.tsx` for component tests.
- Mock feature hooks or services when testing UI behavior that depends on auth, routing, or backend state.
- Add tests for new components, hooks, services, and utilities when they contain branching logic, state transitions, validation, or API integration behavior.
- Avoid brittle visual snapshots, long Tailwind class assertions, and tests that only duplicate static markup.

## UI / UX Guidelines

- Clean, minimal, professional interfaces.
- Clear hierarchy and consistent spacing.
- SaaS pages should feel operational, trustworthy, and business-focused.
- Buttons must use the shared `Button` component variants and sizes.
- Do not hardcode one-off button colors in pages unless there is a specific design exception.

## Design System

Primary: `#1E3A8A`

Secondary: `#10B981`

Accent: `#6366F1`

## Security

- Never expose sensitive data in the frontend.
- Never trust client-side validation alone.
- Never store payment or sensitive credentials in local frontend state beyond what is needed for UI interaction.

## Package Manager

Use `pnpm` exclusively. Do not run `pnpm install`, `pnpm add`, or `pnpm remove` without explicit user approval.

## Implementation Checklist

Before implementing:

1. Analyze existing components and feature folders.
2. Check for reusable UI patterns, hooks, services, constants, and utilities.
3. Propose a short implementation plan before coding when the change affects architecture, routing, shared components, or docs.
4. Avoid duplication.
5. Follow the current design system.
6. Keep changes scoped to the requested feature.
7. Validate TypeScript and tests with the full three-step sequence:
   ```
   pnpm exec tsc --noEmit
   pnpm test --run
   pnpm run build
   ```
   `pnpm run build` (`tsc -b`) is the authoritative gate — it catches strict errors that `tsc --noEmit` misses.

## Role

Act as a Senior Frontend Engineer for a SaaS product.
