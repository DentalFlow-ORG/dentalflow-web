# Frontend hardening audit — 2026-09-10

Historical first-pass snapshot. "Final" below means the end of that pass, not
completion of the hardening target. See [the handoff](HARDENING-HANDOFF.md) for
subsequent commits, continuation fixes and refreshed validation.

## Scope and baseline

Baseline: clean `dev/yago` at `308bb61`. Frontend only; no dependency, backend,
API-contract, permission, or UI changes. No commits or pushes.

| Metric | Initial |
| --- | ---: |
| Statements | 84.56% (8341/9864) |
| Branches | 82.08% (6706/8170) |
| Functions | 80.20% (2706/3374) |
| Lines | 85.35% (7713/9036) |

Initial coverage run: 369 files / 4701 passing tests. Unrestricted worker
concurrency caused resource contention and timeouts; that attempt was stopped.
The complete baseline was rerun successfully with `--maxWorkers=2`. The same
worker limit is used for final validation; test timeouts were not increased.

## Final measurements

Complete tests and coverage both passed: **380 suites / 4967 tests** (+266 tests).

| Metric | Initial | Final |
| --- | ---: | ---: |
| Statements | 84.56% | 89.60% (8788/9808) |
| Branches | 82.08% | 86.84% (7071/8142) |
| Functions | 80.20% | 85.76% (2886/3365) |
| Lines | 85.35% | 90.40% (8123/8985) |

The denominator changed only through production deduplication, not exclusions.
There are still 218 files below 100% in one or more dimensions. See the
[complete ranked gap inventory](frontend-coverage-gaps-2026-09-10.md) for every
file, exact line range, missing branch arm, uncalled function and classification.
The 100%-meaningful-coverage objective is **not complete**; substantive A/B gaps
remain. This pass is suitable for incremental review, not a blanket release
or complete-hardening certification.

## Validation commands

Commands inspected before edits:

| Purpose | Command |
| --- | --- |
| TypeScript | `bun run typecheck` |
| Tests | `bun run test --maxWorkers=2` |
| Coverage | `bun run test:coverage --maxWorkers=2` |
| Check-only Biome | `bun run check:biome` |
| Build (authoritative) | `bun run build` |
| Biome and custom unused-file check | `bun run check` |
| All-source Knip | `bun run knip` |
| Production-only Knip | `bun run knip:production` |
| Detailed coverage gap report (added) | `bun run test:coverage:report` |

The original `typecheck` used `tsc --noEmit` against a solution config with an
empty `files` list. It skipped the referenced application/tooling projects.
It now uses `tsc -b --noEmit`; the existing production build remains unchanged.
The stricter check caught test typing issues during this work, which were fixed.

## Coverage priorities and boundaries

Prioritized C1 authorization, authentication, finance mutations and clinical
attachments; C2 shared hook failures, formatting, dates, HTTP refresh concurrency;
C3 loading, retry, empty, nullable-data and plan-gating states. C4 route wrappers,
lazy wiring and marketing presentation were not padded with call-count tests.

The added router matrix exercises the real router and real authorization guards
for ADMIN, OWNER, DENTIST and ASSISTANT across 25 protected routes. Only leaf
pages/layout presentation and session data are replaced at the boundary. It
tests the current route policy, not an invented policy from older documentation.
This protects frontend rendering; it does not establish backend authorization.

Other added coverage includes:

- Attachment load races, upload/thumbnail failures, retry, read-only controls,
  deletion confirmation, caption debounce and cleanup.
- Finance page/service integration, create/edit/delete validation and failures,
  fixed expenses, pagination failures and inclusive leap-day/year-end periods.
- Admin billing event filters, processing errors, pagination and identity/currency
  fallbacks; productivity actions and populated dashboard lists.
- Shared inventory copilot initial/generate failures, 403/429 handling, retries,
  retained results and concurrent-click suppression.
- Stock list/anomaly loading, plan gating, retry, empty/populated responses,
  missing costs and singular/plural movement descriptions.
- Chart series toggling and actual application tooltip content, including
  signed deficits; procedure margin sorting and missing/zero cost information.
