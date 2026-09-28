# API contract and integration findings

The [source reference](source-reference.md) lists every detected controller method, inputs, success status, inferred response, access decorators, DTO source and direct frontend apiRequest call. The [database reference](database-reference.md) connects those services to storage. Neither generated file is OpenAPI or a runtime schema.

## Conventions

- Base URL includes `/api` by default; `/webhooks/whatsapp` is unprefixed. JSON requests use Content-Type and Bearer where authenticated. Browser requests include credentials.
- Refresh reads the HttpOnly cookie; logout also requires JWT. Google callbacks redirect. Stripe and Meta callbacks require provider-specific verification, not user JWT.
- Strict DTO validation rejects unexpected fields, transforms declared query types and applies field validators. Read linked DTO files for exact required/optional fields and bounds. There is no single universal pagination envelope: some list DTOs paginate, patients returns `{data,total}` without server pagination, other endpoints return arrays/aggregates.
- Success payloads are domain-specific. Nest defaults POST to 201 unless HttpCode/explicit response overrides it; PATCH/GET normally 200; downloads/redirects are exceptions. Do not infer status from method alone when a controller handles Res.
- Error envelope from GlobalExceptionFilter: `{statusCode,message,error?,timestamp,path,requestId?}`. message can be string or array. Common failures: 400 validation, 401 identity, 402 subscription, 403 role/plan/consent, 404 scoped missing resource, 409 uniqueness/conflict, 413 body size, 429 rate/quota, 5xx internal/provider errors. Frontend network/timeout errors are synthesized locally.
- Unknown internal/Prisma failures are sanitized; only the URL path (without query) is included in responses/logs; paths can still contain patient identifiers. Avoid secrets or clinical text in query parameters.

## Key payloads and flows

| Flow | Client ↔ server contract | Boundary |
| --- | --- | --- |
| Password sign-in | POST /auth/login (alias /sign-in); SignInDto; `{accessToken,user}` plus cookie | No refresh token in JSON. |
| Register | RegisterDto with user/clinic and terms acceptance; `{accessToken,user}` | Server establishes owner/tenant; user does not select privileged role. |
| Refresh | POST /auth/refresh; cookie; `{accessToken}` | Frontend deduplicates concurrent refresh within one JS context. |
| Subscription | Checkout/trial/change use `{planKey,billingInterval}`; sync uses session DTO; checkout/portal return URL | Redirect success is not payment proof; backend reconciles Stripe/tenant. |
| Patients | GET /patients?search; GET /patients/history?identifier; avatar batch `{identifiers}` / upsert `{identifier,avatarBase64}` | Identifier is name/email, not stable patient ID. |
| Appointment | Create/update/status DTOs in appointments module | Server owns availability/conflict/status/tenant rules. |
| Reports | Query DTOs; previews and exports have different response/content behavior | Inspect blob download clients separately from JSON list. |
| Dictation | Audio DTO on clinical record route; structured draft response | 6 MB parser / DTO bounds; vendor call and human review required. |

## Confirmed discrepancies and operational gaps

| Finding | Evidence | Classification / action |
| --- | --- | --- |
| Admin clinic mutations have no API implementation | admin-clinics.service.ts calls POST /admin/clinics and PATCH/DELETE /admin/clinics/:id; no matching controller; client converts 404 into unavailable-action message | Unsupported controls are now disabled and rows are read-only, covered by regression tests. Listing/health continue through /admin/users/clinics. Legacy mutations are not an implemented API; RF-027 stays partial. |
| Old frontend agent contract treated cookies as future work | auth.controller + session-storage + http.ts | Documentation corrected; current Bearer + HttpOnly refresh documented. |
| Patient registration promised as independent capability | patients controller has no create/update patient route; list is SQL aggregation | Product/domain gap; document partial status. Stable-ID migration requires separate approved design. |
| Automatic WhatsApp reminders and inbound reschedule promised | notification.service sends on request; webhook normalizes inbound messages only as metadata | Copy corrected to manual sends/configuration; durable automation proposed, not implemented. |
| Clinical dictation quota vs feature gate | ai-quota now gates dictation with the existing plan-feature rule | Resolved: Premium-only; other plans expose zero effective quota; uncached frontend status is fetched before recording, failure can be retried. No pricing change. |
| Marketing prices vs actual campaign | landing-content static promotional values; backend historical campaign date and live Plan/Stripe catalogue | Reconcile before selling; pricing changes require product decision. |
| Feature flags do not all enforce/represent service | seeded hasCustomDomain/hasPrioritySupport true for all; nullable profile/service limits not enforced | Do not promise multi-unit/custom-domain fulfillment from booleans. |
| Backend has routes without direct frontend service calls | Generated unmatched list includes OAuth/webhooks/admin/aliases/public profile APIs and downloads | Not automatically dead code. No endpoint removed. |
| Health returns successful HTTP on DB failure | health controller returns 503 for database failure | Resolved in code with health tests. Cloud healthcheck configuration remains manual. |
| Production CSP blocks existing CEP lookup | cep.service.ts fetches https://viacep.com.br; vercel.json connect-src now also permits the exact ViaCEP origin | Resolved in code with CSP regression; deployed headers/provider smoke test still manual. |
| Custom API prefix vs dictation parser | isClinicalDictationRoute matches api/unprefixed only | Keep API_PREFIX=api; test before customization. |
| No shared runtime response schema | Handwritten TS services and DTOs; no Nest Swagger dependency | Simplest next step: export Nest OpenAPI and validate critical client fixtures, before considering full generated-client migration. |

Static candidate matching is intentionally conservative and does not prove payload compatibility. The source catalog exposes unmatched/dynamic expressions for manual inspection; no claim is made that every possible backend response is accepted by the frontend. External providers were not contacted with real credentials. Prioritize executable login/refresh, checkout/status, appointment/payment, patient identity and report export contracts.

## Contract automation proposal

### Form contract clarifications (2026-09-28)

Appointment PAYMENT_PENDING/CANCELED clear paidAmount, paymentDate and paymentMethod. COMPLETED/CANCELED appointments reject normal editing. Explicit patientId reuses only that Patient; absent selection must not infer identity from contact attributes. Recognizable Brazilian phones are normalized to local digits on writes; legacy masked contacts remain compatible, without historical backfill or contact uniqueness.

Fiscal profile drafts accept empty CEP/UF, while simulation/issuance requires completeness. Normal writable DTOs exclude fiscalProvider/fiscalProviderMode and the validation pipe rejects client attempts to provide them. Backend configuration supplies defaults; ordinary updates preserve routing. Local simulation remains without legal validity. Stock purchasePrice is nullable: clearing sends null, and explicit zero remains zero. The [takeover report](../quality/form-hardening-takeover.md) records tests, all affected phone columns, existing admin-clinic CRUD limitations and human QA routes.

### Existing automation proposal

Problem: independently maintained DTOs, UI types, plan maps and static marketing allow silent drift. Opportunity: a reviewed OpenAPI artifact from the existing Nest controllers/DTOs plus representative response contract tests. Start with auth, billing and appointments; keep handwritten service wrappers so UI remains unchanged. Add generated types/client only after error, cookie, download and pagination behavior is represented. Complexity medium; new tooling dependency and CI ownership require approval. A shared cross-repository business-logic package is rejected at this stage: it would couple releases without solving runtime validation.
