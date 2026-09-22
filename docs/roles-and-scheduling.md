# Roles and scheduling — implemented model

Reviewed 2026-09-20 against router, controllers, AccessPolicyService and Prisma.

| Role | Tenant shape | Access |
| --- | --- | --- |
| ADMIN | clinicId null | Explicit platform clinics/users/SaaS finance/privacy/audit administration; no inherited clinical access. |
| OWNER | clinicId required | Clinic, team, schedule, clinical, finance and billing within plan/endpoint gates. |
| DENTIST | clinicId required | Own agenda/professional scope, clinical work, own Calendar connection when available. |
| ASSISTANT | clinicId required | Operational appointments/payments, patients, stock, fiscal/reports as permitted; not full finance or subscription mutation. |
| PATIENT | clinicId null | Incomplete Google signup only; no implemented patient portal. |

There is no ADMIN > OWNER permission hierarchy. JWT validation reloads role/tenant state. See [endpoint policies](integrations/source-reference.md).

Routes: `/app` OWNER/ASSISTANT; `/app/inicio` and `/app/agenda` DENTIST; `/app/agendamentos` OWNER/ASSISTANT; `/app/equipe` and `/app/financeiro` OWNER; `/app/prontuario` OWNER/DENTIST; `/app/pacientes`, `/app/estoque`, `/app/notas-fiscais`, `/app/relatorios` OWNER/ASSISTANT; `/app/admin/*` ADMIN. Current compliance path: `/app/admin/compliance`. Clinic members can view allowed subscription status; OWNER mutates subscriptions.

Scheduling: Clinic → Profile → Service/Availability/AvailabilityException → Appointment. OWNER/ASSISTANT create appointments; status actions separately permit dentist own-schedule completion/no-show. Server validates scope, windows, conflicts and transitions, using advisory transaction locking for concurrent creation. Patient contact fields are stored on appointments; no Patient model exists.

Public professional APIs exist without a connected frontend public booking journey. `/app/leads` redirects to `/app/pacientes/atencao`. See [RF catalog](requirements/functional.md) for completeness and identity limitations.
