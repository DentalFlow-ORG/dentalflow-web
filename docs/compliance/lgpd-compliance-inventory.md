# Privacy data inventory — technical scope

Reviewed 2026-09-20 against Prisma and integration services. This is a technical processing inventory, not an approved legal-basis matrix. Determine controller/operator responsibilities and applicable health-data safeguards with the responsible privacy/legal professionals. [Official LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).

| Data | Source/storage | Use and recipients | Current limitation |
| --- | --- | --- | --- |
| Staff identity, email, role, clinic, password hash | User, Clinic, Profile | Authentication, team and tenant operations | Known demo seed must stay out of production. |
| Refresh/reset/session metadata | RefreshToken, PasswordResetToken, AuthOAuthState | Auth service; refresh HttpOnly, hashes at rest | Access token JS memory; localStorage only session marker for auth. |
| Patient contact and appointment history | Appointment, PatientAvatar | Clinic staff, authorized notification/calendar paths | No Patient master record; name/email identity collision risk. |
| Clinical notes/templates/odontogram/images | ClinicalRecord, events/attachments, ClinicalTemplate, OdontogramRecord | Authorized OWNER/DENTIST; audio processing external when invoked | No claim of qualified signature or automated erasure. |
| Clinical audio and structured AI output | Dictation service; AiAssistantAnalysis | OpenAI when configured and invoked | Vendor retention/settings and legal basis unverified; human review required. |
| Finance and fiscal records | FinancialTransaction, FixedExpense, categories, fiscal profile/invoices/events | Authorized clinic roles and report exports | Fiscal provider is local simulation. |
| SaaS customer/subscription/event data | Subscription/Item, Plan, StripeEvent raw payload | Stripe and platform administration | Card data is handled by Stripe; IDs are not secrets but can be personal metadata. |
| Calendar credentials/events | Encrypted integration tokens, OAuth state, event identifiers | Google Calendar | Actual title/description payload needs minimization review; no privacy-mode selector. |
| WhatsApp contact, consent, template and delivery metadata | NotificationConsent/Preference/Quota/Message/Template | Meta if real provider selected | Manual sends; no durable reminder scheduler. |
| Password-reset recipient/link | MailService | Resend when configured; dev-only link logging otherwise | Production response does not prove delivery. |
| Audit, terms, cookie consent and rights requests | AuditLog, TermsAcceptance, CookieConsentLog, PrivacyRequest | Platform ADMIN and controlled operations | No general export/erasure automation; request clinicName is untrusted text. |
| Logs/backups | Application/provider infrastructure | Operations/support under approved access | Query-string redaction, retention, backup scope and restore evidence incomplete. |

Do not infer a data item exists merely from an old policy table. Exact fields/relationships are in [database reference](../integrations/database-reference.md). Access policies are in [API source reference](../integrations/source-reference.md). Actual subprocessor contracts, regions and backup entitlements require deployment/account review.

Open actions: real public contact/company details; approved notices/terms, provider transfer review, subject identity verification, rights-response workflow, legally reviewed retention and incident ownership. See [retention](data-retention-policy.md) and [production checklist](../deployment/production-readiness.md).
