# Product opportunities, subscription design and roadmap

Research date: 2026-09-20. Primary vendor pages describe marketed capabilities, not independent effectiveness evidence. No competitor prices or ROI percentages are inferred. Recommendations below are DentalFlow-specific judgments based on code and market evidence; none authorizes a new module, paid service or pricing change.

## Market evidence and opportunity matrix

| Capability | Market evidence | DentalFlow today | Customer / business value | Complexity | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Appointment reminders/confirmation | Simples Dental markets integrated WhatsApp confirmation and scheduling. [Source](https://www.simplesdental.com/) | Manual consent-based send; no durable scheduler/inbound confirmation | Less reception work/no-show risk; retention and Professional value | Medium-high: scheduling, consent, idempotency, provider cost | Implement after launch, once manual delivery is reliable |
| Recall with bounded contact attempts | Open Dental documents a recall queue, repeat suppression, reminders and reactivation. [Source](https://www.opendental.com/manual/recalllist.html) | Attention queue already flags inactive/no-upcoming patients | Turn existing signals into staff action; recovered visits | Medium after stable patient identity | Implement after launch; first add contact outcome/task, not another CRM |
| Digital intake and signing | Clinicorp advertises remote anamnese and electronic signatures. [Source](https://www.clinicorp.com/) | Clinical templates exist; no patient intake/signature journey | Less retyping, better preparation; retention | High: identity, legal evidence, sensitive-data security, vendor | Evaluate after launch with actual clinic demand |
| Financial controls/stock/reports | Clinicorp exposes finance, inventory and operational reporting. [Source](https://www.clinicorp.com/ferramentas) | Already implemented with plan gates | Daily operational value, paid conversion | Existing | Already covered; polish accuracy before expansion |
| Payment requests and reminders | NexHealth documents staff-triggered payment requests followed by reminders. [Source](https://help.nexhealth.com/en/articles/11146209-how-do-i-collect-payment-from-someone-who-s-not-currently-in-the-office) | Receivables and pending-payment attention, no patient acquiring integration | Faster collections and less staff work | High: provider fees, reconciliation and support | Evaluate; do not repurpose SaaS Stripe billing as patient payments |
| Conditional automation | NexHealth distinguishes scheduled reminders/recalls from manually triggered waitlist/payment templates. [Source](https://help.nexhealth.com/en/articles/10046722-what-kind-of-automated-communications-does-nexhealth-offer) | Preferences exist; automatic behavior overstated in old copy | Trustworthy automation with clear triggers | Medium | Implement after launch; explicit cancellation and duplicate suppression first |
| Stable patient identity | Required by DentalFlow's observed name/email ambiguity, independently of competitors | Partial derived directory | Prevent mixed history/contact mistakes; foundational trust | High, migration required | Implement before launch of real clinical-history reliance; approve design first |
| Patient apps and multi-unit management | Clinicorp markets patient/professional apps and broader clinic capabilities. [Plans](https://www.clinicorp.com/planos) | Responsive SPA; single-clinic user shape | Potential growth segment; weak immediate launch justification | High | Evaluate at growth stage; do not promise from Premium wording |

The strongest inference is to complete dependable patient identity and communication workflows, not imitate every competitor capability. No product comparison here certifies healthcare/legal compliance or claims guaranteed revenue uplift.

## Automation ranking

| Rank | Opportunity | Value / effort | Minimal viable scope and safeguards |
| --- | --- | --- | --- |
| 1 | Failed Stripe event alert/reconciliation | Very high reliability; medium effort | Failure visibility, retry ownership, idempotent processing and test-mode proof. Before production recommendation. |
| 2 | Password-reset delivery health and uptime/DB alerts | High support/security value; low-medium | Verify sender, delivery errors and body-aware DB health; one operational alert channel. |
| 3 | Appointment reminders | High staff-time benefit; medium-high | One consent-based template, durable due time, dedup key, cancellation suppression, bounded retry, quiet hours and visible failed queue. |
| 4 | Attention queue contact outcomes/recall | High recovered-visit potential; medium | Stable patient ID, assign/contact/resolve, suppress already booked/recently contacted patients. |
| 5 | Low-stock/expiry digest | Medium-high; low-medium | Reuse existing stock signals, one opt-in digest; no autonomous purchasing. |
| 6 | Overdue payment follow-up | High collections value; medium-high | Verify balance/consent at send, stop after payment, rate-limit, avoid exposing clinical details. |
| 7 | Weekly operational summary | Medium; low-medium | Deterministic occupancy/no-show/receivable metrics first; link to authorized dashboard rather than send sensitive data. |
| 8 | Waiting list/cancellation recovery | Potentially high; medium-high | Human approval, available slot lock, bounded invitations; validate real clinic demand. |
| 9 | Birthday campaigns | Low near-term operational value; medium consent/support burden | Defer; not needed for trustworthy launch. |

No new scheduler, queue service, outgoing message or paid integration was provisioned during the audit.

## AI and integration decisions

Existing AI: operational finance/inventory analysis, classification, diagnosis-style financial summaries, stock copilots and clinical voice structuring. Improve reliability, quota atomicity, human review, cost telemetry and provider privacy assessment before adding models. “Diagnosis” in finance is not a medical diagnostic capability.

Administrative message drafting may be evaluated after deterministic templates: human approves content, minimum personal data, no automatic clinical advice. Revenue leakage insights should first use transparent rules for unpaid completed appointments and cancellations. No-show prediction is premature without stable patient identities, sufficient representative history and bias/accuracy evaluation.

Keep Stripe for SaaS, Google Calendar for existing outbound sync and Resend for recovery. WhatsApp is valuable once delivery semantics are reliable. Add one monitoring integration only after budget/privacy approval. Defer Outlook until demand is demonstrated; defer accounting sync/signature/NFS-e providers until workflow and support ownership are defined. Reject generic automation-platform/webhook marketplace now: it expands sensitive-data egress and maintenance before core contracts are stable.

## Current plans: implementation, not a new offer

| Capability | Starter | Professional | Premium |
| --- | --- | --- | --- |
| Seed monthly / yearly BRL | 129.90 / 1299.00 | 219.90 / 2199.00 | 299.90 / 2999.00 |
| Active users seeded | 8 | 16 | 24 |
| Agenda, derived patients, clinical records/templates/odontogram, team | Included | Included | Included |
| Finance, stock, fiscal control, reports, Google Calendar feature gate | No | Yes | Yes |
| General AI analyses per type/month | 0 | 1 | 10 |
| Stock / abnormal-consumption copilot per type/month | 0 | 10 | 30 |
| Expense classifications/month | 0 | 30 | 100 |
| Monthly finance analyses/month | 0 | 5 | 20 |
| Clinical dictation effective gate | No, effective quota 0 | No, effective quota 0 | Yes, quota 30 |
| WhatsApp fallback monthly allowance | 0 | 50 | 300 |

Actual Plan rows/Stripe price IDs can differ from seeds; no production catalogue was queried. WhatsApp hasWhatsApp=false still falls back to the plan slug in current service logic, so that boolean is not an absolute kill switch. Profile/service limits are null/not enforced. Seed support/custom-domain flags are true on all plans but do not establish operational delivery. Local trial is seven days once per clinic; no automatic paid Stripe subscription from trial. Up/down changes use create_prorations; cancellation schedules period end; past-due access is blocked. Downgrade over-quota policy needs explicit product acceptance criteria.

Static public monthly promotion shows 99.90/189.90/279.90, while backend campaign defaults ended 2026-06-01 and capacity counters are configuration. Annual Starter can appear more expensive than promotional monthly. Reconcile current effective offer and Stripe coupons before selling; do not treat countdowns/static scarcity as measured usage.

## Proposed segmentation — approval required

Keep existing names to avoid needless migration. Retain current 8/16/24 user limits provisionally; measure staff usage before revising. **No prices or entitlements changed.**

| Plan | Target / included value | Automation/integrations/reporting | Support / upsell |
| --- | --- | --- | --- |
| Starter | Single clinic: scheduling, dependable patients, clinical notes/odontogram, team and basic payment tracking | Essential daily operational view; basic export/access to own records; manual communication handoff | Standard support/onboarding with real published channel. Upgrade when repeated staff work or control complexity grows. |
| Professional | Typical active clinic; full finance, inventory, fiscal organization and operational reports | Google Calendar, cost-bounded WhatsApp and future approved reminder workflow; current limited administrative AI | Make this the practical default for teams. Publish usage/reset/delivery definitions and recoverable over-quota behavior. |
| Premium | Larger single-clinic operation needing higher limits and advanced assistance | Higher communication/AI allowance, reviewed dictation, deeper analytics; later approved integrations | Priority support only with staff/SLA capacity. Multi-unit access is not included until actually implemented. |

Never paywall security, tenant isolation, password recovery, core record correctness, legal consent/rights handling or essential data access/portability. Basic appointment payment tracking already has its own role policy; do not cripple Starter by conflating it with advanced financial analytics. Price new vendor-heavy features using measured cost and customer willingness, not an arbitrary checkbox count.

## Proposal records

| Proposal | Problem / opportunity | Customer and business value | Implementation / complexity | Risk / dependencies | Timing decision |
| --- | --- | --- | --- | --- | --- |
| Stable Patient identity | Name/email collisions | Safer histories and communication; trust | Patient aggregate, scoped references, reviewed backfill; high | Data migration and ambiguous matches; clinician/operator review | Design approval before clinical rollout; never silent migration |
| Durable notifications | Manual sends and missing scheduler | Saved reception time and retention | Existing DB-backed outbox/worker or managed queue after measurement; medium-high | Provider cost, consent, quiet hours, restart/retry | After reliable launch; paid infrastructure needs approval |
| Contract automation | Separate DTO/client/plan definitions | Fewer integration regressions | Nest OpenAPI artifact + critical contract tests; medium | New tooling/CI ownership | Next engineering investment; avoid immediate client rewrite |
| Monitoring | Weak release/tenant correlation | Faster recovery, lower support cost | Structured correlation + one error collector/uptime alert; medium | Vendor privacy/cost, sensitive data redaction | Operational minimum before launch; vendor approval |
| Digital intake/signature | Manual retyping/approval | Patient convenience and retention | Secure patient identity/link and reviewed provider; high | Legal evidence, healthcare privacy, fees | Evaluate with pilot clinics after core identity |

## Roadmap

**Before Production:** settle high-risk patient identity for clinical use; verified account recovery, secrets/demo-account exclusion, billing failure recovery, restore/alerts, real-browser auth, current prices/claims and legal/provider operations. Resolve reachable critical advisories or document an evidence-based bounded mitigation. No launch delay for speculative modules.

**Post-Launch — Immediate:** correlated diagnostics, response contract tests, quota/month-boundary corrections, bounded query performance and support instrumentation.

**Post-Launch — Short Term:** reliable appointment reminders, attention-queue follow-up outcomes and stock digest; measure minutes saved, confirmed appointments, failed deliveries and opt-outs.

**Growth Stage:** intake/signing, payment-provider integration, unit-aware permissions and multi-unit design only with validated demand and approved economics.

**Later / Optional:** Outlook, scheduled report distribution, advanced analytics beyond deterministic operational metrics.

**Rejected / Not Worth It now:** autonomous diagnosis/treatment/prescription AI (clinical harm/privacy risk); autonomous debt negotiation (sensitive financial decisions); replacing Nest with microservices or introducing Kubernetes (operational overhead); broad CRM/marketing campaign builder (duplicates attention workflow and consent burden); custom workflow language/plugin marketplace (maintenance/security surface); extra 3D operational UI (bundle cost with little clinic benefit); recreating all listed competitor features (no validated need).
