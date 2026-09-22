# RBAC review

Reviewed 2026-09-20. The former draft incorrectly described a patient portal and role hierarchy. [Roles and scheduling](../roles-and-scheduling.md) is canonical.

API policies are listed in [source-reference.md](../integrations/source-reference.md). Backend tests: route-access-matrix, authorization-enforcement, tenant-scoping and cross-tenant-isolation. Read service scoping as well as decorators; a permitted role is not permission to use another clinic's ID.

ADMIN is platform-scoped, not a super-owner of clinical data. OWNER/DENTIST/ASSISTANT require a clinic. PATIENT is provisional Google onboarding. Privacy requests and audit administration are ADMIN-only: free-text clinicName is not a trusted tenant FK.

Frontend guards provide navigation UX; backend guards and AccessPolicyService enforce security. Dentist scope is own professional data where allowed. Assistants have operational schedule/patient/stock/fiscal/report access with per-endpoint limits; appointment-payment access does not grant the full owner finance module.

Remaining release proof: real-DB isolation suites and browser role navigation. New ID-taking endpoints need scoped queries, allowed/denied tests and 404 for out-of-scope resources. Current results: [audit report](../audit-report.md).
