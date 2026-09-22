# Hardening file manifest

Paths in frontend sections are relative to dentalflow-web; backend sections are relative to ../dentalflow-api. The documentation section explicitly prefixes backend paths. This manifest records this hardening phase and the concurrent work included by instruction; it does not claim authorship of earlier audit changes. All remain uncommitted. See [current report](production-hardening.md).

## Frontend behavior and tooling

| File | Reason / behavioral effect |
| --- | --- |
| `scripts/check-doc-links.cjs` | Correct machine-path detection so the real src/features/home path is not mistaken for an absolute home directory; reproduced failing-then-passing docs check. |
| `package.json` | Pin seroval patch through override; no major/direct dependency added. |
| `bun.lock` | Record verified seroval and nested fflate patch resolutions. |
| `vercel.json` | Permit exact ViaCEP connect origin. |
| `knip.json` | Exclude only explicitly annotated testContract symbols from unused-export findings. |
| `src/features/admin/containers/AdminClinicsPageContainer.tsx` | Disable unsupported clinic mutations and row activation; remove obsolete row click-propagation handler; retain listing/filter/health. |
| `src/features/clinical-records/components/VoiceDictationCard.tsx` | Use authoritative access hook; loading/error/retry/locked states before recording. |
| `src/features/clinical-records/hooks/useClinicalDictationAccess.ts` | New fail-closed cache-miss lookup; inactive/unknown plan denial; unmount cancellation. |
| `src/tests/config/csp-api-origin.test.ts` | Regression for ViaCEP exact origin without wildcard. |
| `src/tests/features/admin/containers/AdminClinicsPageContainer.test.tsx` | Prove unavailable actions/rows cannot invoke unsupported mutations; retain supported behavior tests. |
| `src/tests/features/clinical-records/components/VoiceDictationCard.test.tsx` | Regressions for cache miss, denied plan and lookup recovery. |
| `src/tests/features/clinical-records/hooks/useClinicalDictationAccess.test.ts` | New inactive-Premium and late-resolution/rejection tests. |

## Frontend intentional test contracts (no runtime behavior change)

| File | Reason / behavioral effect |
| --- | --- |
| `src/features/clinical-records/utils/odontogram-status-utils.ts` | ODONTOGRAM_TOOTH_TOKENS; normalizeOdontogramSnapshot. |
| `src/features/home/config/role-home-config.ts` | ROLE_HOME_LABELS; getRoleHomeLabel; getRoleFeatureAccess; HomeFeature. RoleFeatureAccess made internal because it has no external consumer. |
| `src/features/patients/hooks/usePatientAvatar.ts` | __resetAvatarCache test seam. |
| `src/features/privacy/utils/cookie-consent-storage.ts` | COOKIE_CONSENT_KEY. |
| `src/features/scheduling/utils/appointment-state-machine.ts` | APPOINTMENT_TRANSITIONS; canTransitionTo. |
| `src/features/scheduling/utils/week-calendar-layout.ts` | SLOT_MINUTES; DEFAULT_START_MINUTES; DEFAULT_END_MINUTES. |
| `src/lib/avatar-crop-math.ts` | computeRotatedDimensions. |
| `src/lib/brazil-timezone.ts` | brazilAddMonths. |
| `src/lib/date-range-rules.ts` | todayIso; isFutureDate; isEndBeforeStart; rangeExceedsMonths. |
| `src/lib/validators/br.ts` | isValidCPF; formatCPF; formatCNPJ; formatCEP; VALID_UFS; formatBrazilianPhone. |
| `src/features/billing/types/billing.types.ts` | BillingPlanCampaign. |
| `src/features/fiscal/types/fiscal.types.ts` | FiscalInvoiceEvent. |
| `src/features/patients/types/attention.types.ts` | AttentionSummary. |

## Backend behavior and tests

| File | Reason / behavioral effect |
| --- | --- |
| `AGENTS.md` | Normalize line endings only to pass git diff --check; preserve all instructions. |
| `.env.example` | Clarify mandatory production mail versus local stub. |
| `package.json` | Pin compatible body-parser/multer/qs fixes. |
| `bun.lock` | Record those narrow transitive resolutions. |
| `docker-compose.test.yml` | Bind disposable PostgreSQL to loopback only, preserving volume. |
| `prisma/seed.ts` | Assert safe local/demo context before creating database client. |
| `src/config/seed-safety.ts` | New explicit environment/loopback PostgreSQL guard. |
| `src/config/seed-safety.spec.ts` | New guard tests for environment, malformed/remote destinations and local variants. |
| `src/config/validate-env.ts` | Require production mail and non-placeholder JWT length/format. |
| `src/config/validate-env.spec.ts` | Production mail and weak/example-secret regressions. |
| `src/bootstrap/configure-app.ts` | Server UUID response header and CORS exposure. |
| `src/common/filters/global-exception.filter.ts` | Omit queries; include request ID and authenticated clinic context in 5xx diagnostics. |
| `src/common/filters/global-exception.filter.spec.ts` | Query-token privacy regression. |
| `src/common/production-hardening.spec.ts` | Critical reset, plan, webhook and HTTP health regressions. |
| `src/modules/auth/auth.service.ts` | Atomic one-time reset-token claim, expiry equality rejection, transactional password/revocation. |
| `src/modules/auth/auth.service.spec.ts` | Conditional-claim transaction expectations. |
| `src/modules/ai-assistant/ai-quota.service.ts` | Effective dictation quota follows existing Premium gate. |
| `src/modules/billing/stripe.service.ts` | Bound network calls with timeout and one retry. |
| `src/modules/billing/webhook.service.ts` | Retryable failures; transaction/lock/dedup; strict identity mapping; canonical current update/invoice price/status; canceled old checkout protection; cancellation failure abort. |
| `src/modules/billing/webhook.service.spec.ts` | Update transaction mocks and strict retry/mapping expectations. |
| `src/modules/billing/webhook-events.spec.ts` | Handler/cancellation/payment regressions and late canceled-checkout protection. |
| `src/modules/calendar-integrations/calendar-integrations.service.ts` | Truthful disclosure of patient/service export in event description. |
| `src/modules/calendar-integrations/calendar-sync.spec.ts` | Pin truthful event description. |
| `src/modules/notification/whatsapp-webhook.controller.ts` | Await receiver completion before response. |
| `src/modules/notification/whatsapp-webhook.service.ts` | Reject missing production secret and await persistence instead of detached processing. |
| `src/modules/notification/whatsapp-webhook.service.spec.ts` | Propagated persistence error and awaited receiver tests. |
| `test/app.e2e-spec.ts` | New real-HTTP correlation/header/CORS regression. |
| `test/integration/production-hardening.int-spec.ts` | New PostgreSQL reset race, Stripe retry/duplicate/current-state, patient collision isolation and avatar-join count regressions. |

