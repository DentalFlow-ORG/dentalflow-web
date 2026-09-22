# Production hardening — 2026-09-20

Continuation of the [baseline audit](../audit-report.md). Source code and the current uncommitted changes in both repositories were reviewed; concurrent patient/clinical/appointment changes were explicitly included at the user's request. No commit, push, branch change, production migration, real-provider transaction or deployment was performed.

**Release classification: B — Release candidate after manual infrastructure and acceptance checks.** The stable `Patient` entity is implemented and validated (§21); the sole code/data-model blocker is closed. What remains is operational: DNS/TLS, deployed headers, Render environment, hosted Supabase backup verification, real email delivery, Stripe test-mode QA, alerting, browser smoke and privacy approval. Passing repository checks does not establish any of those. This is not permission to deploy.

## 1. Original P1 disposition

No risk is described as accepted by the business unless an owner actually accepts it. “Reduced” means specific fixes landed with remaining work, not release acceptance.

| Audit ID | Verified classification | Status | Evidence / remaining boundary |
| --- | --- | --- | --- |
| PR-01 | Confirmed data-model defect | **Resolved in code** | Stable `Patient` entity with nullable FKs on the four patient-owned models; reads, writes and the frontend key on `patientId`. Two patients sharing name, email **and** phone keep separate odontograms, timelines, histories and avatars — proven by 29 PostgreSQL tests. Backfill is deterministic-only; unprovable legacy rows are quarantined, counted and still covered by containment. See [identity design](patient-identity-design.md). |
| PR-02 | Confirmed code defects + provider validation | Reduced | Processing errors now 503; atomic local processing and advisory lock; strict subscription/customer match; current Stripe state/price for update/invoice events; canceled historical checkout ignored. Multiple live checkout ordering and provider QA remain. |
| PR-03 | Confirmed configuration/reset defects + operational requirement | Reduced | Production mail/strong non-placeholder JWT required; local-only demo seed; atomic reset-token claim/revocation. Existing demo accounts, sender verification and catalogue/admin provisioning remain manual. |
| PR-04 | External/browser validation | Manual validation required | Cross-site HttpOnly refresh design exists; actual supported-browser privacy behavior unverified. |
| PR-05 | Confirmed signature/acknowledgment defects | Reduced | Missing production Meta secret refused even if real sending disabled; writes awaited. Status ordering, callbacks before providerRef persistence, provider replay/restart validation remain open. Keep real sending disabled until closed. |
| PR-06 | Confirmed readiness defect | Resolved | Controller returns 503 on DB failure; service reports unavailable; health unit tests and HTTP bootstrap tests pass. Configure the actual monitor separately. |
| PR-07 | Business/privacy/operational requirement | Manual validation required | Owner must approve public identity/contacts, rights handling, retention and clinical AI provider handling. No legal certification. |
| PR-08 | Infrastructure/operational requirement | Reduced | Local pg_dump/pg_restore drill succeeded; managed entitlement, schedule/retention, RPO/RTO, responder and incident alert still manual. |
| PR-09 | Confirmed advisory backlog | Reduced | Every one of 154 baseline entries classified; targeted fixes removed 11 runtime-graph entries. 143 development-only entries remain; no blanket vulnerability-free claim. |
| PR-10 | Commercial decision + quota defect | Reduced | Premium-only dictation now agrees across UI/gate/effective quota. Prices, campaign, support flags and excessive-usage downgrades still need owner/catalogue verification. |
| PR-15 | Confirmed UI/API mismatch | Resolved | Unsupported admin clinic buttons disabled; listing rows read-only; explicit copy and tests. Legacy mutation client/modal code remains; no absent endpoints invented. |
| PR-17 | Confirmed misleading description + privacy requirement | Reduced | Calendar description now admits patient/service sharing; regression test. Actual sharing/consent/minimization approval remains manual. |

Related P2/P3: PR-16 exact ViaCEP CSP origin fixed; PR-12 API correlation improved, browser collector/alerts pending; PR-11 AI quota atomic reservation and notification month/accounting remain; PR-13 query/bundle bounds and PR-14 multi-instance limiter remain deferred. Partial/missing RF product modules remain frozen backlog, not launch features.

## 2. Patient identity and data integrity

