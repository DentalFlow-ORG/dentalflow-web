# Stable patient identity — design and migration state

Status: **stages 1–6 implemented and validated against PostgreSQL. Stage 7
(enforcement) is deliberately not done.** This document is both the design and
the record of what was actually built. Browser/operational acceptance remains pending;
earlier review conclusions below do not substitute for the current release gate.

## Runtime compatibility release gate

Explicit `patientId` selects exactly that Patient in the caller's clinic. Endpoints
also accepting a legacy identifier reject a conflicting identifier. Without an ID,
the centralized resolver rejects ambiguous matches, continues through the single
resolved Patient ID, or restricts unresolved compatibility access to rows whose
`patientId IS NULL`. Contact matching cannot directly mutate stable-owned rows.
Clinical completion snapshots only the record's stable Patient chart when present.

A new booking without a selected Patient creates a separate identity, even if all
contacts match an existing Patient. The transaction advisory lock serializes the
availability check and insertion for the clinic/profile/day; its side-effect SQL
uses Prisma execution rather than deserializing PostgreSQL's void result.

History, timeline, attention grouping and avatar state use stable IDs. The editor
remounts for each record and guards chart state by its active owner; unloaded or
obsolete charts cannot be saved. Late reads/saves cannot replace another Patient's
state. Text-only clinical draft saving remains available when a chart fails to load.

`RECORD_FROM_APPT` checks ownership of the record, appointment **and Patient**.
Its per-record transaction locks all three proof rows and revalidates the original
appointment link and Patient ID before assignment. Changed evidence is skipped;
explicit assignments survive. Legacy appointments and standalone charts/avatars
remain quarantined. No demographic inference or Patient creation is added to backfill.