- Fiscal reload recovery, patient-attention error recovery, token-refresh
  callbacks/concurrency, and saving/deleting exception dialog dismissal guards.

### Coverage exclusions

No new exclusions or Istanbul/V8 ignore directives were added. Existing narrowly
scoped exclusions remain:

- `src/tests/**`: test code, not application behavior.
- `src/test-utils/**`: fixtures, mocks and test providers, not shipped behavior.
- `src/**/*.d.ts`: declaration-only files with no executable behavior.

All other `src/**/*.{ts,tsx}` remains in the denominator. In particular, neither
large containers nor browser-dependent voice/graphics code is excluded simply
because it is expensive to test. Remaining gaps are a backlog, not a claim of
100% meaningful coverage. The ranked companion report lists all below-100% files,
uncovered line ranges, branch arms and function locations from the final run.

## Dead-code findings and intentional exports

Initial standard Knip: two unused exports. Production Knip: 26 exports and five
exported types. No definitely dead production files were established.

`TRIAL_ENDING_SOON_DAYS` and `NO_RECENT_ACTIVITY_DAYS` in
`src/features/admin/utils/clinic-health.ts` are used only inside that module.
Production/test/configuration references were searched; neither is a router or
dynamic-import entry. Only their `export` modifiers were removed, not the rules.

Remaining production-only findings are intentionally retained:

| Symbols | Classification / reason |
| --- | --- |
| `ODONTOGRAM_TOOTH_TOKENS`, `normalizeOdontogramSnapshot` | D2/D3: tested odontogram domain API; normalization is also called inside its module. |
| `ROLE_HOME_LABELS`, `getRoleHomeLabel`, `getRoleFeatureAccess` | D2/D3: public role configuration API with regression tests; preserve historical role contracts. |
| `__resetAvatarCache` | D2: deliberate session-cache isolation seam used by patient/avatar tests. |
| `COOKIE_CONSENT_KEY` | D2/D3: storage contract used by consent tests. |
| `APPOINTMENT_TRANSITIONS`, `canTransitionTo` | D2/D3: tested scheduling state-machine contract, not obsolete functionality. |
| `SLOT_MINUTES`, `DEFAULT_START_MINUTES`, `DEFAULT_END_MINUTES` | D2/D3: calendar layout constants consumed by layout tests. |
| `computeRotatedDimensions` | D2/D3: tested crop-geometry helper. |
| `brazilAddMonths` | D2/D3: tested timezone/date utility API. |
| `todayIso`, `isFutureDate`, `isEndBeforeStart`, `rangeExceedsMonths` | D2/D3: tested date-validation API. |
| `isValidCPF`, `formatCPF`, `formatCNPJ`, `formatCEP`, `VALID_UFS`, `formatBrazilianPhone` | D2/D3: tested Brazilian validation/formatting contracts. |
| `BillingPlanCampaign`, `FiscalInvoiceEvent`, `RoleFeatureAccess`, `HomeFeature`, `AttentionSummary` | D3: nested/public TypeScript response/domain contracts; no runtime dead-code cost. |

Standard Knip retains the existing informational hint about `src/test-utils/**`
in `ignore`. No broad ignore was introduced to silence production findings.
Production-only Knip is expected to exit 1 with 24 exports and five types; this
is not reported as a zero-finding pass.

## Reuse and organization decisions

| Pattern | Decision and consumers |
| --- | --- |
| R1: identical stock copilot lifecycle/error handling | `usePersistedCopilot` owns the shared state logic; `useStockCopilot` and `useAbnormalConsumptionCopilot` preserve their public contracts and service integrations. Tested before/after extraction. |
| R1/R2: BRL cents formatting | `formatCurrencyBRLCents` reuses the existing number formatter. Dashboard, productivity and inventory use it; inventory's existing import/export name is retained. |
| R1: duplicated calendar OAuth search validation | `parseCalendarReturnSearch` is used by both appointment and dentist calendar routes. Real router tests cover valid, invalid and missing parameters. |
| Repeated finance test fixtures | Typed shared finance factories replace duplicated setup and support hook/container integration tests. A typed attachment factory supports the two upload/management suites. |
| R4/R5: visually similar tables, domain-specific cards and dialogs | Kept local when semantics differ. No generic table/dialog/permission abstraction introduced. |
| Large clinical/admin containers | Recorded as follow-up work, not split speculatively during coverage hardening. |

