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
    auth/
      components/
      pages/
      services/
      types.ts
    marketing/
      components/
      data/
      pages/
  lib/
  services/
```

### Folder Responsibilities

- `src/app`: application composition, router setup, providers, and app-level wiring.
- `src/components/ui`: reusable shadcn/ui primitives and shared UI components only.
- `src/components/brand`: shared brand presentation components.
- `src/components/common`: generic visual building blocks such as cards, badges, and section headings.
- `src/components/layout`: shared layout-level components such as footer and shell elements.
- `src/config`: static configuration such as company data, environment config, and app constants.
- `src/features/<feature>`: feature-owned pages, components, services, hooks, data, and types.
- `src/services`: cross-feature infrastructure services such as HTTP clients.
- `src/lib`: framework-agnostic utilities.

## Routing Rules

- Use TanStack Router for all application routes.
- Keep route definitions in `src/app/router.tsx` unless the route tree becomes large enough to split.
- Pages must be imported from feature folders.
- Do not implement page switching with local state when a route is appropriate.
- Use query params for simple UI modes that should be shareable, such as `/acessar?mode=login`.

## API Integration Rules

- All API calls must be centralized in services.
- Never call `fetch` or backend SDKs directly inside React components.
- Cross-feature HTTP behavior belongs in `src/services/http.ts`.
- Feature-specific API calls belong in `src/features/<feature>/services`.
- Use typed payloads and typed responses.
- Prepare services so React Query can be added later without rewriting API access.
- The frontend must not contain business logic, payment logic, or sensitive rules.

## Component Rules

- Reusable components first.
- Avoid duplicating UI patterns across pages.
- Keep components small and strongly typed.
- Pages should compose feature sections and avoid containing large JSX blocks.
- Static content for complex pages belongs in feature-level `data/` files.
- Extract repeated card, metric, badge, heading, brand, and form-field patterns before adding new page-specific markup.
- Feature-only components stay inside their feature.
- Shared components must be genuinely reusable before moving to `src/components`.

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

## Implementation Checklist

Before implementing:

1. Analyze existing components and feature folders.
2. Check for reusable UI patterns.
3. Avoid duplication.
4. Follow the current design system.
5. Keep changes scoped to the requested feature.
6. Validate with `pnpm run build` when implementation changes TypeScript or routing.

## Role

Act as a Senior Frontend Engineer for a SaaS product.
