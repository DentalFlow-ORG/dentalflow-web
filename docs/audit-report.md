# DentalFlow ecosystem audit — 2026-09-20

Source-first audit of frontend `dev/yago` at `e407b53` and backend `dev/yago` at `17a4aba`, with the uncommitted changes described below. Both working trees were clean at discovery. This is a code/local-validation report, not cloud, penetration, legal or live-provider certification.

## Hardening continuation

This document preserves the audit baseline. Current fixes, concurrent patient changes, advisory disposition, validation results and the release decision are in [production-hardening.md](deployment/production-hardening.md). Do not interpret historical unresolved findings below as the current disposition; consult the PR-ID matrix there.

## 1. Repositories discovered

Frontend: `dentalflow-web`. Backend: sibling `../dentalflow-api`. Both available. The SPA reads VITE_API_URL and calls the Nest API with Bearer plus credentialed refresh-cookie requests. Relative cross-repository documentation now links both products. No personal paths or actual secrets were added; existing private env files were not printed or modified.

## 2. Architecture

React 19/Vite 8/TypeScript 6/Tailwind 4/Radix-shadcn/TanStack Router; feature-first typed services, Vitest/RTL/Biome/Knip. NestJS 11/Express 5/Prisma 7/PostgreSQL modular API with role/tenant/billing/plan guards. Stripe, Google login/Calendar, Resend, OpenAI and configurable Meta WhatsApp; local fiscal provider. Vercel configuration exists; Render/Supabase are environment targets, not live-verified infrastructure. [Architecture and ER overview](architecture/system.md).

## 3. Existing documentation classification and changes

| File | Initial classification | Why / main update |
| --- | --- | --- |
| web README.md | Missing information | Add sibling API, canonical index, setup/audit links and important partial-feature boundaries. |
| web AGENTS.md | Partially outdated | Cookies described as future work; replace with actual memory JWT/HttpOnly rotation and documentation ownership. |
| web CLAUDE.md | Accurate workflow guidance; partial duplication | Retained; AGENTS remains normative. No second agent instruction system created. |
| web .env.example | Missing information | Document optional public promotion variable and complete setup reference. |
| docs/roles-and-scheduling.md | Misleading/obsolete | Remove role hierarchy and planned patient-portal assumptions; describe actual routes and provisional PATIENT role. |
| docs/auth/google-oauth.md | Mostly accurate | Retained current OAuth setup/onboarding guidance; related operational/browser limits centralized. |
| docs/security/security-hardening-report.md | Obsolete/missing information | Replace “verify backend” checklist with confirmed controls, bounded findings and release links. |
| docs/security/rbac-review.md | Obsolete/duplicated | Replace false patient portal/route assumptions with current RBAC and executable policy reference. |
| docs/compliance/final-compliance-report.md | Misleading | Withdraw completion/build-block claim; document empty placeholder registry and actual browser-time notice. |
| docs/compliance/lgpd-compliance-inventory.md | Partially outdated/missing information | Map actual models/recipient integrations including AI audio, Stripe payloads and derived patient identity. |
| docs/compliance/data-retention-policy.md | Misleading/speculative | Remove nonexistent Patient deletion pseudocode and unsupported ten-year assertion; state actual mechanisms and reviewed-law reference. |
| docs/compliance/google-calendar-privacy.md | Obsolete/proposal mixed with implementation | Correct owner/dentist access, encryption variable, real models and absence of configurable privacy modes. |
| docs/compliance/billing-consumer-protection.md | Partially outdated | Replace guessed trial/flow checklist with seven-day trial, proration/cancellation behavior and actual commercial gaps. |
| docs/compliance/manual-validation-checklist.md | Partially outdated | Correct build-check claims and personal path; retain unchecked manual acceptance tasks. |
| docs/quality/frontend-coverage-policy.md | Accurate policy, stale measurement | Retain floors/exceptions; label old measurement historical and link current evidence here. |
| docs/quality/frontend-browser-qa.md | Accurate manual checklist | Retained; no browser items falsely marked passed. |
| docs/design/theme-rules.md | Partially outdated | Add forced-light billing/onboarding exception. |
| docs/design/button-and-card-theme-guidelines.md | Partially outdated | Align shared button variants with actual source; preserve design guidance. |
| docs/landing/design.json | Design reference, not implementation contract | Retained; do not infer functionality from visual specification. |
| api README.md | Missing information / historic claims | Add sibling/canonical links, explicit feature limitations and seed warning; historical production checks are not current proof. |
| api AGENTS.md | Useful rules with machine-specific context | Replace personal notes path with sibling product/docs context; retain safety and testing policies. |
| api CLAUDE.md | Accurate pointer / duplicated short summary | Retained as pointer to AGENTS. |
| api .env.example | Misleading/unsafe local defaults | Change WhatsApp/AI to disabled local defaults, remove account-specific IDs/unused business ID, explain webhook secret and optional campaign/fiscal settings. |
| api docs/security/cross-site-auth-and-csrf.md | Mostly accurate, overstated boundaries | Correct bootstrap location, cookie-path wording and public-mutation exceptions; add browser/production limits. |
| api docs/ops/stripe-subscription-sync.md | Accurate operational procedure | Retained dry-run/reconciliation guidance; current retry limitations documented in canonical release report. |

