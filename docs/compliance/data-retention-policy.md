# Retention — technical status and approval requirements

Reviewed 2026-09-20. No general automatic retention/deletion job was found. Soft deletion, activation flags, token cleanup and record statuses are not a legally approved retention system.

The previous ten-year clinical-record assertion is withdrawn. Article 6 of Law 13.787/2018 specifies a minimum twenty-year interval from the last record before possible elimination, subject to conditions. This is a reference for professional review, not an instruction to delete automatically. [Official law](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13787.htm).

| Category | Implementation | Decision needed |
| --- | --- | --- |
| Users/clinics | deletedAt/activity flags | Closure, legal holds and disposal. |
| Clinical/attachments/odontogram | Persisted records/events; name/email identity | Healthcare retention, integrity and reliable identity. |
| Appointments/finance/fiscal | Statuses, relations and constraints | Approved fiscal/clinical retention; local fiscal records are not NFS-e. |
| StripeEvent | Raw provider payload and processing metadata | Restricted access, minimization and retention. |
| Refresh/reset/OAuth | Hash/encryption, expiration/revocation, opportunistic cleanup | Cleanup schedule and forensic requirements. |
| Audit/consents/terms/privacy | Persisted workflow/evidence | Restricted access, response deadlines, approved retention. |
| AI/audio | Stored analysis; external audio processing | Vendor retention/settings/contracts and sensitive-data transfer. No verified zero-retention claim. |
| Notifications | Contact/consent/delivery data | Withdrawal, suppression and minimal content/retention. |
| Backups | Cloud operation unverified | Owner, cadence, retention, encryption, restoration, deletion propagation. |

Applicable legal bases, health-data safeguards and controller/operator duties must reflect actual processing. They are not established by a technical table. [Official LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).

Before implementing deletion: inventory all copies/providers/backups, authenticate requester, check holds, preview scope, approve, execute auditable disposal and verify. The former Patient deletion pseudocode was removed because no Patient model or approved destructive implementation exists.