The permanent PostgreSQL runtime regressions and frontend switching tests are the
automated release gate. The [browser acceptance scenario](../quality/frontend-browser-qa.md#stable-patient-identity--mandatory-release-acceptance)
must still be performed before operational acceptance. Deploy API before web.

Related: [production hardening](production-hardening.md) ·
[production readiness](production-readiness.md) ·
[architecture](../architecture/system.md)

## 1. Why this was required

There was no `Patient` model. A patient was derived from denormalized columns
on `Appointment`, `ClinicalRecord`, `OdontogramRecord` and `PatientAvatar`:

```
identity = normalized(patientEmail) ?? normalized(patientName)
```

Neither branch identifies a person. Two people may legitimately share a full
name, a household email, a household phone, or all three; one person may change
any of them without becoming someone else.

This was not theoretical. Against real PostgreSQL, a household booking two
people under one address produced **one** patient, and charting the second
patient resolved the shared address to the first patient's odontogram row and
`UPDATE`d it in place — destroying that patient's dental chart. Clinical
timelines and appointment histories merged on the same key.

Containment (`PatientIdentityService`) reduced this by refusing ambiguous
lookups with `409`, but it could never close the case where two people share
*every* discriminating column, because the columns do not carry identity.

## 2. Implemented model

```prisma
model Patient {
  id        String    @id @default(cuid())
  clinicId  String
  name      String
  email     String?
  phone     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
  // indexes on (clinicId), (clinicId,email), (clinicId,phone), (clinicId,name)
}
```

`Patient.id` is identity. Name, email and phone are **attributes**.

**No uniqueness on name, email or phone.** Those indexes exist for lookup only.
Adding a unique constraint to any of them would recreate the original defect
under a new table, because it would again declare that a shared contact value
means a shared person.

**No CPF constraint.** CPF was evaluated and rejected as an identity key for
this migration: it appears nowhere in the patient-facing schema or API — only
in the fiscal domain (`ClinicFiscalProfile.documentNumber`,
`ServiceInvoice.customerDocument`). Nothing captures it for a patient, so it
would be null for every row and could not function as an identity constraint.

**No `mergedIntoId`.** Merge semantics were considered and deliberately left
out: the migration assigns identity to *rows* rather than creating provisional
Patients that later need merging, so nothing in the implemented path needs a
reversible merge. Patient merge remains a separate future feature.

### Migrated models

Nullable `patientId` FK (`ON DELETE SET NULL`) added to:
`Appointment`, `ClinicalRecord`, `OdontogramRecord`, `PatientAvatar`.

`PatientAvatar` also gains `@@unique([clinicId, patientId])`. Because
`patientId` is nullable, PostgreSQL treats NULLs as distinct, so un-migrated
rows are unaffected.

### Explicitly out of scope

- **`ServiceInvoice.patientId` is NOT this entity.** It is a pre-existing
  nullable FK to **`User`**, exposed through the fiscal API (`invoice.dto.ts`).
  It was left untouched because renaming it is a separate API-contract
  migration. Note that `Appointment` and `NotificationConsent` call the same
  relationship `patientUserId`; `ServiceInvoice` is the naming outlier.
  Fiscal documents also carry an immutable `customerName`/`Document`/`Email`/
  `Phone` snapshot, which is legally required to reflect the moment of issue
  and must not follow a mutable Patient record.
- **`NotificationConsent`** keys on `phone` because WhatsApp consent attaches
  to the number, not the person. It owns no clinical data.
- Rows that inherit identity through an FK — `ClinicalRecordAttachment`,
  `FinancialTransaction`, `NotificationMessage`, `FiscalInvoiceEvent` — need no
  column of their own.

## 3. Stages performed

**1 — additive schema.** `20260921000000_add_patient_identity`. Purely
additive: one `CREATE TABLE`, four nullable `ADD COLUMN`, nine `CREATE INDEX`,
five `ADD FOREIGN KEY`. **Zero destructive statements**; nothing dropped,
nothing rewritten. Old code runs unchanged because every new column is nullable
and unreferenced by it.

*Locking note:* the `CREATE INDEX` statements are not `CONCURRENTLY` and take a
`ShareLock` that blocks writes while they build. On an empty or small table this
is negligible; before running against a large populated database, convert them
to `CREATE INDEX CONCURRENTLY` outside a transaction.

**2 — centralized resolver.** `PatientResolverService` is the only place an
identity is decided. Services no longer re-derive `email/name → patient`.

**3 — dual write.** Appointment creation resolves identity and stores
`patientId`; clinical records inherit it from the appointment FK; odontograms
and avatars carry it when it can be established.

**4 — deterministic backfill.** `bun run patients:backfill` (dry run by
default, `--apply` to write). See §5.

**5 — reads switched.** Patient list, appointment history, clinical timeline,
odontogram read/write and avatars all key on `patientId` when present.

**6 — frontend carries identity.** `patientId` flows through the patient list,
history, timeline, odontogram and avatar paths, with `identifier` retained as
the compatibility fallback.

**7 — enforcement (NOT done).** Making `patientId` `NOT NULL` and retiring the
legacy path is the only irreversible step and is deliberately deferred until a
deployment has run with quarantine counts at zero.

## 4. Patient creation semantics

Identity is asserted by the operator, never inferred from contact details:

| Situation | Behaviour |
| --- | --- |
| Caller sends `patientId` | Validated against the caller's clinic, then used. |
| New booking with typed details and no selected `patientId` | Create a separate Patient inside the booking transaction; contact matches never reuse another identity. |
| Compatibility lookup with exactly one eligible stable Patient | Continue through that Patient ID. |
| Compatibility lookup with several stable matches | `409`. Never choose the first match. |
| A lookup (history, timeline, odontogram, avatar) finds nothing | Returns empty. **Never creates.** |

Creation happens inside the booking's own transaction, so a Patient is never
recorded without the appointment that justifies it.

## 5. Backfill rules

The rule that matters is what the backfill refuses to do. It associates rows
only where the database already guarantees the relationship, and there is
exactly one such case:

| Rule | Basis | Safety |
| --- | --- | --- |
| `RECORD_FROM_APPT` | `ClinicalRecord.appointmentId → Appointment.patientId` | Require matching record, appointment and Patient clinics; lock and revalidate the original link, Patient ID and null target inside the assignment transaction. Changed or foreign-clinic evidence is skipped. |

**Legacy appointments are never assigned automatically.** Two earlier versions
of this script tried and were both wrong. The first grouped by `patientUserId`;
the second added the normalized name. `patientUserId` is a *login account*, not
a person, and a name is a demographic attribute — so a household login shared
by a father and son with the same full name satisfied both rules and merged two
real people into one Patient. That is the exact failure this migration exists
to remove.

Legacy identity was never recorded, so it cannot be recovered by inference. No
amount of contact data proves that two appointments were for the same person.
Appointments therefore keep `patientId = NULL` until an operator assigns one
using clinical knowledge the database does not contain.

This is not a loss of function. New bookings get identity from dual-write, and
once an appointment has an identity — from dual-write or from reconciliation —
re-running the script propagates it to that appointment's clinical records
along a real foreign key.

**Everything unassigned is left `patientId = NULL`.** That is the quarantine,
and `patientId IS NULL` is the count. Those rows keep resolving through the
legacy path, which still refuses ambiguous lookups.

Contact-field equality is never used to prove sameness anywhere in the script.
Standalone odontograms carry no FK to anything and are never assigned.

Fragmenting one real patient into two provisional rows is recoverable. Merging
two real people is not. The backfill always prefers the former.

The script refuses to run against a non-local host unless
`ALLOW_NON_LOCAL_BACKFILL=1` is set deliberately. The check reads the URL's
hostname, lower-cases it and strips IPv6 brackets, then allows only
`localhost`, `127.0.0.1`, `::1` and `host.docker.internal`; an unparseable URL
fails closed. Verified against Supabase (pooler and direct), Render, Neon,
bare Docker service names and a `127.0.0.1.evil.com` lookalike — all refused.

**This guard is accidental-execution protection, not a security boundary.** An
SSH tunnel or local proxy can always make a remote database appear local, and
nothing in a connection string can reveal that. Operators must confirm what the
URL actually points at.

`RECORD_FROM_APPT` reports 0 in a dry run when the appointments it depends on
have not yet been assigned. Dry-run record counts are a **lower bound**, never
an exact preview.

## 6. Reconciliation workflow

Ambiguity is detected as `patientId IS NULL`; `bun run patients:backfill`
reports the count per table. To resolve a row an operator identifies the correct
person from the appointment history (dates, professional, services — evidence
the database cannot weigh), then assigns `patientId` directly.

No admin UI was built. A reviewed script is the appropriate first release: the
volume is bounded, the action is rare, and an under-specified merge UI is itself
a way to create cross-patient errors. Assignment is reversible (set the column
back to NULL); it does not destroy the legacy snapshot columns.

## 7. Compatibility and rollback

`identifier` and `patientId` are both accepted. `patientId` wins whenever
present; `identifier` resolves through the legacy path and is never presented as
equivalent.

**Deployment order is constrained — deploy the API first.** An earlier draft of
this document claimed both directions were safe; that is wrong. The API's
`ValidationPipe` runs with `forbidNonWhitelisted: true`, so a **new frontend
sending `patientId` to an old API is rejected with 400**, not degraded. The
reverse direction is safe: an old frontend omits `patientId`, and the new API
treats it as optional. So:

- API before web: safe.
- Web before API: **breaks** every request that carries `patientId`.

This is a release-ordering requirement, not a reason to relax DTO validation —
`forbidNonWhitelisted` is a deliberate security control and should stay.

Rollback for stages 1–6 is a redeploy of the previous build — the denormalized
columns are still written and still authoritative for un-migrated rows. Nothing
was dropped, so no data is lost by reverting. Stage 7 would be the first
irreversible step.

`patientName`, `patientEmail` and `patientPhone` are **retained on purpose** as
point-in-time snapshots of what was recorded at the visit. They are no longer
identity. Removing them is a separate, deliberate decision.

## 8. Evidence

`test/integration/patient-identity.int-spec.ts` (21 tests) and
`test/integration/patient-backfill.int-spec.ts` (8 tests), both against real
PostgreSQL.

The acceptance case — two patients sharing name, email **and** phone — proves
distinct `patientId`s, separate odontograms with no overwrite, separate clinical
timelines, separate appointment histories and separate avatars. Cross-tenant
tests prove a patient id from another clinic is indistinguishable from one that
does not exist.

The original corruption reproduction was kept and converted in place, as
required, rather than deleted.

## 9. Deletion semantics — an open decision

The FKs use `ON DELETE SET NULL`. A **hard** delete of a Patient therefore
detaches every clinical row back to `patientId = NULL`, returning it to the
legacy contact-matching path. Nothing is destroyed, and containment still
refuses ambiguous lookups, but the row loses stable identity — so an accidental
hard delete partially reopens the problem this migration closed.

`Patient.deletedAt` exists, which implies soft deletion is the intended route,
but **no code performs either deletion today** and no policy is written down.
Verified behaviour of a soft-deleted patient: clinical reads reject it
(`requirePatient` filters `deletedAt: null`), and the legacy resolver will not
reuse it, so a later booking with the same details creates a new Patient.

Two decisions are owed before stage 7, and neither is invented here:

1. Is hard deletion ever permitted, given clinical-record retention duties? If
   not, it should be blocked rather than left available.
2. Should a soft-deleted patient's history stay readable for retention and
   audit? It currently is not.

## 10. Remaining risk

Legacy rows with `patientId = NULL` still resolve through contact matching.
They are protected by containment, which refuses ambiguous lookups, but they do
not have stable identity until reconciled. The quarantine count is the measure
of that exposure, and it is zero for a deployment that starts with no data.


## 11. Adversarial review — 2026-09-21

A follow-up review attempted to falsify the migration's claims. Two real
defects were found and fixed; both are covered by
`test/integration/patient-identity-adversarial.int-spec.ts` (22 tests).

**Backfill could merge two people.** `APPOINTMENT_USER` grouped appointments by
`patientUserId` alone. That column is a *login account*, and `patientName` is
free text that is never validated against it, so a clinic that attached one
household account to a dependant's booking would have had parent and child
merged into a single Patient. The rule now additionally splits on the
normalized name. Splitting on an attribute can only fragment one person into
two provisional records; it can never combine two people, which is why it is
safe where merging on the same attribute is not.

**Avatar writes skipped the tenant check.** `upsertPatientAvatar` accepted any
`patientId` and created a row against it, letting one clinic write a row
referencing another tenant's patient. It now validates the patient through the
resolver first. No read path leaked data, and no clinical model was affected.

**Frontend avatar cache leaked across a shared address.** The synchronous
initial state and the patient-list pre-warm both keyed on the raw identifier
while the fetch keyed on identity, so two patients sharing an email could show
each other's photo on first render. All cache reads and writes now go through
`patientAvatarCacheKey`.

Claims that survived the review: the four-model scope is exhaustive; identical
name, email and phone remain isolated in both write orders; the original
odontogram corruption cannot be reproduced; tenant isolation holds on every
clinical path; the resolver never turns a failed lookup into a creation;
`RECORD_FROM_APPT` is deterministic and never overwrites an existing
assignment; standalone odontograms and avatars are never auto-assigned; the
migration SQL is additive with no enforcement hidden in it; and the backfill is
idempotent across `dry → apply → apply → dry` with stable assignments and zero
orphan foreign keys.


## 12. Second review pass — 2026-09-21

A further review probed the areas the first pass had not: hook state keying,
backfill tenant safety, and host detection against real hosted URL forms.

**One cross-patient display leak found and fixed.** `usePatientHistory` cached
its loaded history under the contact `identifier`, which a household shares. On
switching from one patient to another with the same address, the guard
`history.identifier === patient.identifier` matched immediately, so the
previous patient's appointments were rendered as the new patient's history with
`isLoading` already false — no loading state to signal staleness. The cached
history is now keyed on `patientId ?? identifier`. Regression tests cover both
the in-flight window and the refetch.

`usePatientClinicalTimeline` and the clinical record editor were checked for the
same pattern and are safe: the timeline dispatches `loading` (clearing records)
before each fetch, and the editor is keyed on a single clinical record id.

**Backfill tenant hardening.** `RECORD_FROM_APPT` inherited a patient from the
linked appointment without confirming both rows sit in the same clinic. The
write path enforces that, but the backfill no longer depends on it having
always held: a record whose appointment belongs to another clinic is skipped
and left quarantined. The write also moved from `update` to `updateMany` with a
`patientId: null` guard, so a concurrent assignment is not overwritten and a
no-match returns zero instead of throwing and aborting the run.

**Host detection verified against real forms.** Supabase (pooler and direct),
Render, Neon, bare Docker service names, a `127.0.0.1.evil.com` lookalike, an
empty string and an unparseable URL are all refused. Hostname comparison now
lower-cases and strips IPv6 brackets, so the `::1` and mixed-case `localhost`
entries the allowlist already claimed to support actually match. No hosted form
is treated as local. The unavoidable gap remains an SSH tunnel that maps a
production database onto localhost.

**Residual backfill ambiguity, accepted.** `APPOINTMENT_USER` can still group
two different people who share one login account *and* an identical normalized
name. No structural discriminator exists for that case, and adding demographic
inference to resolve it would reintroduce the defect this migration removed. It
is rare, it requires legacy rows with `patientUserId` set, and the safe
alternative — quarantine — is already what happens to every row the rule cannot
reach. Recorded as accepted risk rather than fixed.


## 13. Third review pass — 2026-09-21

This pass challenged the one thing the previous pass had accepted rather than
fixed, and found it was wrong to accept.

**`APPOINTMENT_USER` removed — it could still merge two people.** The rule
grouped legacy appointments by `patientUserId` plus the normalized name. Two
different humans — a father and son on one household login, with the same full
name, email and phone — satisfied it and were assigned a single Patient.
Reproduced against real PostgreSQL before the fix.

The previous pass had classified this as an accepted residual risk. That was
the wrong call: the standard is *cannot prove same person → do not merge*, and
the rule was using similarity to prove sameness. The honest conclusion is that
**no structural proof of patient identity exists anywhere in the legacy
schema** — which is precisely why the migration was needed — so no automatic
rule can recover it. The rule is gone; legacy appointments quarantine.

`RECORD_FROM_APPT` survives because it is genuinely structural: it propagates
identity from an appointment that already has one, along a real foreign key.

**Duplicate React keys in the patient list.** `PatientsPageContainer` keyed
rows on `patient.identifier`. The list now returns one row per patient, so a
household sharing an email produced two rows with the same key — React
reconciliation could attach row state to the wrong patient. Keyed on identity
now, with a regression test rendering both household members.

This is the fifth cache/derived-state defect found in this class. The pattern
is consistent: the API was migrated to identity, and each client-side place
that had quietly used the contact identifier as a de-facto key had to be found
individually. The browser smoke suite should exercise patient switching within
a shared-email household specifically, since that is where every one of them
lived.
