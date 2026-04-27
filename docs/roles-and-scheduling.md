# DentalFlow Roles and Scheduling Model

This document defines the intended role model, permission boundaries, tenant
isolation rules, and scheduling flow for DentalFlow.

## Role Model

DentalFlow has five business roles:

| Role | Responsibility | Scope |
| --- | --- | --- |
| `ADMIN` | Internal DentalFlow administrator for support, testing, moderation, and platform-level controls. | SaaS/platform scope. |
| `OWNER` | Clinic owner and paying customer responsible for subscription and clinic configuration. | One clinic tenant. |
| `DENTIST` | Dentist or doctor linked to a clinic. Manages professional profile, availability, and own schedule. | One clinic tenant, own professional data. |
| `ASSISTANT` | Clinic assistant or secretary responsible for operational workflows such as scheduling. | One clinic tenant, operational data. |
| `PATIENT` | Public/client user who can view public pages and manage appointment-related information when supported. | Public flows and own appointment data. |

Permission hierarchy:

```txt
ADMIN > OWNER > DENTIST / ASSISTANT > PATIENT
```

The hierarchy expresses authority, not a frontend navigation model. Business
permissions must be enforced by the backend after authentication.

## Responsibility Boundaries

`ADMIN`:

- Reserved for DentalFlow internal team members.
- Supports testing, moderation, support, and platform-level controls.
- Must not be exposed as a public login option.
- Requires explicit and auditable cross-clinic behavior.

`OWNER`:

- Owns a clinic tenant.
- Manages clinic settings, subscription, dentists, assistants, services, and
  clinic-level configuration.
- Can access clinic-level scheduling data.
- Must not access another clinic.

`DENTIST`:

- Belongs to one clinic.
- Manages own professional profile and availability.
- Accesses appointments and patient context tied to their clinic and
  professional schedule.

`ASSISTANT`:

- Belongs to one clinic.
- Creates, updates, confirms, cancels, and manages clinic appointments.
- Must not manage billing, subscriptions, owner-only settings, or another
  clinic's data.

`PATIENT`:

- Uses public-facing flows.
- Can view public clinic/dentist pages and availability.
- Can request or create appointments depending on the final implementation.
- If authenticated, can manage only their own appointment-related information.

## Clinic Ownership and Multi-Tenancy

DentalFlow is a multi-tenant SaaS. The clinic is the tenant root for clinic
operations.

Tenant isolation rules:

- Every clinic-owned record must be linked to `clinicId`.
- Backend services must filter by the authenticated user's allowed clinic scope.
- Frontend route hiding is not security. It only improves UX.
- A user from one clinic must never access records from another clinic.
- `ADMIN` access must be explicit and auditable because it is platform-level.
- Public endpoints must expose only public data and must not leak internal
  clinic notes, private identifiers, billing data, or operational metadata.

Current backend note:

- The backend already has `OWNER`, `ADMIN`, `DENTIST`, and `ASSISTANT`.
- `PATIENT` is a planned role and requires backend schema/migration work before
  it becomes an authenticated user role.

## Scheduling Model

Scheduling should be built around the existing concepts:

- Clinic: tenant that owns schedules, services, professionals, and appointments.
- Dentist profile: public/professional identity used for availability and
  appointment booking.
- Service: procedure that may define duration and public pricing behavior.
- Availability: recurring working windows for a dentist.
- Availability exception: day-off or special schedule override.
- Appointment: scheduled or requested time linked to clinic, dentist, service,
  and patient data.

Expected flow:

1. `OWNER` configures clinic settings, services, and available dentists.
2. `DENTIST` defines or reviews schedule availability.
3. `ASSISTANT` creates and manages appointments for the clinic.
4. `PATIENT` views public availability and requests or creates appointments.
5. Backend validates clinic isolation, dentist ownership, availability, service
   duration, appointment status transitions, and role permissions.

Appointment records should link to:

- `clinicId`
- dentist/professional profile
- service when applicable
- patient data
- authenticated patient user when `PATIENT` accounts are implemented

## Frontend Exposure Rules

The public login page must remain clean and generic:

- Do not show role selectors.
- Do not show role hierarchy.
- Do not expose `ADMIN`, `OWNER`, `DENTIST`, `ASSISTANT`, or `PATIENT` as public
  login choices.
- Do not describe internal permission rules in public UI.
- Do not branch public authentication visually by internal role.

Allowed public copy:

- Secure access to the clinic environment.
- Operational benefits such as profiles, scheduling readiness, and patient
  communication.
- Generic security messaging.

After authentication, frontend navigation can adapt to the authenticated user,
but every protected action must still be authorized by the backend.

## Backend Authorization Requirements

Backend implementation should provide:

- Role checks for every protected endpoint.
- Tenant checks for every clinic-owned query and mutation.
- Dentist ownership checks for dentist-owned schedules and profiles.
- Assistant restrictions that exclude billing and owner-level settings.
- Patient restrictions that only expose public flows and own appointment data.
- Explicit `ADMIN` behavior for platform-level access.

Scheduling endpoints should be introduced only with backend authorization in
place. Business rules must not live only in frontend components.