**Resolved in code on 2026-09-21.** DentalFlow now has a stable `Patient`
entity. Full design, stage record, backfill rules and rollback behaviour are in
[patient identity design](patient-identity-design.md); this section records the
defect and the outcome.

**The defect.** Identity was derived from denormalized `patientName` /
`patientEmail` / `patientPhone` columns on `Appointment`, `ClinicalRecord`,
`OdontogramRecord` and `PatientAvatar`. Those columns do not identify a person:
two people may share a full name, a household email and a household phone, and
one person may change any of them. Reproduced against real PostgreSQL, a
household booking two people under one address produced one patient, and
charting the second resolved the shared address to the first patient's
odontogram row and `UPDATE`d it in place — destroying that chart. Timelines and
histories merged on the same key. Containment reduced this to a `409` where it
could detect ambiguity, but could never cover two people sharing every column.

**The outcome.** `Patient.id` is identity; name, email and phone are attributes
with no uniqueness constraint on any of them. The four patient-owned models
carry a nullable `patientId` FK. Appointment booking, clinical records,
odontograms, avatars, the patient list, appointment history and the clinical
timeline all key on it, and the frontend carries it end to end. Two patients
sharing name, email and phone now keep separate odontograms with no overwrite,
separate timelines, separate histories and separate avatars — proven by 29
PostgreSQL tests, including the original corruption reproduction converted in
place.

**What is deliberately not done.** `patientId` is still nullable and the legacy
contact-matching path still serves rows that predate the migration, with
containment still active on it. Backfill assigns identity only from real foreign
keys (`patientUserId`, `ClinicalRecord.appointmentId`); anything it cannot prove
is left NULL, counted and quarantined rather than guessed. Standalone
odontograms are never assigned automatically. Enforcement (`NOT NULL`, retiring
the legacy path) is the first irreversible step and waits for a deployment with
a zero quarantine count.

**Residual risk.** Un-migrated legacy rows do not have stable identity until an
operator reconciles them. `bun run patients:backfill` reports the outstanding
count per table. For a deployment starting with no data, that count is zero.

A separately reproduced regression in the normalized avatar join doubled
appointment counts when two legacy avatar keys differed only by case. The join
now aggregates avatars per normalized clinic/key before joining appointments.

## 3. Billing lifecycle

The frontend requests checkout/trial/plan changes/portal through billing services. The API creates Stripe sessions using local plan prices and clinic metadata. Redirect success is not payment evidence; authenticated session synchronization and signed webhooks reconcile local Subscription/SubscriptionItem state. Plan guards read local state. SaaS subscription billing is separate from patient receivables.

Verified source rules: local trial is seven days, once according to persisted trial state; no paid Stripe subscription is silently created by that local trial. Changes use Stripe prorations, cancellation schedules period end, and canceled paid-period access follows existing rules. PAST_DUE/UNPAID/INCOMPLETE/PAUSED deny access. Paid/update events retrieve current subscription state; failed invoices also retrieve current state so an old failure cannot override recovered payment. One-off invoices without a subscription do not activate clinic access. Updates map the current Stripe price to the local plan; unmapped prices fail retryably.

Exact subscription ID plus customer matching replaces the unsafe OR lookup, preventing an old deleted subscription from canceling its replacement locally. Failure to cancel a previous subscription now aborts local replacement unless Stripe reports resource_missing. A canceled/incomplete-expired old checkout cannot replace the current subscription.

**Remaining:** no live/test-mode Stripe account was exercised. Parallel still-active checkout sessions and a delayed checkout after an in-place plan change still need a deterministic reconciliation rule and regression coverage: checkout currently takes plan metadata, whereas update/invoice handlers use current price. This is a concrete release gate, not a claim of fully solved event ordering. No large dunning system, new prices or business model was introduced. Use the existing [reconciliation runbook](../../../dentalflow-api/docs/ops/stripe-subscription-sync.md), dry-run first.

## 4. Webhook resilience

Stripe signature validation precedes event receipt. StripeEvent IDs deduplicate receipt; a transaction-scoped PostgreSQL advisory lock serializes webhook and checkout synchronization across replicas. Inside it, processed state is re-read; local subscription/item mutations and processed=true commit together. Failure rolls back local changes, records error evidence and returns 503 so Stripe retries. Replayed completed events skip work. PostgreSQL tests cover failed-then-successful replay, sequential and simultaneous duplicates, latest-state reconciliation and plan updates.

