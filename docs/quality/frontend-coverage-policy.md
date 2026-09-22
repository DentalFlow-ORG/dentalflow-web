# Frontend coverage policy

This is the standing policy for frontend test coverage. It explains what the
thresholds mean, what is deliberately not covered, and what has to happen before
a threshold moves.

## Current measurement

Historical baseline: **399 suites / 5,679 tests**. Current audit execution and
updated counts are recorded in [audit-report.md](../audit-report.md), so this
policy does not maintain a second live test-count source. Thresholds below remain unchanged.

| Metric | Covered / total | Coverage | Threshold |
| --- | ---: | ---: | ---: |
| Statements | 9580 / 9912 | 96.65% | 96.5% |
| Branches | 7975 / 8205 | 97.19% | 97.0% |
| Functions | 3281 / 3373 | 97.27% | 97.1% |
| Lines | 8798 / 9062 | 97.08% | 96.9% |

At that historical baseline, 71 of 512 measured files were below 100%. The
classification below must be rechecked when touched files change; it is not a
blanket waiver for new gaps. Statement coverage moves by a
statement or two between runs, which is why the floors sit a little under the
measured figures rather than flush against them.

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
| `marketing/components/landing/DentalArchScene`, `FlowOrbitScene`, `FlowOrbit`, `DentalArch`, `DentalArchSection` | Three.js geometry, materials, renderer frames and WebGL lighting need a real canvas and GPU, plus the lazy/WebGL-support fallbacks that choose between the scene and its poster. |
| `marketing/components/AnimatedImpactSection`, `ProductShowcaseSection`, `DataMigrationSection`, `VideoSection`, `LandingIntegrationsSection`, `Reveal` | GSAP timelines, scroll-driven and IntersectionObserver animation, and frame timing. |
| `patients/components/AvatarCropModal`, `CameraPreviewModal` | `getUserMedia`, camera tracks, canvas crop fidelity, real image decoding and `ResizeObserver` geometry. |
| `clinical-records/components/VoiceDictationCard` | Microphone permissions, `MediaRecorder` encoding and its event sequencing. |
| Recharts-based charts | Pointer hit-testing, sector geometry and resize behavior. Tests verify the application's formatting and callbacks at the library boundary only. |

These are covered instead by the manual browser pass in
[`frontend-browser-qa.md`](frontend-browser-qa.md). Keep that
checklist current when this code changes.

#### Filling a jsdom gap instead of mocking the product

Where jsdom simply omits a standard DOM class, define it in
`src/test-utils/setup.ts` rather than stubbing the component. `AnimationEvent`
is defined there for exactly this reason: without it React never dispatches
`onAnimationEnd`, so a component that cleans up after a CSS animation could not
be exercised through its own handler. That is filling in the environment, not
replacing the code under test — it is not a licence to mock away WebGL,
`MediaRecorder` or `getUserMedia`, whose *behavior* (not just their presence) is
what the tests would have to fake.