No ADR history was deleted. Obsolete audit prose was replaced rather than kept as a parallel authority. Existing specialist checklists remain distinct from implementation evidence.

## 4. Documents created

| File | Purpose |
| --- | --- |
| docs/README.md | One navigable product documentation index. |
| docs/architecture/system.md | Real boundaries, data flows, tenancy, integrations and database constraints. |
| docs/development/workspace.md | Portable two-repository setup and complete environment inventory. |
| docs/development/dependencies.md | Advisory/outdated/dead-code classification and migration constraints. |
| docs/requirements/functional.md | Feature inventory and stable RF traceability to actors/rules/UI/API/models/tests/plans. |
| docs/requirements/business-rules.md | Explicit RN catalog from hidden implementation rules. |
| docs/requirements/non-functional.md | RNF guarantees, gaps and required production proof. |
| docs/integrations/api-contract.md | API conventions, payload/error/pagination boundaries and confirmed mismatches. |
| docs/integrations/source-reference.md | Regenerable 204 route declarations, DTO links and 156 direct client calls; inferred responses with limitations. |
| docs/integrations/database-reference.md | Exact 45-model field/relation/index/constraint reference; avoids invented entities. |
| docs/deployment/production-readiness.md | Prioritized release checklist, deployment, restoration and incident procedure. |
| docs/product/decisions.md | Cited research, automation/AI/integration decisions, plans and pragmatic roadmap. |
| docs/audit-report.md | This decision/change/validation record. |

## 5. Feature inventory

Implemented core: identity/onboarding/recovery, tenant roles/team/profiles/services, availability/appointments, attention queue, clinical records/templates/attachments/odontogram/dictation, finance/payment tracking, stock, reports/dashboards, SaaS subscriptions, Calendar, operational AI, privacy/audit.

Partial: independent patient master data, fiscal issuance (simulation only), notifications (manual, not scheduled), platform clinic mutations (frontend calls absent backend routes). Backend only: public professional discovery APIs without a connected public booking screen. Frontend only: static marketing/legal presentation. Missing: patient self-service and dedicated treatment-plan approval. Documented only: scheduled reminder/recovery automation. Deprecated: lead capture; old app path redirects to attention queue.

## 6. RF status

33 stable requirements: 23 Implemented; 4 Partially implemented; 1 Backend only; 1 Frontend only; 2 Missing; 1 Planned/documented only; 1 Deprecated. RF-001–033 includes actors, preconditions, expected behavior, rules, UI/API, models, plans and test mapping. No new feature was invented merely to increase the count.

## 7. RNF status

31 requirements distinguish source/test-supported controls from partial guarantees, absent mechanisms, production prerequisites and future scaling work. Important gaps: patient identity, durable integration recovery, browser cookies, backup/restore/alerts, complete privacy operations, runtime dependency triage, query bounds and cross-repo contract automation. Local unit/DB passes do not close external/browser/cloud evidence.

## 8. Business rules

17 rules cover tenant/role shape, session/password lifecycle, onboarding, one-owner/user quotas, professional scope, appointment locks/transitions, derived patient identity, financial uniqueness, clinical review, stock/fiscal semantics, trial/proration/cancel, AI/notification quotas, privacy administration and Calendar/marketing boundaries.

## 9. Frontend/backend contracts

Additional external-contract finding: Vercel CSP blocks the ViaCEP request already used by address lookup. Manual address entry remains available; tracked as PR-16, with no CSP change in this audit. Calendar exports `serviceName - patientName` despite contradictory privacy wording in its event description; disclosure and minimization are PR-17.

