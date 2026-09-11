# Frontend hardening — current continuation results (2026-09-11)

**PARTIAL — substantive meaningful coverage gaps remain.** This report supersedes the earlier intermediate report; historical commits are preserved.

Started on `dev/yago` at `6867ed3`, clean. Current validated source/test commit: `d53ff38`; the following documentation commit changes only reports. No push, merge, branch switch, reset, amend, squash or history rewrite occurred. No dependencies, backend code, HTTP contracts or role permissions changed.

## Coverage

| Metric | Original baseline | First hardening | Fresh start | Current |
| --- | ---: | ---: | ---: | ---: |
| statements | 84.56% | 89.60% | 89.93% | 91.58% |
| branches | 82.08% | 86.84% | 87.29% | 89.47% |
| functions | 80.20% | 85.76% | 86.03% | 88.51% |
| lines | 85.35% | 90.40% | 90.72% | 92.18% |

Fresh measurement: 382 suites / 4,987 tests passed. After priority batches: 382 suites / 5,032 tests; S/B/F/L 91.06% / 88.72% / 87.66% / 91.71%. Current full tests and coverage: **383 suites / 5060 tests**, **+73 tests** and one new suite. The denominator changed only through production fixes and removal of proven dead code; no exclusions were introduced.

## Work completed

- Patients (+16): keyboard row activation and descendant events; appointment details and nullable contacts; list refresh after failure; detail dismissal; owner clinical empty state; avatar upload/removal/error feedback; shared image-decoding fallback and replacement recovery.
- Fiscal (+12): create/edit save payloads, reset, validation, failure preservation/retry, profile busy state, cancellation retry, details failure, ready/simulate dispatch, status/date filtering and pagination.
- Admin (+4): real application tooltip and axis formatters through a Recharts boundary double, hover/leave, light/dark mode, zero-series filtering, inactive plans and nullable billing identity/date presentation.
- Reports (+14): status/date filter round trips, all-types reset, preview/export callbacks, nullable dentist production, failed production loading and plan transitions. Existing OWNER restrictions remain unchanged.
- Scheduling (+25): real phone validation, whitespace-only name rejection, same-day time boundaries, past-date rejection, busy states, failed submit/retry, nullable fields, create/edit reset differences, dentist/service selection, manual/derived prices, lookup failures and out-of-order slot results.
- Other inventory (+2): long dictation transcript expansion/collapse and field reselection. Removed unreachable role-marketing fallback; preserved all four supported variants.

## Confirmed production bugs fixed

1. **Avatar decode failure:** both display and upload avatars kept a broken image after its error event. Two new regressions failed because initials were absent. Shared `useAvatarImage` now restores initials and allows replacement data to load.
2. **Stale slot responses:** both appointment modals accepted obsolete success/error responses after a date change, replacing the latest slots. Four regressions failed before the fix. Effect cleanup now invalidates obsolete success/error/loading updates without changing requests or payloads.
3. **Whitespace-only patient name:** creation sent `patientName: ""` after trimming an all-space value. The regression observed an API call with the empty name. Validation now checks the trimmed name before submitting.

## Dead code removed

Removed the generic safety fallback in `RoleHeroMockup` and its now-unused `accent`, `role`, `icon`, `modules` and `moduleIcons` props. Evidence: the local type admits exactly dashboard/checklist/agenda/schedule; the sole caller passes static typed role content; all four variants were already handled before the fallback. The caller now passes only type. Existing RolePage tests still render all four variants. No intentional production Knip APIs or exported types were removed.

## Remaining gaps and convergence

The [complete current ranked inventory](frontend-coverage-gaps-2026-09-10.md) lists **217 files** with every uncovered line range, branch arm and function, classifications and source context. File-level classifications: A: 86, B: 88, F: 6, E: 1, D: 36. Mixed files may additionally identify specific E arms or F browser requirements.

A/B gaps remain in clinical dictation/editor/autosave, patient attention and detail edges, fiscal workspaces/profile forms, inventory forms and copilots, scheduling calendar/mobile/payment/clinical interactions, authentication, notifications, billing, compliance, team, settings, dashboards and shared UI. These are **open meaningful coverage gaps**, not accepted exemptions. The report explicitly retains them; phases 6/8 have not achieved convergence. A/B branch classifications remain conservative wherever unreachability is not established. Do not label this continuation COMPLETE.

## Browser/manual-only gaps

