# Google Calendar privacy — implementation

Reviewed 2026-09-20. Calendar OAuth is separate from Google login. The current controller permits OWNER clinic connections and DENTIST own-user connections; Professional/Premium feature gate applies. The earlier owner-only statement and suggested Prisma model were obsolete.

Actual models: GoogleCalendarIntegration, UserGoogleCalendarIntegration and GoogleCalendarOAuthState; fields in [database reference](../integrations/database-reference.md). Encryption uses AES-256-GCM and GOOGLE_CALENDAR_TOKEN_SECRET, not the previously suggested GOOGLE_TOKEN_ENCRYPTION_KEY. OAuth state and caller scope are validated server-side; tokens are not returned to the browser.

The implementation sends event time/timezone, a title `serviceName - patientName` (or patient name fallback), and a description with professional name. Thus patient identity and appointment/service context leave DentalFlow. Review `buildEventTitle` and `sendGoogleEventRequest` in the API Calendar service before changing data minimization claims. The generated description now explicitly states that the title shares patient name and service with the calendar, while records and contacts remain in DentalFlow. A regression test pins this disclosure. This copy correction does not establish consent, legal basis or safe sharing settings.

No configurable minimum/basic/detailed privacy modes were found. Those old designs are proposals, not current controls. Synchronization is outbound; no two-way editing guarantee. Disconnect behavior and provider-side retained events require manual verification.

Before production: review actual event visibility/sharing with the clinic, OAuth scopes/consent, provider agreements/data transfer, revoked-token behavior, partial sync/retry and data retention. Test owner vs dentist scope and reconnection in the browser. Applicable privacy decisions belong with the clinic/operator and legal review, not an invented configuration selector.

Related: [Google login](../auth/google-oauth.md), [RF-023 / RN-016](../requirements/functional.md), [browser QA](../quality/frontend-browser-qa.md).
