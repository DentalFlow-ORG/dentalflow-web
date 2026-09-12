# Frontend coverage policy

This is the standing policy for frontend test coverage. It explains what the
thresholds mean, what is deliberately not covered, and what has to happen before
a threshold moves.

## Current measurement

Measured on `dev/yago` with `bun run test:coverage`: **391 suites / 5,569 tests**.

| Metric | Covered / total | Coverage | Threshold |
| --- | ---: | ---: | ---: |
| Statements | 9552 / 9913 | 96.35% | 96.2% |
| Branches | 7919 / 8207 | 96.49% | 96.3% |
| Functions | 3270 / 3374 | 96.91% | 96.7% |
| Lines | 8778 / 9063 | 96.85% | 96.7% |

85 of 512 measured files are below 100%.

## Commands

```bash
bun run test:coverage         # full run; fails if a threshold is breached
bun run test:coverage:report  # per-file uncovered lines, branches and functions
```

`test:coverage:report` reads `coverage/coverage-final.json` and prints every
uncovered line range, branch arm and function per file. Run `test:coverage`
first.

## The thresholds are floors

The thresholds in `vite.config.ts` sit just under the measured numbers. They
exist so coverage cannot quietly erode.

- **Never lower a threshold to make a run pass.** Add the missing test instead.
- **Raise the thresholds** when the excluded surface below genuinely shrinks.
- A threshold is not a target. New code is expected to arrive fully tested; see
  the Definition of Done in `AGENTS.md`.

## Why the floors are not 100%

Every remaining gap falls into one of three categories. Nothing is hidden with a
coverage-ignore directive — the repository contains none, and adding one is not
permitted.

### F — real browser behavior jsdom cannot certify

The largest share of the remaining uncovered surface. These execute correctly
only against a real engine, and a mock that returns a canned value proves the
mock, not the product.

| Area | Why it cannot be unit-tested honestly |
| --- | --- |
| `marketing/components/landing/DentalArchScene`, `FlowOrbitScene`, `FlowOrbit`, `DentalArch` | Three.js geometry, materials, renderer frames and WebGL lighting need a real canvas and GPU. |
| `marketing/components/AnimatedImpactSection`, `ProductShowcaseSection`, `DataMigrationSection`, `VideoSection`, `LandingIntegrationsSection`, `Reveal` | GSAP timelines, scroll-driven and IntersectionObserver animation, and frame timing. |
| `patients/components/AvatarCropModal`, `CameraPreviewModal` | `getUserMedia`, camera tracks, canvas crop fidelity, real image decoding and `ResizeObserver` geometry. |
| `clinical-records/components/VoiceDictationCard` | Microphone permissions, `MediaRecorder` encoding and its event sequencing. |
| Recharts-based charts | Pointer hit-testing, sector geometry and resize behavior. Tests verify the application's formatting and callbacks at the library boundary only. |

These are covered instead by the manual browser pass in
[`frontend-browser-qa.md`](frontend-browser-qa.md). Keep that
checklist current when this code changes.

### E — branches unreachable by construction

Defensive guards that cannot execute given the surrounding code. Each was checked
against its callers rather than assumed:

| Location | Why it cannot execute |
| --- | --- |
| `auth/components/AuthForm` mode guard | `AuthMode` admits only `login` and `register`, and the `/acessar` route's `validateSearch` coerces its search param to one of them. |
| `auth/pages/ResetPasswordPage` submit token guard | The render guard already replaces the form with the invalid-link screen when no token is present, so the submit handler cannot run without one. |
| `components/common/PasswordResetModal` max-length guard | The field carries `maxLength={PASSWORD_MAX_LENGTH}`, so the value can never exceed it through the UI. |
| `compliance/services/compliance.service` empty query string | All three filter contracts require `page` and `limit`, so the query string is never empty. |
| `reports/utils/report-filter-chips` finance label fallbacks | The finance `type` and `status` filters are union-typed and the label maps cover every member. The appointment, inventory and invoice equivalents are typed as plain strings, so their fallbacks *are* reachable and are tested. |
| `reports/components/ReportCard` `!onPreview` guard | The preview button renders only when `onPreview` is provided. |
| `reports/components/ReportPreviewPanel` catch | `toLocaleString` returns `"Invalid Date"` for an invalid date rather than throwing. |
| `reports/containers/ReportsPageContainer` zero-total completion rate | Every map entry is inserted only after its total is incremented. |
| `patients/containers/PatientsAttentionContainer` and `PatientsPageContainer` no-filter empty states | `filteredItems` derives from `allItems` through the filters, so an empty filtered list with no active filter contradicts the enclosing non-empty guard. |

An E classification is a claim about the code, not a preference. If you change
the surrounding code, re-check the claim.

### D — non-behavioral declarations

Static type-only modules and app bootstrap composition (`src/App.tsx`,
`src/app/RootRoute.tsx`), whose behavior is covered through the router and
provider tests rather than by re-asserting their JSX.

## What is *not* an acceptable reason to leave something uncovered

- "It is only a page" — route pages are covered; see
  `src/tests/features/app-route-pages.test.tsx` and
  `src/tests/app/route-components.test.tsx`.
- "It is just a label" — nullable and singular/plural presentation is real
  behavior and is tested throughout.
- "The test would be hard to write" — that is usually a sign the component mixes
  orchestration into UI. Extract a hook or container.

## Adding a new exception

Do not add one silently. An exception requires:

1. The classification (E or F) and the specific reason, in this document.
2. Evidence: for E, the caller or type that makes the branch unreachable; for F,
   the browser API involved, plus an entry in the manual QA checklist.
3. No coverage-ignore directive in the source.

## Retained dead-code findings

`bun run knip` passes. `bun run knip:production` exits non-zero with a stable,
reviewed set of **24 exports and 5 exported types**. These are kept
deliberately; do not delete them to make the command green.

| Retained symbols | Why |
| --- | --- |
| `isValidCPF`, `formatCPF`, `formatCNPJ`, `formatCEP`, `VALID_UFS`, `formatBrazilianPhone` | One cohesive Brazilian validation/formatting contract in `src/lib/validators/br.ts`. Most also have internal callers in the same module; they stay exported so each rule is unit-tested directly rather than only through a wrapper. |
| `todayIso`, `isFutureDate`, `isEndBeforeStart`, `rangeExceedsMonths` | Same, for the date-range rules. |
| `brazilAddMonths` | Tested timezone API. |
| `computeRotatedDimensions` | Tested crop geometry API, with internal callers. |
| `APPOINTMENT_TRANSITIONS`, `canTransitionTo` | The appointment state machine's public contract. |
| `SLOT_MINUTES`, `DEFAULT_START_MINUTES`, `DEFAULT_END_MINUTES` | Calendar-layout constants asserted by the layout tests. |
| `ODONTOGRAM_TOOTH_TOKENS`, `normalizeOdontogramSnapshot` | Odontogram domain API; normalization also has internal callers. |
| `ROLE_HOME_LABELS`, `getRoleHomeLabel`, `getRoleFeatureAccess` | Role configuration contract. Permissions are asserted against it. |
| `COOKIE_CONSENT_KEY` | The persisted consent storage key, asserted by the consent tests. |
| `__resetAvatarCache` | Explicit test seam for cache isolation between suites. |
| `BillingPlanCampaign`, `FiscalInvoiceEvent`, `RoleFeatureAccess`, `HomeFeature`, `AttentionSummary` | Nested response/domain types with no runtime behavior to delete. |

Before adding to this table, prove there is no production consumer: check
production imports, test imports, route registration, lazy and dynamic imports,
and config usage.
