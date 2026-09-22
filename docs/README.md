# DentalFlow documentation

Code audit: 2026-09-20. DentalFlow consists of two sibling repositories:

```text
dentalflow/
├── dentalflow-web/   React application and canonical product documentation
└── dentalflow-api/   NestJS API, Prisma schema/migrations and backend operations
```

The source is authoritative. “Implemented” means there is a connected code path, not that a production deployment, external provider, legal obligation or browser workflow has been certified. Read the validation record before making release claims.

| Need | Canonical document |
| --- | --- |
| System boundaries, tenancy, database | [Architecture](architecture/system.md) |
| Start both applications; environment variables | [Development](development/workspace.md) |
| Features, actors, behavior and source traceability | [Functional requirements](requirements/functional.md) |
| Domain constraints | [Business rules](requirements/business-rules.md) |
| Quality/security guarantees and gaps | [Non-functional requirements](requirements/non-functional.md) |
| API conventions and integration discrepancies | [API contract](integrations/api-contract.md) |
| Every controller route, request DTO and direct frontend call | [Generated source reference](integrations/source-reference.md) |
| All Prisma entities, fields and constraints | [Generated database reference](integrations/database-reference.md) |
| Security findings | [Security review](security/security-hardening-report.md) |
| Current hardening evidence and release decision | [Production hardening](deployment/production-hardening.md) |
| Every baseline dependency advisory | [Dependency disposition](deployment/dependency-advisories.md) |
| Release gates, incident/backup procedures | [Production readiness](deployment/production-readiness.md) |
| Competitors, automation, AI, plans and rejected ideas | [Product decisions and roadmap](product/decisions.md) |
| Document classification, changes and validation results | [Audit report](audit-report.md) |

Existing specialist documents remain canonical for [coverage policy](quality/frontend-coverage-policy.md), [browser QA](quality/frontend-browser-qa.md), [theme](design/theme-rules.md), [buttons/cards](design/button-and-card-theme-guidelines.md), [Google login](auth/google-oauth.md), [roles](roles-and-scheduling.md), [privacy inventory](compliance/lgpd-compliance-inventory.md), [retention](compliance/data-retention-policy.md), [Calendar privacy](compliance/google-calendar-privacy.md), [billing transparency](compliance/billing-consumer-protection.md), and [manual compliance QA](compliance/manual-validation-checklist.md).

Backend entry points: [README](../../dentalflow-api/README.md), [agent instructions](../../dentalflow-api/AGENTS.md), [cross-site authentication](../../dentalflow-api/docs/security/cross-site-auth-and-csrf.md), [Stripe reconciliation](../../dentalflow-api/docs/ops/stripe-subscription-sync.md).

Update requirements and relevant canonical documents in the same change as behavior. Keep RF/RN/RNF identifiers stable. Regenerate the source references after endpoint/schema changes, then review them; generation does not validate runtime contracts. Relative sibling links work in the recommended local layout; repository-only web viewers may need the other checkout open separately.
