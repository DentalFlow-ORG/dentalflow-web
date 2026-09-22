# Production readiness and operations

Assessment date: 2026-09-20. **Current disposition and release decision: [production hardening](production-hardening.md).** The original audit classification is retained below, with corrected implementation findings. **No confirmed P0 production blocker was identified during this audit. This is not a production-ready sign-off.** Significant P1 items and deployment evidence remain open. In particular, patient identity must be resolved before using merged histories for real clinical decisions. Cloud accounts, actual secrets, DNS, backups and external provider delivery were not inspected.

P0 = demonstrated critical security/data-loss/core-workflow failure requiring launch stop. P1 = should fix/verify before production. P2 = important shortly after launch. P3 = later. Conditional risks are not reported as observed production incidents.

## Findings and release acceptance

| ID | Priority | Finding | Acceptance evidence / owner |
| --- | --- | --- | --- |
| PR-01 | P1 | Patient name/email identity can merge histories or split one patient | Product/backend: approved stable identity/migration plan and collision tests; constrain clinical rollout until safe. No automatic schema redesign in audit. |
| PR-02 | P1 | Stripe retry/atomic processing corrected; provider QA, parallel checkout ordering and reconciliation still require closure | Backend/operations: failure/retry/concurrent-duplicate/out-of-order tests, observable recovery and test-mode reconciliation. |
| PR-03 | P1 | Local-only seed and production mail/secret validation corrected; existing accounts/sender provisioning still manual | Operations: no demo accounts; strong secrets; verified reset email/sender; safe catalogue/admin provisioning. |
| PR-04 | P1 | Cross-site cookies may fail under browser privacy policies | Frontend/operations: reload/expiry/logout tests on supported browsers, or same-site domains with reviewed cookie configuration. |
| PR-05 | P1 | Production Meta signatures and awaited writes corrected; callback ordering/receipt races remain | Backend: signature enforced for persisted state updates; restart/replay behavior tested before real WhatsApp launch. |
| PR-06 | P1 | Resolved in code: health HTTP 503 on DB failure | Operations: configure deployed HTTP readiness; local health/HTTP regressions pass. |
| PR-07 | P1 | Legal identity/contacts, retention and AI-provider handling unapproved | Business/privacy owner: formal public details, approved documents and real rights-request workflow; dictation data-handling review. |
| PR-08 | P1 | Local restoration verified; hosted backups, RPO/RTO and incident alert path unverified | Operations: restore disposable copy, record timing/data loss window, assign responder, test alerts. |
| PR-09 | P1 | 154 baseline advisories triaged; 11 runtime-graph entries patched; 143 tooling-only entries remain | Engineering: classify reachable paths, compatible patch plan, lockfile review and gates. Advisory severity alone is not exploit proof. |
| PR-10 | P1 | Public plan prices/promotion and flags diverge from executable capabilities | Product/backend: compare published prices with actual Stripe prices/coupons; reconcile feature/quota/support claims without inventing entitlements. |
| PR-11 | P2 | AI quota concurrency, notification month timezone and delivery accounting | Backend: atomic reservation/cost bounds and month-boundary tests; define accepted vs delivered billing. |
| PR-12 | P2 | Request/tenant IDs added to API failures; release correlation, frontend collection and alerts remain | Engineering/operations: minimal correlated structured logs, redaction and one error-reporting/alert channel. Provider selection/cost needs approval. |
| PR-13 | P2 | Unbounded patient/attention queries; large marketing chunk | Engineering: pagination/query profiling and measured mobile bundle budgets before scaling. |
| PR-14 | P3 | In-memory limiter prevents robust multi-instance policy | Backend: shared limiter before horizontal scaling; no premature distributed architecture. |
| PR-15 | P1 | Resolved UI mismatch: unsupported clinic mutations disabled; legacy client methods remain without endpoints | Product/frontend/backend: choose supported onboarding/support scope; implement reviewed CRUD or clearly gate unsupported actions with tests. Self-registration exists, so this is not automatically a P0. |

## Release checklist

Additional findings: **PR-16 (P2)** — ViaCEP exact origin added to Vercel CSP with regression test; deployed smoke test pending. Manual address entry remains available. **PR-17 (P1)** — Calendar titles still export patient name/service; description corrected with regression. Approve/minimize shared fields before real patient synchronization.

