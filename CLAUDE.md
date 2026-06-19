# Claude Code — DentalFlow Session Rules

## Collaboration Workflow

- **Inspect before editing.** Read the exact files before proposing any change. After inspection, deliver a short plan and wait for explicit approval before modifying files.
- **No package manager commands without approval.** Do not run `bun`, `pnpm`, `npm`, or `yarn` commands (install, add, remove, update) unless the user explicitly approves.
- **No commits without approval.** Stage and commit only after the user says so.
- **No Co-Authored-By trailers.** Do not add `Co-Authored-By` lines to commit messages.

## Package Manager

This project uses **Bun**. Use `bun` for all package management and script execution.

```
bun install          # install dependencies
bun run <script>     # run a package.json script
bun add <pkg>        # add a dependency
bun remove <pkg>     # remove a dependency
```

Do not use `pnpm`, `npm`, or `yarn`.

## Validation Sequence

Run in this order after any TypeScript or logic change. Do not skip steps.

```
bun run typecheck
bun run test
bun run build
bun run check
```

- `bun run typecheck` (`tsc --noEmit`) is fast but misses some strict checks.
- `bun run build` (`tsc -b`) is the authoritative TypeScript gate — it catches unused type imports and composite project errors.
- `bun run check` runs Biome (lint + format) and the unused-files check.

## Code Quality

This project uses **Biome** for linting and formatting (replaces ESLint + Prettier).

```
bun run check          # check everything (biome + unused files)
bun run check:write    # auto-fix biome issues
bun run format         # format all files
bun run lint           # lint only
```

Do not add `eslint-disable` or `biome-ignore` comments. Fix the underlying issue instead.

## Off-Limits Areas

Do not touch the following unless the user explicitly scopes the task there:

- Backend code (Node/Express/Prisma) and database migrations
- Auth flow (`src/features/auth/`)
- Billing and Stripe logic
- Package files (`package.json`, `bun.lock`)
- Route definitions (`src/app/router.tsx`, `src/app/route-components.tsx`)
- Any feature outside the explicitly requested scope

## What Counts as a Change

These are **not** permitted as side effects of a scoped task:

- Visual changes (class names, spacing, copy)
- Filtering or sorting behavior changes
- Route changes
- Service or API call changes

If an improvement is noticed outside scope, report it — do not implement it.