A TypeScript-resolved static production import/re-export graph checked 511 source
files and found no cycles. This excludes declaration-only/type-only dependencies
and does not claim to prove the absence of dynamic runtime cycles.

## Test quality and final-diff review

- Token-refresh tests execute registered callbacks and assert session/token
  outcomes instead of only asserting that callbacks are functions.
- Inventory focus tests use controlled timers and restore spies instead of fixed
  10 ms sleeps; OWNER generation visibility is checked against all other roles.
- Chart layout is mocked at the Recharts boundary while real application tooltip
  behavior executes. Browser image/canvas boundaries are mocked for uploads.
- Kept useful overflow regression coverage; removed a redundant empty-style
  assertion in the procedure margins suite. No new snapshots were introduced.
- Removed draft copilot-unmount tests during review: a frozen `renderHook` result
  after unmount does not prove that a cancellation guard works. No coverage credit
  is claimed for that assertion; late-request defenses remain in production.
- Only explicitly listed changed files were passed to Biome's write mode; all
  whole-repository Biome runs were check-only. No package installation occurred.
- Production changes preserve role arrays, request payloads, service URLs,
  storage contracts and JSX presentation. Shared logic has multiple consumers.

## Remaining debt and interpretation

- High: meaningful uncovered branches remain in voice dictation, settings,
  patients, fiscal/reports/admin screens and appointment editing. See the ranked
  coverage report for exact locations. The hardening target is not fully met.
  Examples verified in source: voice maximum-duration auto-stop and FileReader
  failures; settings debounced postal-code lookup success/failure; patient detail
  keyboard activation and avatar update feedback. These are not justified
  exclusions and should receive dedicated behavior tests.
- Medium: browser-dependent media/graphics and actual lazy-chunk/bootstrap
  integration are not validated by jsdom-only tests. A browser smoke pass is
  still appropriate before release; no browser-test dependency was added.
- Medium: large feature containers and some local domain display maps remain.
  Refactor them only alongside focused behavioral tests, not by file-size quotas.
- Low: production Knip intentionally reports test/public APIs; the existing
  test-utils configuration hint remains. Existing build chunk-size warnings
  should be assessed separately from this behavior-preserving pass.

The machine-readable report can be regenerated without changing files using
`bun run test:coverage:report`. Its totals were cross-checked against Vitest's
own text summary; line coverage uses the maximum hit count for statements
starting on the same line, matching Istanbul's line aggregation.
For implicit `else` arms without a V8 source span, the reporter identifies the
branch ID/arm and reports the parent condition location explicitly. Such arms
are not silently omitted from the gap list.

## Changed-file inventory

### Production (10)

- [src/app/router.tsx](../../src/app/router.tsx)
- [src/features/admin/utils/clinic-health.ts](../../src/features/admin/utils/clinic-health.ts)
- [src/features/dashboard/containers/DashboardPageContainer.tsx](../../src/features/dashboard/containers/DashboardPageContainer.tsx)
- [src/features/dashboard/containers/ProductivityCenter.tsx](../../src/features/dashboard/containers/ProductivityCenter.tsx)
- [src/features/inventory/hooks/useAbnormalConsumptionCopilot.ts](../../src/features/inventory/hooks/useAbnormalConsumptionCopilot.ts)
- [src/features/inventory/hooks/useStockCopilot.ts](../../src/features/inventory/hooks/useStockCopilot.ts)
- [src/features/inventory/utils/inventory-format.ts](../../src/features/inventory/utils/inventory-format.ts)
- [src/lib/number-formatters.ts](../../src/lib/number-formatters.ts)
- [src/features/inventory/hooks/usePersistedCopilot.ts](../../src/features/inventory/hooks/usePersistedCopilot.ts)
- [src/features/scheduling/utils/calendar-return-search.ts](../../src/features/scheduling/utils/calendar-return-search.ts)

### Tests (26)

