# Security audit — current implementation

Reviewed 2026-09-20 against both repositories. Replaces the May draft. No production penetration test or cloud-configuration audit was performed.

Confirmed controls: JWT HS256 with expiry and DB user/tokenVersion validation; bcrypt 12; hashed rotating refresh tokens; HttpOnly cookie; exact-origin CORS and refresh/logout Origin checks; Helmet/no-store/CSP; strict DTO validation; global and auth throttles; explicit role/clinic/professional policies; Stripe signatures; encrypted Calendar tokens; generic internal errors. Source/test traceability is in [architecture](../architecture/system.md) and [requirements](../requirements/functional.md).

No critical exploitable vulnerability was confirmed. This is not security certification.

| Severity | Finding / evidence | Scope and action |
| --- | --- | --- |
| High, conditional deployment exposure | prisma/seed.ts provisions ADMIN with a known fallback password; no production guard. | Never run demo seed in production. Verify absence of demo accounts; separate catalogue provisioning. No exposed production account was verified. |
| High, data integrity | Name/email identifies patients; no stable Patient FK. | Homonyms/shared emails can combine histories within a clinic. Resolve before relying on combined clinical histories. Not demonstrated cross-tenant leakage. |
| Medium | WhatsApp HMAC skipped with no app secret; production check conditional on real sending. | Public receivers that update persisted states should always fail closed without signature configuration. Attacker still needs an existing providerRef to target a message. |
| Medium | Stripe processing failures acknowledged 200. | Stale billing/access can persist without retry. Add recovery/idempotency tests; raw event payloads need restricted retention. |
| Medium | Exception filter logs/returns request.url; message redaction does not redact query strings. | Remove sensitive query values from diagnostic logs; do not claim universally PII-free logging. |
| Medium | JWT_SECRET presence checked, not strength/placeholders. | Provision strong secrets, validate placeholders, define rotation. No actual secret files were printed. |
| Medium | AI quota read/count is not general atomic reservation. | Concurrent requests may exceed spend limits; test/reserve per clinic/type before scaling usage. |
| Medium, operational | Resend optional at boot; no verified recovery/restore/privacy operations. | Exercise password recovery, incident handling, real contacts and restoration before commercial use. |
| Low, scaling constraint | In-memory rate limits. | Shared state required before multiple instances. |
| Low | CI dependency audit nonblocking. | Review reachable runtime advisories and lockfile; current findings in audit report. |

HttpOnly prevents JS reading refresh tokens, not authenticated actions by XSS. Memory access tokens reduce persistence, not all XSS impact. SameSite=None supports the cross-site topology but cannot override browser third-party-cookie blocking. Test real browsers and consider same-site domains. Cookie Path covers the entire auth prefix, not literally only two routes.

Logout requires JWT and checks Origin; refresh uses the cookie and checks Origin. Missing-Origin callers still need credentials. Public signup/recovery/privacy and provider callbacks have their own controls; the old claim that every other mutation uses Bearer was too broad.

See [release gates](../deployment/production-readiness.md). This audit did not silently redesign authentication, billing delivery, medical AI or the database. Each proposed fix needs meaningful regression evidence.

## Production-hardening continuation

The [current hardening report](../deployment/production-hardening.md) supersedes baseline findings only where it records a fix and evidence: reset-token atomic claim, production mail/secret validation, local-only demo seed, signed/awaited Meta receiver, retryable/transactional Stripe processing, query omission/request correlation, database readiness, ViaCEP CSP and targeted advisory patches. Patient identity, Calendar sharing approval, provider delivery, browser cookies and infrastructure evidence remain explicit gates. No legal or penetration-test certification is implied.