- Real microphone permissions, camera tracks, MediaRecorder encoding/events, image decoding/canvas crop fidelity and download/print/navigation behavior.
- Recharts pointer geometry, resize/layout and SVG rendering; tests verify application formatting at the library boundary.
- Native calendar/popover behavior, touch/keyboard focus and responsive layouts in real browsers.
- Three.js/WebGL scenes, GSAP/frame timing, reduced-motion and visual rendering.
- Built-app startup, provider composition, lazy route chunk loading/failure and actual browser history/navigation.

No manual browser/E2E pass was performed. jsdom's existing navigation-not-implemented messages are not browser certification.

## Knip reassessment

Standard `bun run knip`: exit 0, no unused code findings. The existing informational hint about `src/test-utils/**` remains. Production `bun run knip:production`: exit 1 with **24 exports and 5 exported types**, unchanged; this is an explained finding set, not a zero-finding pass.

| Remaining symbols | Rationale |
| --- | --- |
| `ODONTOGRAM_TOOTH_TOKENS`, `normalizeOdontogramSnapshot` | Tested odontogram domain API; normalization also has internal callers. |
| `ROLE_HOME_LABELS`, `getRoleHomeLabel`, `getRoleFeatureAccess` | Tested public role configuration contract; permissions preserved. |
| `__resetAvatarCache` | Test seam for session/cache isolation. |
| `COOKIE_CONSENT_KEY` | Persisted consent storage contract exercised by tests. |
| `APPOINTMENT_TRANSITIONS`, `canTransitionTo` | Tested appointment state-machine API. |
| `SLOT_MINUTES`, `DEFAULT_START_MINUTES`, `DEFAULT_END_MINUTES` | Calendar-layout constants used by layout tests. |
| `computeRotatedDimensions` | Tested crop geometry API. |
| `brazilAddMonths` | Tested timezone/date API. |
| `todayIso`, `isFutureDate`, `isEndBeforeStart`, `rangeExceedsMonths` | Tested date-validation API. |
| `isValidCPF`, `formatCPF`, `formatCNPJ`, `formatCEP`, `VALID_UFS`, `formatBrazilianPhone` | Tested Brazilian validation/formatting contracts. |
| `BillingPlanCampaign`, `FiscalInvoiceEvent`, `RoleFeatureAccess`, `HomeFeature`, `AttentionSummary` | Nested/public TypeScript domain/response contracts; no runtime behavior to delete. |

## Validation

| Command | Result |
| --- | --- |
| `bun run typecheck` | PASS (exit 0) |
| `bun run check:biome` | PASS (exit 0) |
| `bun run check:unused` | PASS (exit 0) |
| `bun run test --maxWorkers=2` | PASS: 383 suites / 5060 tests |
| `bun run test:coverage --maxWorkers=2` | PASS: 383 suites / 5060 tests |
| `bun run test:coverage:report` | PASS (exit 0) |
| `bun run build` | PASS (exit 0) |
| `bun run check` | PASS (exit 0) |
| `bun run knip` | PASS (exit 0) |
| `bun run knip:production` | Exit 1: unchanged 24 intentional exports / 5 types |
| `git diff --check` | PASS (exit 0) |
| Search for `.only`, `.skip`, focused test calls and coverage-ignore comments | No matches in src, Vite config or scripts |

Build passed with Vite's chunk-size warning (largest reported chunk: 889.74 kB before gzip). No bundling or dependency changes were made to silence it.

The initial requested coverage run and report both passed. Targeted red regressions confirmed the three bugs above before production fixes. Test harness query/fixture corrections were rerun successfully; no failed full validation is being replaced with an isolated pass. Raw command logs are local ignored `continuation-*.log` files; the reproducible coverage inventory is tracked in docs.

## New commits

| Commit | Message |
| --- | --- |
| `0346e15` | test(patients): cover detail interactions and avatar feedback |
| `b2f8d80` | test(fiscal): harden invoice form and action retries |
| `6daeaf1` | test(admin): cover finance charts and report filter lifecycle |
| `f46099e` | test(scheduling): harden appointment form lifecycle |
| `14aa20d` | fix(patients): restore initials after avatar image failures |
| `18cf2ec` | fix(scheduling): ignore stale slots and reject blank patient names |
| `9cad2d0` | refactor(marketing): remove unreachable role mockup fallback |
| `b7a201f` | test(fiscal): cover invoice filters and pagination |
| `9d2302e` | test(admin): cover billing fallbacks and report exports |
| `d53ff38` | test(clinical-records): cover transcript and selection controls |

A final docs-only commit records this report and the handoff. Recommendation: the commits are validated incremental hardening work, but the requested complete-hardening release criterion has not been met. No push was performed.