Record date, release hashes, operator and evidence for each box. Passing unit tests never checks a cloud dashboard automatically.

- [ ] Application: frontend typecheck/full tests/coverage/build/check/Knip; API typecheck/lint/tests/coverage/build/deadcode/schema; both exact release revisions recorded.
- [ ] Database: migration history builds from empty PostgreSQL; integration/E2E pass; schema drift absent; migration preview reviewed; intended DIRECT_URL confirmed privately.
- [ ] Contracts: register/login/refresh/logout/reset; role/tenant denials; appointment create/status/payment; clinical save/reload; subscription trial/checkout/sync/cancel; export/download tested across both deployed apps.
- [ ] Security: HTTPS, exact CORS, CSP API origin, Secure/HttpOnly cookie, strong secrets and rotation, valid webhook signatures, rate limits, no demo credentials, dependency reachability triage.
- [ ] Environment: VITE_API_URL compiled correctly; all production validator variables present; optional-but-operational mail/provider settings tested; AI/WhatsApp disabled when not approved.
- [ ] Vercel: build command/output, SPA deep links and actual response headers verified; preview deployments do not use production credentials inadvertently.
- [ ] Render: Node/Bun versions, build/start command, migration release step, proxy assumptions, graceful shutdown and restart behavior verified. No repository render.yaml proves these settings.
- [ ] Supabase/PostgreSQL: pooled runtime/direct migration connection, connection limits, indexes/constraints, backup entitlement/cadence/encryption and successful restoration recorded.
- [ ] Domains: DNS/SSL, callback/redirect URLs, same-site cookie strategy and CSP aligned. Example URLs are not deployment attestation.
- [ ] Monitoring: API/DB/browser failures distinguished; Stripe unprocessed/error events alerted; notification failures/retries visible; responder/contact defined. No job monitoring claim until jobs exist.
- [ ] Product: onboarding, role-specific empty/loading/error/retry states and permission denials in browser; no unsupported automation/fiscal/patient-portal promises.
- [ ] Billing: seven-day trial, failed payment block, prorations, upgrade/downgrade over quota, cancellation and paid-period access, test-mode replay and portal verified; no live charges from QA.
- [ ] Privacy/support: actual contact channels, approved public legal text, requests triage and patient-record handling, external AI/Calendar/Meta disclosure, approved retention/legal holds.
- [ ] Browser: execute [frontend-browser-qa.md](../quality/frontend-browser-qa.md); keyboard/focus, responsive layouts, audio codecs/microphone, printing and third-party cookies.

## Deployment and recovery procedure

1. Validate both exact revisions and inspect migration changes. Back up and verify restore capability before production schema changes. Do not run demo seeds.
2. Build API with `bun install --frozen-lockfile`, `bunx prisma generate`, `bun run build`; configure provider secrets outside Git. Frontend builds with `bun run build` and public API URL.
3. Run `bunx prisma migrate deploy` once against the explicitly selected production direct connection in the release pipeline. This is an operator-controlled production mutation, not part of this audit execution. Never use db push as production migration proof.
4. Start API with `bun run start:prod`; deploy frontend assets with compatible contracts. Verify health DB body, authenticated reads and cross-tenant denial. Exercise safe smoke operations with authorized test tenants.
5. On regression, roll back compatible application releases; do not automatically reverse destructive migrations or overwrite the database. Use a reviewed forward fix or restore plan with a stated loss window.

Restore drill: restore a backup into an isolated database, compare schema/migration state and representative tenant row counts, verify auth/appointment/finance reads with outbound integrations disabled, record elapsed recovery and latest recovered timestamp, and destroy only the explicitly named drill resource after approval. RPO/RTO values must be agreed based on measured capability, not invented in docs.

Incident triage: identify release/time/endpoint and scoped tenant identifier without logging clinical payloads or tokens; distinguish API failure from DB/provider failure; inspect StripeEvent processing/error state and use the [reconciliation dry run](../../../dentalflow-api/docs/ops/stripe-subscription-sync.md); assign an operator before replay. Preserve evidence, avoid unauthorized customer communications, and follow approved privacy incident handling.

Current command outcomes and unresolved validations are in [production-hardening.md](production-hardening.md); [audit-report.md](../audit-report.md) preserves the earlier baseline.