Confirmed mismatch: POST /admin/clinics and PATCH/DELETE /admin/clinics/:id do not exist. Listing/health use /admin/users/clinics; client currently converts 404 to unavailable-action messaging. No speculative admin CRUD was added. Other discrepancies: provisional PATIENT docs, missing independent patient register, Professional dictation quota vs Premium feature gate, static promotional pricing vs effective backend campaign, nondefault API_PREFIX dictation parser, and unimplemented automatic WhatsApp claims. Full details in [API contract](integrations/api-contract.md).

## 10. Security findings

Critical: no confirmed exploitable application vulnerability; a critical seroval advisory exists in the frontend dependency graph and requires remediation/reachability review. High: conditional demo-admin credential exposure if seed used in production; patient identity ambiguity threatens clinical integrity. Medium: unsigned Meta mode, acknowledged Stripe failures, query-string logging, secret-quality validation, AI quota concurrency and recovery configuration. Low: in-memory scaling limits and nonblocking advisory CI. [Security report](security/security-hardening-report.md).

## 11. Production readiness

P0: none confirmed in the reviewed environment. P1: patient identity before clinical reliance, billing recovery, account recovery/secrets, cookie QA, authentic/durable webhooks, readiness monitoring, privacy/contact operations, backup restoration, dependency triage, commercial alignment and unsupported admin actions. P2: cost/quota boundaries, correlation, bounded queries/bundle performance. P3: shared rate-limit infrastructure when scaling. [Acceptance criteria](deployment/production-readiness.md).

## 12. Competitive research

Official sources for Simples Dental, Clinicorp, Open Dental and NexHealth were consulted. Findings emphasize reliable confirmations, recall queues, digital intake, receivables and explicit triggers rather than generic AI or feature count. Sources/date/limits and capability comparison are in [product decisions](product/decisions.md). Vendor marketing is not independent ROI or compliance proof.

## 13–15. Opportunities, rejections and automation

Highest value: stable identity, failed-payment/webhook recovery, account-recovery/uptime checks, consent-based reminders, attention follow-up outcomes and stock digest. Ranked effort/value and minimal scopes are documented. Rejected now: autonomous medical AI, debt-negotiation agents, broad CRM/workflow marketplace, microservices/Kubernetes and extra operational 3D. These increase risk/maintenance before solving current clinic problems.

## 16. Plan proposal

Retain Starter/Professional/Premium names and provisional 8/16/24 staff capacity; no pricing changes. Starter must support real daily clinic work and basic payment tracking; Professional should sell operational control and time-saving automation; Premium higher usage and reviewed advanced assistance. Security, record integrity, recovery, privacy rights and essential access are not upsell features. Do not promise multi-unit/custom-domain delivery from seed flags. Full current/proposed matrices and approval boundaries are in [product decisions](product/decisions.md).

## 17. Tooling changes

Added `docs:inventory` (existing TypeScript compiler, no new dependency) and `docs:check` (local Markdown targets and personal-path check). Source generation indexes contracts but is not OpenAPI or proof of response conformance. Proposed only: Nest OpenAPI/critical contract fixtures, one monitoring channel and reviewed dependency automation. No additional framework, provider or cloud account introduced.

## 18. Testing gaps

Strong existing auth/role/tenant/billing suites plus actual DB constraints/concurrency coverage were exercised. Still needed: real browser auth/privacy policies, external Stripe/Meta/Google/Resend/OpenAI acceptance, patient collision/identity migration tests, concurrent/out-of-order webhook recovery and AI quota reservations, real backup restoration and load/bundle budgets. Existing Jest forceExit and pg concurrent-client warnings merit follow-up, not a claim that tests failed.

## 19. Changes actually implemented

Documentation listed above; safe local example defaults in API; cross-repository context; source inventory and link-check scripts plus package scripts. Public WhatsApp copy in `src/features/marketing/data/public-content.ts` now accurately describes manual staff sending, consent/cotas and absent scheduler/inbound automation. Added `src/tests/features/marketing/data/notification-claims.test.ts`: two tests failed before copy correction and passed after. No application auth/billing/API/database logic, prices, role policies or migrations changed.

## 20. Proposals requiring approval