## Concurrent backend changes preserved and included in validation

| File | Reason / behavioral effect |
| --- | --- |
| `src/common/common.module.ts` | Register/export PatientIdentityService. |
| `src/common/services/patient-identity.service.ts` | New name-only multi-phone containment guard; this phase corrected misleading uniqueness comments. |
| `src/common/services/patient-identity.service.spec.ts` | Guard tests; email bypass is tested behavior, not an identity guarantee. |
| `src/common/utils/patient-identity.ts` | New shared normalization/filter helpers; limitations clarified. |
| `src/common/utils/patient-identity.spec.ts` | Normalization/filter tests; formatting corrected. |
| `src/modules/appointments/appointments.service.ts` | Normalize patient email writes. |
| `src/modules/clinical-records/clinical-records.service.ts` | Use identity normalization/guard for clinical paths; formatting corrected. |
| `src/modules/clinical-records/clinical-records.service.spec.ts` | Guard dependency mocks; formatting corrected. |
| `src/modules/clinical-records/clinical-records-annexes.spec.ts` | Guard dependency mocks; formatting corrected. |
| `src/modules/clinical-records/clinical-records.dictate.spec.ts` | Guard dependency mocks; formatting corrected. |
| `src/modules/clinical-records/clinical-records.patient-identity.spec.ts` | New clinical ambiguity tests; promise mock/lint corrected without business-rule change. |
| `src/modules/patients/patients.service.ts` | Normalized list/avatar operations; this phase additionally fixed duplicate-avatar multiplication via pre-aggregation. |
| `src/modules/patients/patients.service.spec.ts` | Adapted normalized aggregation expectations. |
| `src/modules/patients/patient-attention.spec.ts` | Adapted normalization/avatar mocks; formatting corrected. |
| `src/modules/health/health.service.ts` | Unavailable diagnostic state; service/controller changes consolidated with concurrent work. |
| `src/modules/health/health.controller.ts` | Convert failed readiness into 503; formatting corrected. |
| `src/modules/health/health.service.spec.ts` | Expanded healthy/unavailable service and controller tests. |

## Documentation changed or created in this hardening phase

| File | Reason / behavioral effect |
| --- | --- |
| `docs/deployment/production-hardening.md` | Canonical current evidence, P1 disposition, release matrix, manual gates and D decision; created to preserve baseline history. |
| `docs/deployment/dependency-advisories.md` | New exhaustive 154-entry advisory disposition; paths/exposure/fixed candidates and remaining risk. |
| `docs/deployment/hardening-files.md` | This exact file manifest separates hardening from prior audit and concurrent work. |
| `docs/deployment/production-readiness.md` | Correct resolved findings; retain outstanding acceptance checkboxes and link current assessment. |
| `docs/audit-report.md` | Preserve baseline measurements; link superseding hardening results. |
| `docs/README.md` | Expose current hardening/advisory entry points. |
| `docs/requirements/functional.md` | Keep partial admin/identity status and update tests/UI limitations. |
| `docs/requirements/business-rules.md` | Reset claim, webhook transaction/retry, identity containment and dictation rule. |
| `docs/requirements/non-functional.md` | Reconcile bounded guarantees and remaining operational evidence. |
| `docs/architecture/system.md` | Describe synchronous locked billing, readiness and correlation; preserve system boundaries. |
| `docs/integrations/source-reference.md` | Regenerate source line/route references after changed controller code; no new API module. |
| `docs/integrations/database-reference.md` | Re-run existing inventory against unchanged schema; no schema migration. |
| `docs/integrations/api-contract.md` | Record actual admin/dictation/health/CSP fixes and optional requestId error field. |
| `docs/development/workspace.md` | Production mail requirements and demo seed guard. |
| `docs/development/dependencies.md` | Link canonical per-advisory disposition. |
| `docs/compliance/google-calendar-privacy.md` | Truthful current description; approval and retained sharing risks remain. |
| `docs/security/security-hardening-report.md` | Link current fixes/remaining boundaries without erasing historical context. |
| `docs/product/decisions.md` | Correct effective dictation quota; no prices/plan expansion. |
| `../dentalflow-api/README.md` | Link current shared hardening/release decision. |
| `../dentalflow-api/docs/ops/stripe-subscription-sync.md` | Link retry/transaction changes and unresolved checkout-order acceptance gate. |

Pre-existing audit changes to root README/AGENTS/env, source-inventory/link scripts, marketing copy/tests and older compliance/design documents remain preserved. They are not new implementation claims in this phase; the baseline audit lists their purpose. The final Git status includes them as well as the files above.