- [src/tests/features/admin/containers/AdminFinancePageContainer.test.tsx](../../src/tests/features/admin/containers/AdminFinancePageContainer.test.tsx)
- [src/tests/features/auth/components/ProtectedAppRoute.test.tsx](../../src/tests/features/auth/components/ProtectedAppRoute.test.tsx)
- [src/tests/features/auth/providers/AuthProvider.test.tsx](../../src/tests/features/auth/providers/AuthProvider.test.tsx)
- [src/tests/features/auth/services/auth.service.test.ts](../../src/tests/features/auth/services/auth.service.test.ts)
- [src/tests/features/dashboard/containers/ProductivityCenter.test.tsx](../../src/tests/features/dashboard/containers/ProductivityCenter.test.tsx)
- [src/tests/features/finance/IncomeExpensesChart.test.tsx](../../src/tests/features/finance/IncomeExpensesChart.test.tsx)
- [src/tests/features/finance/ProcedureMarginsSection.test.tsx](../../src/tests/features/finance/ProcedureMarginsSection.test.tsx)
- [src/tests/features/finance/useFinancePage.test.ts](../../src/tests/features/finance/useFinancePage.test.ts)
- [src/tests/features/fiscal/useFiscalInvoicesPage.test.ts](../../src/tests/features/fiscal/useFiscalInvoicesPage.test.ts)
- [src/tests/features/inventory/InventoryAnalysisPanel.test.tsx](../../src/tests/features/inventory/InventoryAnalysisPanel.test.tsx)
- [src/tests/features/patients/hooks/usePatientsAttention.test.ts](../../src/tests/features/patients/hooks/usePatientsAttention.test.ts)
- [src/tests/lib/number-formatters.test.ts](../../src/tests/lib/number-formatters.test.ts)
- [src/tests/services/http.test.ts](../../src/tests/services/http.test.ts)
- [src/test-utils/factories/attachment.factory.ts](../../src/test-utils/factories/attachment.factory.ts)
- [src/test-utils/factories/finance.factory.ts](../../src/test-utils/factories/finance.factory.ts)
- [src/tests/app/router.test.tsx](../../src/tests/app/router.test.tsx)
- [src/tests/features/clinical-records/components/ClinicalTemplateSelectorPanel.test.tsx](../../src/tests/features/clinical-records/components/ClinicalTemplateSelectorPanel.test.tsx)
- [src/tests/features/clinical-records/components/ImageAttachmentPanel.management.test.tsx](../../src/tests/features/clinical-records/components/ImageAttachmentPanel.management.test.tsx)
- [src/tests/features/clinical-records/components/ImageAttachmentPanel.upload.test.tsx](../../src/tests/features/clinical-records/components/ImageAttachmentPanel.upload.test.tsx)
- [src/tests/features/finance/containers/FinancePageContainer.test.tsx](../../src/tests/features/finance/containers/FinancePageContainer.test.tsx)
- [src/tests/features/finance/hooks/useFinanceCategories.test.ts](../../src/tests/features/finance/hooks/useFinanceCategories.test.ts)
- [src/tests/features/finance/hooks/useFinanceFixedExpenses.test.ts](../../src/tests/features/finance/hooks/useFinanceFixedExpenses.test.ts)
- [src/tests/features/finance/hooks/useFinanceTransactions.test.ts](../../src/tests/features/finance/hooks/useFinanceTransactions.test.ts)
- [src/tests/features/inventory/components/stock-analysis-sections.test.tsx](../../src/tests/features/inventory/components/stock-analysis-sections.test.tsx)
- [src/tests/features/inventory/hooks/copilot-errors.test.ts](../../src/tests/features/inventory/hooks/copilot-errors.test.ts)
- [src/tests/features/scheduling/components/availability/ExceptionEditModal.test.tsx](../../src/tests/features/scheduling/components/availability/ExceptionEditModal.test.tsx)

### Tooling/config/docs (4)

- [package.json](../../package.json)
- [docs/quality/frontend-coverage-gaps-2026-09-10.md](../../docs/quality/frontend-coverage-gaps-2026-09-10.md)
- [docs/quality/frontend-hardening-2026-09-10.md](../../docs/quality/frontend-hardening-2026-09-10.md)
- [scripts/coverage-gaps.cjs](../../scripts/coverage-gaps.cjs)