Stable Patient model/backfill, durable reminder infrastructure, changes to billing retry/state semantics, new paid monitoring/provider integrations, digital intake/signatures, generated API tooling and any plan pricing/entitlement change. Problem/value/complexity/risk/dependency/timing records are in the product decision document. No external messages, live billing operations or secret changes were performed.

## 21. Production blockers and limits

**No confirmed production blockers were identified during this audit.** This does not authorize launch: P1 findings and manual environment/provider/legal gates remain open, especially patient identity for clinical history. No production database/account was queried, no real payment/message was sent and no browser/cloud acceptance was claimed. A production seed with demo ADMIN, or an actually reachable critical advisory, would change severity immediately.

## 22. Commands and results

| Scope | Command / evidence | Result |
| --- | --- | --- |
| Discovery | git status, branch, rev-parse; source/DTO/schema/config/migration/test reads | Both clean initially; revisions above. |
| Frontend baseline | bun run typecheck | Passed. |
| Frontend baseline | bun run test:coverage | 404 suites / 5,735 tests passed; statements 96.63%, branches 97.18%, functions 97.24%, lines 97.07%. |
| Frontend baseline | bun run build | Passed; marketing-related Sparkles chunk ~889.74 KB minified / 237.39 KB gzip, size warning. |
| New regression | bun run test src/tests/features/marketing/data/notification-claims.test.ts | Both failed before fix; both passed after. |
| Frontend initial checks | bun run check | Two formatting errors introduced during copy/test edits; corrected, final run recorded below. |
| Frontend full Knip | bun run knip | Passed after new CLI registered in package scripts; nonblocking existing ignore hint. |
| Frontend production Knip | bun run knip:production | Nonzero: 24 exports + 5 types. Reviewed: all values and four types have test/support consumers; RoleFeatureAccess used in declaring helper contract. Retained intentional seams. No claim this command is green. |
| Backend | bun run typecheck; bun run lint:check; bun run build | Passed. Lint check does not rewrite source. |
| Backend coverage | bun run test:cov --runInBand | 97 suites / 2,396 tests passed; statements 94.03%, branches 85.50%, functions 86.72%, lines 94.21%. |
| Backend schema/dead code | bun run prisma:validate; bun run deadcode | Passed. |
| Local test database | bun run test:db:up | Docker initially unavailable; operator started it; disposable PostgreSQL healthy on 5433. |
| Migrations | bun run test:migrations | 39 migrations from empty DB; exact schema match; corrective replay no-ops/data intact. |
| Integration | bun run test:integration --runInBand | 7 suites / 110 tests passed; pg deprecation and Jest force-exit warnings. |
| E2E | bun run test:e2e --runInBand | 1 suite / 25 tests passed; Jest force-exit notice. |
| Dependencies | bun audit (both) | Nonzero: frontend 84 advisories, backend 70. Not suppressed or presented as clean. |
| Versions | bun outdated (both) | Completed; no updates applied. [Triage](development/dependencies.md). |
| Direct deprecation metadata | Registry installed-version metadata for both manifests | 85 entries checked, no lookup failures; API ESLint 9.39.4 deprecated/unsupported, other entries not marked deprecated. |
| Docs generation | bun run docs:inventory | 204 route declarations, 156 direct clients, 45 models. |
| Documentation and patch integrity | bun run docs:check; git diff --check (web); git -c core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol diff --check (API) | Passed: 651 local Markdown file links. API AGENTS retains its original CRLF; default diff check reports those new CRLF lines, so the final check explicitly recognizes CR-at-EOL without changing repository configuration. External URLs and anchors are not covered by the link checker. |
| Final frontend | bun run typecheck; bun run test:coverage; bun run build; bun run check | All passed. 405 suites / 5,737 tests; coverage unchanged: statements 96.63%, branches 97.18%, functions 97.24%, lines 97.07%. Bundle-size warning remains. |

Initial sandbox process creation failed; read/validation commands were rerun with approved escalation. API documentation writes required escalation because the sibling checkout is outside the frontend writable root. No automatic approval rejection blocked the task.

## 23. Git state

Both remain on dev/yago at their original commits. Changes are unstaged and reviewable; no commit, push, branch switch, merge, PR or history rewrite. Final changed-file inventory is the documentation table plus newly created files, two tooling scripts, package.json, marketing data and its regression test. After database validation, `docker compose -f docker-compose.test.yml stop` stopped only the disposable test database; its volume was preserved and Docker Desktop was left running.
