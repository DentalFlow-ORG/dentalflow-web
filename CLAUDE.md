# Claude Code — DentalFlow Session Rules

## Collaboration Workflow

- **Inspect before editing.** Read the exact files before proposing any change. After inspection, deliver a short plan and wait for explicit approval before modifying files.
- **No package manager commands without approval.** Do not run `pnpm`, `npm`, or `yarn` commands (install, add, remove, update) unless the user explicitly approves.
- **No commits without approval.** Stage and commit only after the user says so.
- **No Co-Authored-By trailers.** Do not add `Co-Authored-By` lines to commit messages.

## Validation Sequence

Run in this order after any TypeScript or logic change. Do not skip steps.

```
pnpm exec tsc --noEmit
pnpm test --run
pnpm run build
```

`tsc --noEmit` is fast but misses some strict checks. `pnpm run build` (`tsc -b`) is the authoritative gate — it catches unused type imports and composite project errors that `--noEmit` does not.

## Off-Limits Areas

Do not touch the following unless the user explicitly scopes the task there:

- Backend code (Node/Express/Prisma) and database migrations
- Auth flow (`src/features/auth/`)
- Billing and Stripe logic
- Package files (`package.json`, `pnpm-lock.yaml`)
- Route definitions (`src/app/router.tsx`, `src/app/route-components.tsx`)
- Any feature outside the explicitly requested scope

## What Counts as a Change

These are **not** permitted as side effects of a scoped task:

- Visual changes (class names, spacing, copy)
- Filtering or sorting behavior changes
- Route changes
- Service or API call changes

If an improvement is noticed outside scope, report it — do not implement it.