This is synchronous durable local processing, not a queue or exactly-once external side effects. Stripe network calls inside a global billing lock use a 5-second SDK timeout and one network retry; transaction timeout is 30 seconds/max wait 10 seconds. Monitor lock contention and pending/error events. A process crash rolls back its transaction; provider redelivery remains necessary. External cancellation cannot be rolled back by PostgreSQL. Existing receipt rawPayload and provider error messages require access/retention review.

Meta callbacks now reject missing production secrets and await status persistence before success. Storage errors propagate. Duplicate state assignment is generally repeatable, but statuses can still regress when delivered out of order and an early receipt without a saved providerRef can be lost. Do not advertise durable WhatsApp delivery until those scenarios and real retry behavior are covered. No new queue or paid infrastructure added.

The retry/current-object approach follows [Stripe webhook guidance](https://docs.stripe.com/webhooks); the implementation tests do not certify real Stripe delivery.

## 5. Security and external data sharing

| Severity | Confirmed finding / disposition |
| --- | --- |
| Critical | No confirmed remotely exploitable critical security defect established in this review. Advisory labels alone are not exploit proof. |
| High | Patient identity can attribute a shared history incorrectly; unresolved clinical-release gate. Production webhook trust/acknowledgment and reset replay issues were corrected as described above. |
| Medium | Calendar exports patient/service context; approval/minimization outstanding. Logs can contain provider error details and path identifiers; query omission is not universal anonymization. |
| Low | ViaCEP CSP usability failure fixed with exact origin; no wildcard. Disabled unsupported admin actions prevent misleading workflows. |

| Data sent | Destination | Purpose / trigger | Awareness / retention / risk |
| --- | --- | --- | --- |
| Patient name, service, time/timezone, professional context | Google Calendar | Outbound appointment sync after owner/dentist connection | Event description corrected. OAuth approval is not patient consent; calendar sharing and retained events require review. |
| Recipient phone and approved template/message parameters | Meta WhatsApp when enabled | Authorized manual send after consent/template/quota checks | Provider account/retention/retry behavior unverified; no autonomous reminders implemented. |
| Reset recipient and one-time reset URL | Resend | Forgot-password request for eligible account | Generic UI response; sender/delivery/retention verification required. Local stub must not be mistaken for production mail. |
| Customer/contact, subscription, invoice and session metadata | Stripe | Owner billing actions and provider events | Hosted payment flows; raw StripeEvent payload retained locally; define restricted access/retention. |
| CEP, plus normal browser connection metadata | ViaCEP | Address lookup in browser | Exact CSP origin permitted; manual address entry fallback. No clinical history sent by CEP client. |
| Clinical audio/transcript or selected operational context | OpenAI, when feature configured | Explicit AI/dictation action | Human review required; data minimization, provider terms/retention and lawful processing approval still required. |

Existing tenant/role guards, JWT rotation/reuse detection, origin checks and validation remain authoritative. No cross-clinic bypass was established by the executed suites. In-memory throttling is not suitable as a cross-replica guarantee. No new clinical AI feature or legal-compliance claim was added.

## 6. Account recovery

API/frontend request, reset and invalid/expired-link flows exist. Tokens are cryptographically random (64 bytes for the opaque token), stored as SHA-256 hashes, expire in one hour and invalidate older outstanding requests. Passwords use bcrypt cost 12. Request replies remain generic; forgot/reset route limits are 3/5 per minute respectively, in addition to existing guards.

Reset now conditionally claims usedAt=null and an unexpired token within the password/session transaction. Only one concurrent reset succeeds; tokenVersion increments and refresh tokens are revoked. PostgreSQL regression proves the prior access token receives 401. Expiration equality is rejected. Unit/frontend tests cover invalid/expired/replay and recovery interaction.

**Code lifecycle is implemented; production recovery is not yet certified.** Resend key and MAIL_FROM are mandatory at production boot, but deliverability, verified sender/domain, real reset link, user recovery and enumeration timing require provider/browser testing. No reset-success email notification was introduced.

## 7. Dependency disposition

| Repository | Before | After | Remaining runtime-graph baseline advisories | Remaining development-only |
| --- | ---: | ---: | ---: | ---: |
| Frontend | 84 | 82 | 0 | 82 |
| Backend | 70 | 61 | 0 | 61 |

[Every advisory](dependency-advisories.md) includes installed path, direct/transitive classification, severity, exposure, fixed candidate and action. Applied: seroval 1.5.3, nested fflate 0.6.11, body-parser 2.3.0, multer 2.3.0, qs 6.16.0. No direct framework major upgrade. Remaining dev advisories are real maintenance work; keep development/CLI servers private and do not process untrusted projects. Lock graph reachability is not bundle exploitability, and zero remaining baseline runtime entries is not a security certification. Seroval plugins' older peer declaration remains a bounded compatibility risk despite successful tests/build.

## 8. Knip and cleanup

Frontend production Knip passes with 28 explicit @testContract annotations; full Knip passes with tag/configuration hints because tests consume those exports. These are symbol-level exceptions, not ignored production folders. One genuinely unconsumed type, RoleFeatureAccess, was made internal. Existing test-utils exclusion remains. The annotated symbols are listed in the file manifest below; none is claimed as newly delivered product API. Backend uses its existing deadcode script, not a nonexistent knip script; its seed-safety test-only advisory overlooks the prisma/seed.ts consumer.

The unsupported admin UI is read-only; its obsolete row-action propagation handler was removed. Legacy mutation service/modal code remains in place and is not declared an implemented backend capability. No speculative CRUD endpoints, generated-client migration or new monitoring dependency was added.

## 9. CSP and dictation contract

ViaCEP is called directly by the existing browser service; no backend proxy was found. Vercel connect-src now permits exactly https://viacep.com.br. Regression proves the permitted origin and absence of wildcard widening. Deployed CSP and provider availability still require smoke validation; manual address entry remains available.

Dictation keeps the existing Premium-only commercial rule. Effective quota is zero for Starter/Professional and 30 for Premium; the backend feature guard remains the security boundary. The frontend now verifies billing state on cache miss, fails closed while loading/on error, offers retry, and rejects inactive or unknown plans. Tests cover cache miss, fetch failure/retry, disallowed plans, inactive Premium and late completion after unmount. AI quota consumption remains check/count rather than atomic reservation: concurrent allowance exhaustion is still PR-11.

## 10. Backup and restore

Local-only drill: PostgreSQL 16 container dentalflow-test-db, disposable database dentalflow_test, restored to newly created dentalflow_restore_hardening_20260920. pg_dump custom format, createdb and pg_restore --exit-on-error --no-owner --no-acl completed in 1.39 seconds on the small fixture database; both schemas had 46 public tables, 39 migration rows and 125 public constraints. A second fresh restore to dentalflow_restore_verified_20260920 compared row counts and sorted row fingerprints for all 46 public tables: all matched, in 4.45 seconds including verification. These timings are not production RTOs. No production/shared database was read, restored or mutated. Test compose disables fsync/synchronous_commit/full_page_writes and is not production durability evidence. Its port binding is now loopback-only.

Reproducible operator procedure, with credentials supplied privately:
1. Verify the exact source host/project and backup timestamp; disable outbound providers in the isolated restore environment.
2. Export using pg_dump -Fc or obtain the managed backup; record encryption, access, timestamp and checksum.
3. Create a **new, explicitly named empty** destination. Abort if it already exists; never restore over the source.
4. Run pg_restore --exit-on-error --no-owner --no-acl into that destination using the appropriate PostgreSQL version.
5. Compare migration rows, tables, constraints and representative tenant/clinical/financial data; test reads and application authentication with isolated credentials.
6. Record elapsed recovery, recovered timestamp/loss window, responder and cleanup disposition. Only remove the specifically created drill resources.

**Hosted configuration remains manual:** selected Supabase plan, backup source/schedule/retention, last successful backup, restore entitlement, object storage/key coverage, external/off-site copy, RPO/RTO and accountable operator. [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups) describes capabilities by plan; it does not prove which are enabled for DentalFlow. No paid backup/PITR option was purchased or assumed.

## 11. Observability and provider failure states

Operators can inspect server-generated X-Request-ID on normal/error HTTP responses and requestId in normalized error bodies. 5xx logs include request ID, endpoint/method and authenticated clinic ID when available. Query strings are removed from response/log paths. Stripe logs/event rows carry event IDs and processing/error state; failures now invite provider retry. Health returns 503 for DB unavailability.

Still absent/unverified: central frontend exception collection, release ID tagging, alert delivery, uptime monitor, automatic pending-event alarm and incident responder. Authentication 401/403 are deliberately omitted from the generic 5xx logger; existing auth/audit events do not establish a complete failure metric. URL paths/provider messages may still include personal information. Configure minimal access-controlled collection and alerting before launch; do not log request bodies or tokens.

ViaCEP failure allows manual entry; frontend HTTP failures have timeout/network handling. Email failure preserves generic enumeration-resistant replies, but needs delivery alerts. Calendar errors do not prove reconciliation; test revoked tokens and partial sync. Stripe failure must be retried/reconciled rather than forcing ACTIVE. Meta acknowledgment now waits for persistence; remaining ordering/race issues are explicit above. No job monitor is claimed for a scheduler that does not exist.

## 12. Infrastructure and environment

Locally inspected: Vercel CSP/SPA/build configuration; API bootstrap/CORS/body limits/trust proxy/headers; production env validator; .env.example; Prisma schema/migration tooling; Docker test isolation. Frontend VITE_API_URL must include the API prefix and is compiled into the build. API default prefix remains api; custom dictation-prefix behavior is unchanged. Production requires strong JWT, mail configuration, Stripe settings and configured integration secrets as applicable.

Render/Supabase/Stripe dashboards, DNS, certificate state, secrets and actual plan catalogue were not accessed. No render.yaml proves cloud settings. Cross-site Vercel/Render examples are configuration references, not verified live URLs. The demo seed requires explicit development/test and loopback PostgreSQL; production catalogue/admin provisioning still needs a controlled process. Existing demonstration accounts cannot be excluded without inspecting the deployment.

## 13. Real-browser smoke coverage

No Playwright/Cypress infrastructure was present; no browser automation dependency was installed and **no real-browser smoke flow was executed**. API E2E tests use HTTP, frontend tests use jsdom; neither certifies third-party cookies, microphone, visual layout or provider redirects.

Before deployment, record browser/version, date, operator, release and result for: login; reload/refresh/expiry; patient search and identity-safe history access; appointment create/reload/cancel; billing status/checkout/return/portal; reset via actual email; logout/revoked session. Include OWNER/DENTIST/ASSISTANT denials, tenant boundaries, mobile/keyboard and provider failure recovery. Use [existing browser QA](../quality/frontend-browser-qa.md).

## 14. Changes and tests

See [file-by-file manifest](hardening-files.md) for reason/behavior, including preserved concurrent work and documentation synchronization. Regression failures were observed before their corresponding fixes for CSP, dictation cache gate, unavailable admin actions, production reset/webhook/configuration behavior, stale canceled checkout, request correlation, avatar count multiplication and example-secret acceptance. The new hook has 100% measured coverage across all four metrics. Existing voice-recorder browser-only gaps remain under the standing coverage/browser policy. The first attempted new seed test failed to compile before the helper existed; it is new guard coverage, not a claimed behavioral before/after test.

Meaningful additions protect reset replay/session revocation, duplicate/retried Stripe transactions/current state, patient collision isolation/aggregate counts, health outage signaling, Meta persisted acknowledgments, environment/seed boundaries, Calendar disclosure and dictation plan/retry behavior. Existing coverage floors were not reduced.

## 15. Validation results

| Repository / exact command | Result |
| --- | --- |
| web: bun run test:coverage | 406 suites / 5,741 tests passed; statements 96.62%, branches 97.17%, functions 97.24%, lines 97.08%; floors passed |
| web: bun run typecheck | Passed |
| web: bun run check | Biome + unused-file check passed |
| web: bun run knip / bun run knip:production | Passed; full mode prints 28 annotation hints plus existing test-utils configuration hint |
| web: bun run build | Passed; existing large-chunk warning remains (largest approximately 890 KB minified) |
| api: bun run test --runInBand | 102 suites / 2,460 tests passed; statements 94.05%, branches 85.46%, functions 86.90%, lines 94.24%; floors passed |
| api: bun run test:integration --runInBand | 10 suites / 144 tests passed, including 21 patient-identity and 8 backfill scenarios |
| api: bun run test:e2e --runInBand | 1 suite / 26 tests passed |
| api: bun run test:migrations | 40 migrations applied from empty; schema agreement; corrective replay preserved data/invariants |
| api: bun run typecheck / bun run lint:check / bun run build | Passed final rerun; lint issues in concurrent work corrected without business-rule changes |
| api: bun run deadcode / bun run prisma:validate | Passed; seed helper advisory explained above |
| both: bun audit --json | Nonzero as expected: web 82, API 61, fully classified |
| web: bun run docs:check | 673 local file links passed across both repositories; anchors/external URLs not validated |
| local pg_dump / pg_restore | Successful isolated restore; limitations above |

First aggregate API coverage attempt exited 9 without a test summary while other validation ran; it is **not** reported green. Isolated rerun passed. Earlier red regressions and formatting failures were resolved, not hidden as unrelated. Integration emits a pg concurrent-query deprecation warning; Jest configurations force exit. These are remaining tooling concerns, not proof of a failed assertion or hosted process stability.

## 16. Release-readiness matrix

| Area | Status | Evidence | Remaining risk | Blocking? |
| --- | --- | --- | --- | --- |
| Authentication | Manual verification required | Auth/reset unit, HTTP and frontend suites | Real browser/cookie/email lifecycle | Yes, deployment acceptance |
| Authorization | Ready | Role policy/guard and denial tests | New route drift requires maintained matrix | No additional confirmed gap |
| Tenant isolation | Ready | PostgreSQL HTTP isolation plus patient guard isolation | Tests cover known paths, not penetration certification | No additional confirmed gap |
| Patients | Ready | Stable Patient entity; 29 PostgreSQL identity/backfill tests | Un-reconciled legacy rows still use the legacy path | No confirmed code gap |
| Appointments | Partial | Conflict/payment/integration tests; patient linkage implemented | Real browser round trip | Deployment acceptance |
| Clinical records | Ready | Timeline/odontogram keyed on patientId; cross-patient overwrite test | Legacy rows pending reconciliation | No confirmed code gap |
| Billing | Partial | Latest-state/update tests, strict mapping, failure recovery | Multiple active checkout order, checkout metadata drift, real provider QA | Yes |
| Stripe webhooks | Partial | Atomic local processing, replay/concurrency PostgreSQL tests | Complete checkout order/provider retries/monitoring | Yes |
| Account recovery | Manual verification required | Conditional claim + revoked JWT test | Real mail/sender/link/browser verification | Yes |
| Database | Partial | Constraints/schema, query regression, additive identity migration | Enforcement (NOT NULL) deferred until quarantine is zero | No confirmed code gap |
| Migrations | Ready | 40-from-zero + drift/replay check; identity migration is additive only | CREATE INDEX needs CONCURRENTLY on a large populated database | No |
| Backup/restore | Manual verification required | Local dump/restore | Hosted entitlement, schedule, RPO/RTO/responder | Yes |
| Security | Partial | Fail-closed signatures, reset, secrets, tenant tests | Remaining identity and deployed control proof | Yes |
| Privacy | Manual verification required | Data-sharing inventory/disclosure correction | Provider/clinic/legal approval and retention | Yes when real data/integrations enabled |
| Dependencies | Partial | All 154 rows; 11 runtime entries patched; build/tests | 143 dev advisories; no blanket exploit proof | Owner to accept bounded tooling risk |
| Frontend/backend contracts | Partial | Dictation/admin/health/CSP fixes | Identity, custom prefix, broader runtime schema drift | Critical remaining paths above |
| Monitoring | Partial | Request/clinic/event IDs, health 503 | Browser collector, release tags, alerts/responder | Yes, minimum operational acceptance |
| Deployment | Manual verification required | Local config/build/schema | Dashboards, DNS/TLS, secrets, migrations procedure | Yes |
| External providers | Manual verification required | Mocked failure/contract tests | Real Stripe/Resend/Calendar/Meta behavior | Yes for enabled providers |
| Tests | Partial | Full local suites plus meaningful regressions | Real browser/provider/supported deployment evidence | Yes for missing release acceptance |

“Ready” applies only to the bounded area/evidence, not to the product as a whole.

## 17. Proposals requiring approval and intentional deferrals

- **Patient UUID/data transition:** high customer/safety value; medium-high complexity and migration risk; requires approved mapping and human collision resolution. Do before real clinical use.
- **Checkout reconciliation rule:** prevent older live sessions/metadata from superseding newer commercial intent. Define how parallel checkouts and plan changes are selected/canceled, then add current-price and ordering regressions. No silent pricing decision.
- **Hosted recovery/monitoring:** assign owner and choose existing platform capabilities first; paid PITR/collector/service costs need approval. Test alerts and a real isolated hosted restore.
- **Calendar/clinical AI privacy:** approve/minimize exact fields and provider/retention settings before enabling real data.
- **AI quota reservation/Meta event ordering:** focused follow-up for existing features; no queue required merely to increase architecture complexity.
- **Development advisory updates:** isolated compatible patches with consumer tests; major framework migrations deferred.

Rejected during hardening: new CRM, recall scheduler, autonomous clinical AI, 3D redesign, marketplace, multi-unit redesign and integration bloat. These do not fix the current identity/billing/recovery gates. No subscription price or entitlement expansion was implemented.

## 18. Required human checks before deployment

- [ ] Approve and validate safe stable patient identity/data transition; do not unlock clinical histories on ambiguous contacts.
- [ ] Resolve parallel checkout/current-price reconciliation and execute the backend Stripe test-mode checklist: checkout, changes, cancellation, failures/recovery, duplicate/delayed retry and portal.
- [ ] Verify actual plans/prices/coupons/trial/limits/support claims; no static marketing/catalogue assumptions.
- [ ] Confirm no demo accounts; strong secrets; verified mail sender and real reset/replay/revocation flow.
- [ ] Verify exact domains, TLS, CORS, CSP, Secure/HttpOnly/SameSite cookie and refresh/logout on supported browsers.
- [ ] Confirm Render build/start/release migration/healthcheck/proxy/restart settings and Vercel build URL/deep links.
- [ ] Confirm Supabase backup entitlement, schedule/retention, isolated hosted restore, RPO/RTO and responsible operator.
- [ ] Configure minimal failure/uptime/event alerts; test delivery, frontend capture, release identification and responder.
- [ ] Approve privacy/public legal details, retention/rights process and enabled providers' sharing/consent; keep unapproved providers disabled.
- [ ] Run and record the browser smoke checklist against the exact release.
- [ ] Review current Git diffs in both repos; no automatic publication/deployment is implied.

## 19. Git and final decision

Both repositories remain on dev/yago with previous audit work and current source/test/documentation changes uncommitted. Final status: frontend 38 modified tracked files + 21 untracked files; backend 39 modified tracked files + 9 untracked files (including pre-existing audit work). Concurrent identity changes were preserved and included. No Git reset/checkout/merge/rebase/commit/push occurred. No production-like data migration occurred; the only restore targets were newly named disposable local databases. The test container is stopped after validation; its volume and restore databases are preserved. Docker Desktop itself is not stopped.

**No confirmed code-level P0 production blockers remain, and the single P1 code/data-model blocker — patient identity — is now closed in code (§2, §21).** **Classification B**: every remaining item is an operational acceptance check that no repository command can perform — DNS/TLS, deployed response headers, Render environment, hosted Supabase backup restoration, real email delivery, Stripe test-mode QA, alerting, browser smoke and privacy/legal approval. A is not claimed while those are open. Complete §18 before deploying.

## 20. Independent review — 2026-09-21

A separate reviewer re-derived the disposition from source and tests rather than accepting the classifications above. Findings:

**Confirmed.** PR-01 remains a release blocker, and for a more severe reason than originally stated: the shared-contact case is not only history merging but live cross-patient clinical data destruction, reproduced against real PostgreSQL. PR-06 is genuinely resolved (200 + body healthy, 503 + body unhealthy). PR-15 is resolved. The Knip mechanism is sound — all 28 `@testContract` symbols were sampled or checked and each has a real test consumer; none hides dead code. Account recovery is complete in code: 512-bit tokens, SHA-256 at rest, expiry, an atomic `updateMany` claim on `usedAt` inside a transaction that also increments `tokenVersion` and revokes refresh tokens, and a single generic error message. The dependency overrides are justified — `body-parser`, `multer` and `qs` are genuinely runtime-reachable through Express 5 and `@nestjs/platform-express`, and all three resolve to the pinned patched versions.

**Partially confirmed.** The "143 development-only advisories" claim is substantially right but imprecise: `form-data` and `js-yaml` are strictly dev-only via supertest and ESLint, while `mysql2` and `hono` arrive through `prisma`/`@prisma/client` as optional dependencies. They may be *present* in a production install but are not *reachable*, because no MySQL driver adapter is configured. "Present but unreachable" is the accurate description. Knip exceptions are annotated with one identical boilerplate comment rather than a per-symbol justification.

**Rejected.** Concurrent Stripe checkout is **not** a production blocker. `Subscription.clinicId` is unique, so two local subscription rows cannot exist. `onCheckoutSessionCompleted` takes `stripeCustomerId` and `stripeSubscriptionId` from the completed session rather than from prior local state, so local mapping converges on whichever session the user actually completed. If a user somehow completes two, the advisory lock serializes both events and the second cancels the first Stripe subscription before remapping, leaving exactly one active subscription. The realistic residue is an orphan Stripe customer with nothing attached to it — billing hygiene, not inconsistent state. It belongs in the reconciliation runbook, not on the release gate.

Webhook durability was verified independently and is correct: signature failure returns a non-retryable 400; the event row is keyed on the Stripe event ID; the `processed` re-check, business mutation and `processed = true` commit inside one advisory-locked transaction, so a duplicate delivery cannot produce a duplicate effect; any processing failure rolls back and returns 503 for redelivery; unsupported types are acknowledged deliberately. A crash needs no recovery path because the transaction rolls back and leaves no claimed-but-unfinished state. One residual concern, not a blocker: Stripe API calls run inside the global billing lock, so provider latency serializes billing throughput. Bounded timeouts are configured and contention should be monitored.

**Additional finding.** Containment covered only the name-only branch; the email branch was unguarded. That gap is now closed, and the remaining name-and-email collision is pinned by a test that asserts the defect still exists, so it cannot be mistaken for fixed.


## 21. Stable patient identity — 2026-09-21

The release blocker recorded above was closed by implementing a canonical
`Patient` entity. Design, stage record and rollback behaviour:
[patient identity design](patient-identity-design.md).

Migrated: `Appointment`, `ClinicalRecord`, `OdontogramRecord`, `PatientAvatar`.
Out of scope with reasons recorded: `ServiceInvoice.patientId` (a pre-existing
FK to `User`, not this entity, exposed through the fiscal API) and
`NotificationConsent` (phone-based consent, owns no clinical data).

Migration `20260921000000_add_patient_identity` is additive only — one table,
four nullable columns, nine indexes, five foreign keys, **zero destructive
statements**. Every stage is reversible by redeploying the previous build,
because the legacy snapshot columns are still written and nothing was dropped.
Enforcement (`NOT NULL`) is deliberately deferred.

Backfill assigns identity only from real foreign keys. Rows it cannot prove are
left NULL, counted and quarantined; `bun run patients:backfill` reports the
outstanding total and writes nothing without `--apply`. It refuses a non-local
database unless `ALLOW_NON_LOCAL_BACKFILL=1` is set deliberately.

**Acceptance evidence.** Two patients sharing name, email **and** phone hold
distinct `patientId`s and keep separate odontograms (no cross-read, no
overwrite), separate clinical timelines, separate appointment histories and
separate avatars. A patient id from another clinic is indistinguishable from one
that does not exist. 21 identity tests + 8 backfill tests, all against real
PostgreSQL. The original corruption reproduction was converted in place rather
than deleted.

**Also fixed during this work:** the frontend avatar cache was keyed on the
contact identifier alone, so two patients sharing an email address would have
shared a cached avatar. It is now keyed on identity.

**Adversarial review (2026-09-21)** found and fixed three further defects: the
backfill could merge a parent and child booked under one household login
account; `upsertPatientAvatar` accepted a patient id from another clinic; and
the avatar cache still leaked across a shared address on first render and in
the patient-list pre-warm. It also corrected a wrong claim in this report —
**the API must be deployed before the web app**, because `forbidNonWhitelisted`
makes an old API reject a new frontend's `patientId`. Details and the surviving
claims are in [patient identity design](patient-identity-design.md) §11.