The suite also sets `testTimeout`/`hookTimeout` to 20s. Individual tests finish
far faster; the headroom exists because a few fake-timer suites exceed the 5s
default under v8 coverage instrumentation with the full suite in flight, and
failing for load rather than for behavior is not a useful signal.

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
| `clinical-records/containers/ClinicalRecordEditorContainer` template and dictation edit guards | The template panel and `VoiceDictationCard` render only inside `canEditClinicalContent && ...`, so their handlers cannot be invoked for a locked record. The save-draft and odontogram guards *are* reachable -- the action bar and odontogram render for a locked record -- and are tested. |
| `clinical-records/containers/ClinicalRecordEditorContainer` section-content `default` arm | `sectionHasContent` switches over a closed section-id union. |
| `clinical-records/containers/ClinicalRecordEditorContainer` unknown template category | `ClinicalTemplate.category` is a union and `fieldMap` covers every member. |
| `clinical-records/components/OdontogramSection` read-only guards | In read-only mode the chart receives `onSelect={undefined}` and the multi-condition panel is not rendered, so no tooth can be selected and the three mutators cannot be reached. |
| `clinical-records/components/ImageAttachmentPanel` `navigator`/`window` guard, delete-confirm guard and timer cleanup | jsdom and browsers both define `navigator`/`window`; the confirm dialog renders only with a pending id; the description timer is always assigned before its cleanup runs. |
| `clinical-records/containers/ClinicalRecordPrintContainer` `!data` guard | A resolved load always sets `data`; a failure sets `error`, which is checked first. |
| `clinical-records/hooks/useClinicalRecordAutosave` timer cleanup guard | The effect returns its cleanup only after assigning `timerRef.current`, and never nulls it. |
| `clinical-records/utils/parse-dictation-odontogram` and `components/odontogram/OdontogramLegend` label/class fallbacks | Both maps are keyed by `ODONTOGRAM_CONDITION_OPTIONS`; `src/tests/features/clinical-records/utils/odontogram-display-contract.test.ts` asserts they stay complete. |
| `components/common/AiAssistantCard` generate guard, copy guard and format `catch` blocks | The generate button is `disabled` whenever a reason exists and is replaced by the loading block while running; the copy button renders only with a result; `toLocaleString` and `String.split` do not throw. |
| `billing/components/PricingCard` promotional-price fallback and `getButtonIcon` `null` | The launch block renders only when `promotionalPriceMonthly != null`; `start_trial` is handled by the rocket branch, and the remaining four action types are all matched. |
| `billing/pages/SubscriptionSuccessPage` `cancelled` guard in `runCheck` | The effect cleanup clears the retry timeout, so a scheduled retry cannot run after cancellation. |
| `compliance` tabs' `(result?.data.length ?? 0)` fallback | `data` is null only when `error` is set, and `!error` short-circuits first. |
| `compliance/components/PrivacyRequestsTab` request-type fallbacks | `requestType` is a union and the filter list is built from the label map's own keys. |
| `dashboard/containers/ProductivityCenter` priority and stock-status fallbacks | `ProductivityAction.priority` and `criticalProducts[].status` are closed unions the maps cover in full. The payment-status map *is* keyed by a plain string and its fallback is tested. |
| `dashboard/components/TodayAppointmentsChart` inactive-legend guards | The legend button is `disabled` for a zero-count row. |
| `finance/components/ColorPicker`, `TransactionsTable`, `ExpenseClassifyAction` label fallbacks | Keyed by `CATEGORY_COLORS` or a source union; `src/tests/features/finance/finance-display.test.ts` asserts the maps stay complete. |
| `finance/components/IncomeExpensesChart` last-point and series-label fallbacks | The empty dataset returns early, and tooltip keys come from the chart's own three declared series. |
| `finance/containers/FinancePageContainer` `typeof document` guard | `document` always exists in the browser and in jsdom. |
| `notifications/components/AppointmentNotificationActions` slug fallback | Rendered slugs come from `TEMPLATES_BY_STATUS`; `src/tests/features/notifications/notifications-display.test.ts` asserts every one has a label. |
| `admin/components/UserFormModal` empty `clinicId` | Submission is blocked earlier when a clinic-scoped role has no clinic selected. |
| `inventory/components/StockMovementModal` `!product` guard and `?? 0` fallbacks | The dialog's `open` is `product !== null`; the quantity guards return before the fallbacks are reached. The negative-quantity guard *is* reachable and is tested. |
| `inventory/components/CategoryManagerModal` and `fiscal/containers/FiscalInvoicesPageContainer` confirm guards | Each confirmation renders only once its target is set. |
| `scheduling/components/availability/ExceptionManager` and `ExceptionEditModal` guards | The edit modal renders only with a selected exception, and Radix's `onEscapeKeyDown`/`onPointerDownOutside` already prevent dismissal while saving, so the second guard never sees a pending state. |
| `scheduling/components/availability/ExceptionForm` reason fallback | The reason field is always rendered, so `FormData.get` never returns null. |
| `scheduling/components/appointments/AppointmentClinicalSection` and `AppointmentServiceValueSection` guards | Each button renders only when its value is present; `restoredPrice` is a formatted string, so a zero price is still truthy. |
| `scheduling/components/mobile/MobileAgendaTimeline` end-time fallback | `formatWallTime` never returns an empty string; a missing end time is announced explicitly. |
| `scheduling/utils/week-calendar-layout` exception time guard | `specialExceptions` is already filtered on `startTime && endTime`. |
| `settings/containers/SettingsPageContainer` empty-name payload guard | `validateClinicProfile` rejects a blank name before the payload is built. |
| `marketing/pages/IntegrationsPage` logo and status-label fallbacks | Every `integrationCards` entry defines both; asserted by the page's content-contract tests. |
| `marketing/components/RoleSwitcher` empty-list guard | `ROLE_KEYS` has four entries and the filter removes at most one. |
| `marketing/config/features` unresolved feature id | Every configured card feature id resolves to a public commercial feature; asserted by the `getPlanCardFeatures` tests. |
| `marketing/pages/FaqPage` unresolved group index | The three groups index every entry of `faqItems` exactly once; asserted by the page's group-contract test. |
| `marketing/components/FeatureMockups` blue and slate dot variants | `MockupRow.dot` shares `ChipVariant` with `MockupChip`; no mockup currently passes those two members for a dot. |
| `marketing/hooks/useDropdownNav` `headerRef` guard | `PublicHeader` always attaches the ref before a dropdown can be opened. |

An E classification is a claim about the code, not a preference. If you change
the surrounding code, re-check the claim.

### D — non-behavioral declarations

- Static type-only modules (`features/inventory/types/inventory.types.ts`) and
  app bootstrap composition (`src/App.tsx`, `src/app/RootRoute.tsx`,
  `src/main.tsx`), whose behavior is covered through the router and provider
  tests rather than by re-asserting their JSX.
- No-op callback props passed to a child that cannot invoke them in that
  context: the read-only appointment drawer's `onStatusChange` and
  `onCancelRequest` in `dashboard/containers/DashboardPageContainer`,
  `DentistHomePageContainer` and `scheduling/containers/SchedulePageContainer`,
  and the notification drawer's `onSent`. They exist to satisfy a required
  prop, not to do anything.
- `clinical-records/hooks/useUnsavedChangesGuard`'s `shouldBlockFn`, a constant
  `() => true` handed to TanStack Router's `useBlocker`; activation is driven by
  the `disabled` flag, which is tested.

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
