# Form hardening takeover — 2026-09-28

This record covers the intentional, uncommitted changes in `dentalflow-web` and sibling `dentalflow-api` on `dev/yago`. Source and test results take precedence over earlier handoffs. No commits, pushes, branch changes, restores or historical-data changes were performed.

## A. Takeover summary

Initial classification after inspecting both statuses, unstaged/staged diffs and affected sources:

| Class | Findings at takeover |
| --- | --- |
| Already completed | Shared validators/formatters, centralized confirmations, Patient picker/debounce, stock nullable price, controller actor forwarding, fiscal provider rejection and canonical report labels were already present. |
| Partially completed | Phone normalization did not cover every nullable update/inherited snapshot; odontogram recovery needed its reload identity dependency corrected and full validation. |
| Still missing | Some native appointment/availability validation paths, raw phone paste capacity, field-error associations and full cross-repository validation/evidence. |
| Incorrect / regressed | Payment primary action overrode a selected pending status; rejected date draft could remain visibly inconsistent; clinical counter described an absent element and announced too frequently; unsupported odontogram note cap. Each correction was tied to executable regression evidence. |
| Needs product/external disposition | Admin-clinic backend CRUD does not exist; provider/browser acceptance cannot be inferred from mocked UI tests. No new product decision was invented for the three authoritative payment/appointment/fiscal rules. |

Already implemented in the incoming work: shared email/password/phone/money helpers; shared confirmations; explicit Patient picker; debounce; invoice optional email and duplicate-submit protection; fiscal draft validation; stock null clearing; appointment immutability; payment clearing; self-lockout service/controller coverage; session revocation; odontogram ordering, dirty-state retry and navigation protection; internal fiscal-routing DTO restrictions; canonical invoice status reuse.

Completed or corrected during takeover:

- Payment primary-button activation now honors a newly selected pending status instead of silently overriding it with paid. Dedicated actions, confirmation cancellation, keyboard activation and retry remain covered.
- DatePicker reconciles a rejected draft to the controlled value on blur. Finance forms require their relevant date and associate field errors with the corresponding controls.
- Phone inputs accept raw international paste before normalization. Appointment creation and editing both send local digits; editing formats a canonical stored phone on entry. Backend clinic/user/clinical/fiscal writes normalize recognizable Brazilian contacts, including inherited appointment snapshots. Display consumers format canonical digits and preserve unfamiliar historical values. Attention WhatsApp links include the Brazilian country code for recognized local numbers.
- Clinical counters no longer reference absent elements or announce every character. Arbitrary odontogram-note limits were removed; actual DTO text limits remain.
- Appointment/availability/exception forms display custom errors instead of depending on native browser popups. All native form declarations now use `noValidate`.
- Product/category/stock-movement errors are associated with invalid fields using the existing `FormField` contract. Stock price remains nullable.
- Clinic status edits use the existing confirmation dialog, block duplicate submission and expose recoverable failure inside the confirmation. The missing admin-clinic API remains an explicit contract limitation.
- Product-name and dictation-review placeholders were completed. An internal-only exported odontogram type was made private after checking consumers.

Left unchanged intentionally: stable Patient ownership, existing appointment state machine, public role/API contracts, schema and migration history, fiscal local simulation, thresholds, stack and architecture. No contact-based Patient identity logic was introduced.

## B. Known findings and disposition

Frontend feature paths below are relative to `src/features`; `components/common` and `lib` are relative to `src`. API paths refer to the sibling repository. Frontend regression suites live under `src/tests` and mirror the indicated feature/component unless explicitly named otherwise.

| Finding | Implementation/disposition | Main source and regression evidence | Manual QA |
| --- | --- | --- | --- |
| 5.1 Payment confirmation bypass | Corrected primary-action override; centralized clearing confirmation retained | `scheduling/components/appointments/AppointmentPaymentSection.tsx`; corresponding test covers selected status, dedicated action, keyboard, cancel, duplicate and retry | `/app/agendamentos`, payment section in appointment details |
| 5.2 Patient debounce | Existing deterministic 299 ms / 1 ms test retained; picker covers loading, empty, error, duplicate contacts, selection and clearing | `scheduling/hooks/usePatientSearch.ts`, `usePatientSearch.test.ts`, `PatientPicker.test.tsx`, `CreateAppointmentModal.test.tsx` | `/app/agendamentos`, new appointment |
| 5.3 Odontogram recovery | Existing ordered ownership/autosave retained; reload token participates in loaded-chart identity; retry and dirty state covered | `clinical-records/hooks/useOdontogramAutosave.ts`, editor container and corresponding suites | `/app/prontuario/$clinicalRecordId`; actual browser unload/navigation still needs human execution |
| 5.4 Appointment native validation | `noValidate`, custom required-field errors and associations | `EditAppointmentModal`, `AvailabilitySlotForm`, `ExceptionForm`; corresponding tests and `ExceptionEditModal.test.tsx` | `/app/agendamentos`, `/app/agenda`, `/app/equipe` |
| 5.5 Stock price | Empty edit sends null; empty create omits optional price and DB keeps null; explicit zero remains zero | `ProductFormModal`, inventory types; `ProductFormModal.test.tsx`; API stock DTO/schema and `stock-validation.spec.ts` | `/app/estoque` |
| 5.6 Actor/self-lockout | Controller actor forwarding retained and awaited; narrow service enforcement remains | API `admin-users.controller.spec.ts`, admin-users service suites | `/app/admin/users` |
| 5.7 Raw phone capacity | Removed 15-character truncation points; explicit raw-capacity tests alongside formatting tests | `UserIdentityFields`, settings, `InvoiceForm`; `UserIdentityFields.test.tsx`, `field-formatters.test.ts` | `/app/admin/users`, `/app/equipe`, `/app/configuracoes`, `/app/notas-fiscais`, `/app/agendamentos` |
| 5.8 Finance filters | Rejected date draft restores active controlled value on blur | `DatePickerInput`, `useFinanceFilters`; corresponding suites | `/app/financeiro` |
| 5.9 Clinical counters | Valid description target only when counter exists; threshold/status announcements; no arbitrary odontogram limit | `ClinicalSectionField`, `CharacterLimitCounter`, odontogram components and suites | `/app/prontuario/$clinicalRecordId` |
| 6 Phone storage | Canonical writes plus compatibility, no historical backfill | API `transform.helpers.ts`, phone DTOs, clinical/fiscal services; `phone-storage.spec.ts`, transformation/appointment/clinical tests | Phone forms and Patient detail routes; see J |
| 7 Fiscal routing | Ordinary request keys rejected; internal config supplies create defaults; normal updates omit provider keys | API `upsert-fiscal-profile.dto.ts`, `fiscal.service.ts`, `fiscal-validation.spec.ts`, `fiscal-invoice-lifecycle.spec.ts` | `/app/configuracoes/fiscal`; direct forbidden-payload test |
| 8 Report statuses | Incoming canonical fiscal status reuse retained, including PROCESSING | Reports container, `report-filter-chips.ts`; reports and invoice-format suites | `/app/relatorios`, `/app/notas-fiscais` |
| 9 General sweep | Repeated full source control search; inventory records every matched declaration | [Control inventory](form-control-inventory.md); 23 native forms, all `noValidate` | Route matrix below; inventory is search evidence, not browser certification |
| 10 Placeholders | Missing product/dictation prompts filled; typed controls use shared defaults or labels/helpers | Product and VoiceDictation components; source inventory | `/app/estoque`, `/app/prontuario/$clinicalRecordId`; inherited changes also cover auth, finance, fiscal, scheduling, team and settings |
| 11 Select/combobox | Existing Radix and Patient-picker patterns retained; invalid SelectTrigger styling uses shared error styling | `components/ui/select.tsx`, PatientPicker and finance/stock forms; corresponding suites | Scheduling, finance, stock, reports and filters |
| 12 Validation UX | Native forms audited; custom date/required-field errors; finance/stock field association fixes | `FormField`, DatePicker, finance helper/forms and stock forms; regression suites | All form routes below |
| 13 Autocomplete | Shared name/email/tel/password/address semantics retained; search uses off; no sensitive-data placeholders | `UserIdentityFields`, auth components, fiscal/settings forms; inventory | Auth, team/admin, settings/fiscal |
| 14 Masks | Shared helpers retained; raw phone capacity, canonical writes and display compatibility completed | `field-formatters.ts`, `money-input.ts`, date-time input, quantity input and corresponding suites | Matrix F; mobile/selection behavior requires browser QA |
| 15 Limits | DTO limits retained; removed unsupported odontogram note cap; no coverage or backend validation weakening | Clinical/invoice/finance constants, DTO tests, odontogram tests | Clinical, fiscal, finance, stock and phone forms |
| 16 Confirmations | Shared ConfirmDialog retained; payment bypass and clinic-status edit path corrected | 32 call sites, `ConfirmDialog.test.tsx`, feature suites; inventory I | Sensitive-action matrix below |
| 17 Passwords | Incoming shared frontend/backend policy retained across applicable flows | Frontend `validators/password.ts`; registration/reset/common password and admin/team suites; API password policy/DTO suites | `/acessar`, `/recuperar-senha/redefinir`, `/app/admin/users`, `/app/equipe` |
| 18 Contract alignment | Null price, payment nulls, fiscal draft, canonical phones and real limits checked; missing admin-clinic API explicit | DTO/service/schema comparisons and API coverage/integration | See G and N |
| 19 Shared infrastructure | Existing helpers extended; no second generic validation or navigation framework | See H | Cross-feature routes below |

## C. Product decisions

1. Appointment payment enum `PAYMENT_PENDING` (the user's PENDING) and `CANCELED` represent unsettled payments. `paidAmount`, `paymentDate`, `paymentMethod` are null. Transition from settlement requires confirmation; failure preserves a retry path.
2. `COMPLETED` and `CANCELED` appointments cannot be normally edited. No reopen workflow was added.
3. Fiscal draft may contain empty/null CEP and UF. The DTO normalizes draft emptiness to the existing persistence representation; simulation/issuance validates completeness before the provider call. Local output remains simulated and has no legal validity.

## D. Form audit totals

Static JSX declarations, excluding tests/test utilities: **23 forms; 222 potentially editable control declarations plus one hidden date mirror (223 total); 57 directly masked/formatted declarations; 54 selects; 16 textareas; 32 shared confirmation call sites / sensitive action groups**. There are 7 password-wrapper declarations, 29 DatePickers, 4 TimeInputs and 2 ColorPickers within these totals. Four controls become read-only according to record permissions/status. Dynamic swatches/rows count once at declaration; shared primitives are included. These totals deliberately do not pretend to be the number of rendered business fields.

The 32 confirmation call sites represent 32 action groups; some groups have activate/deactivate variants. There is no independently meaningful single runtime count of sensitive actions, because permissions, status and available data change the rendered variants. Matrix I enumerates them.

Search vocabulary included Input/input, Textarea/TextArea/textarea, Select/select, Combobox, DatePicker, TimePicker/TimeInput, MoneyInput, Controller, register/useForm, contentEditable and project wrappers. No independent React Hook Form/contentEditable implementation was found. Native file, checkbox/radio and color controls use labels/helpers rather than fake placeholder values.

## E. Placeholder changes

The takeover specifically added `Digite o nome do produto` and section-specific dictation review prompts. Comparing literal/dynamic placeholder props with HEAD, excluding indentation-only moves, gives the following complete changed-form list. The new PatientPicker is also listed because untracked files are absent from ordinary `git diff`.

| Route | Form / changed placeholder behavior |
| --- | --- |
| `/app/admin/users` | UserFormModal initial password: `Crie uma senha inicial` |
| `/recuperar-senha/redefinir` | ResetPasswordPage repeat password: `Repita a nova senha` |
| `/app/prontuario/$clinicalRecordId` | VoiceDictationCard review text: prompt includes the clinical section name |
| `/app/financeiro` | CategoryEditModal name; FixedExpenseEditModal description and money; FixedExpenseForm money; TransactionEditModal description and money; TransactionForm money |
| `/app/configuracoes/fiscal`, fiscal profile workspace in `/app/notas-fiscais` | FiscalProfileForm legal/trade name, street/number/complement/neighborhood/city and tax regime |
| `/app/notas-fiscais` | InvoiceForm customer name/email, service description, money and notes |
| `/app/estoque` | ProductFormModal product name and purchase-price prompt |
| `/direitos-do-titular/solicitar` | PrivacyRequestFormPage request type and relationship prompts |
| `/app/agendamentos` | AppointmentPaymentSection amount/method; AppointmentServiceValueSection amount; CreateAppointmentModal email; EditAppointmentModal name/email/phone/notes; new PatientPicker search prompt |

These embedded forms have no dedicated route; their parent routes and entry points are listed above and in M. The [full inventory](form-control-inventory.md) records final explicit props. DatePicker/TimeInput/password wrappers supply shared defaults. Selects with authoritative nonempty defaults display those values; prompts are never submitted as option values. Admin/team contact fields deliberately disable browser autofill when editing another person's account.

## F. Masks and payloads

| Field | Display | Canonical payload/storage | Limit and helper |
| --- | --- | --- | --- |
| Brazilian phone | `(61) 98765-4321` | 10–11 local digits; recognized +55/0055 stripped; legacy snapshots preserved if unrecognized | `normalizePhoneBR`, `formatPhoneBR`, `displayPhoneBR`; backend existing canonical helper and transforms; raw input not limited to 15 |
| WhatsApp | Same Brazilian display | Local digits in profile/consent contracts; external wa.me destination includes 55 | Existing WhatsApp validator; toll-free validation remains distinct |
| CPF/CNPJ | Standard punctuation | Digits under respective DTO contract | 11/14 digits; `formatCpfCnpjBR`, existing validators |
| CEP | `00000-000` | Eight digits, or empty draft value where allowed | `formatCepBR`; eight digits |
| UF | Two uppercase letters | Valid UF or empty fiscal draft | `formatUf`, shared UF validation |
| Money | `R$ 0,00` | Integer cents; optional purchase price null | `money-input.ts`; finance ceiling 9,999,999,999 cents; other consumers keep their authoritative caps |
| ISS percentage | Decimal comma/point input | Decimal numeric percentage, not integer truncation | `formatDecimalInput`, fiscal DTO 0–100 range |
| Stock quantity | Decimal comma, up to three fractional digits | Decimal quantity; explicit zero adjustment differs from blank | `quantity-input.ts`, stock DTO validation |
| Date/time | `dd/mm/aaaa`, time prompt | ISO date / existing wall-clock time contract | Existing date-time helpers and DatePicker/TimeInput |

Masking does not replace validation. Automated tests cover normalization, paste capacity, partial input and replacement behavior available in jsdom. Real mobile keyboards, caret/delete/select-all behavior and browser unload prompts remain human QA.

## G. Frontend/backend alignment

- Appointment payment clearing and final-state immutability are enforced by backend service rules, with frontend UX confirmation/visibility.
- Selected `patientId` is forwarded; no selection creates a new Patient. Contact equality never authorizes reuse. Existing isolation/integration tests remain intact.
- Stock purchase price round trip distinguishes null from zero. Optional edit fields use null for explicit clearing; create omission remains optional.
- Fiscal optional customer email remains optional; ISS stays decimal; draft CEP/UF differs deliberately from issuance completeness.
- Fiscal provider selection is absent from normal writable DTO and frontend request contract.
- Phone storage transforms cover user/clinic updates and clinical/fiscal snapshots as well as appointment/patient paths.
- Clinical text caps mirror DTOs: chief complaint 500, supported text sections 10,000, attachment caption 500 and filename 180. Odontogram notes have no invented 2,000-character cap.
- Finance category name 80 and description 160 follow API constants; required dates and positive integer-cent amounts remain validated.
- Admin self-lockout receives authenticated actor ID; sensitive account edits revoke sessions under existing service rules.
- Admin-clinic CRUD remains absent in backend and is not claimed aligned or operational.

## H. Shared infrastructure

Reused: `FormField`/TextInput/TextArea, InlineFeedback, ConfirmDialog, existing router blocker, date-time helpers, email/password validators, money parser, Brazilian validators, fiscal status definition.

Extended: existing `field-formatters.ts` for presentation of canonical/legacy phones; existing finance rules/constants for date requirements and linked field errors; existing backend `transform.helpers.ts` for canonical nullable/snapshot phone transformations. These are used by multiple existing consumers and were not placed in parallel generic files.

Incoming new shared password presentation was moved out of auth for common/admin/team use; old feature-only source was removed. Incoming specialized helpers remain feature-owned: Patient debounce, odontogram autosave, clinical image compression, fiscal completeness/request preparation and quantity input.

Removed duplication: separate stock deactivate/reactivate dialogs replaced by ConfirmDialog; report status labels use fiscal source of truth; duplicated password presentation/validation and phone formatting consolidated by the incoming work. No generic helper was created during takeover; additions extend existing owners.

## I. Sensitive actions / confirmation inventory

For all rows: Cancel must cause no mutation; pending confirm must prevent duplicate requests and accidental close; rejected request must remain recoverable. Shared-dialog tests cover pending/keyboard behavior, with feature tests for payload/cancel/retry paths. Human QA should repeat these behaviors under slow and failing network conditions. A confirmation's presence alone is not evidence that an unavailable backend endpoint exists.

| Route / entry | Action group | Reason / intended behavior |
| --- | --- | --- |
| `/app/admin/users` | Deactivate user; sensitive account edits/privileged creation (2 dialogs) | Warn about access/session effects and changed identity/role/clinic context |
| `/app/admin/clinics` | Delete clinic; activate/deactivate in edit (2) | Administrative impact; backend CRUD availability is a known limitation |
| `/app/equipe` | Remove/deactivate member; sensitive member edits (2) | Access and session changes |
| `/app/financeiro` | Remove category; activate/deactivate fixed expense; cancel transaction (3) | Dependencies, future generation and totals effects |
| `/app/estoque` | Deactivate product; reactivate product; delete category (3) | Preserve history, change availability, respect category dependencies |
| `/app/assinatura` | Change plan; cancel subscription (2) | Billing/proration or renewal impact; actual provider acceptance is external QA |
| `/app/prontuario/$clinicalRecordId` | Lock/cancel/restore clinical record (3), complete appointment/leave unsaved editor (2), remove image (1), discard dictation (1) | Explicit irreversible locking/completion, record cancellation/restoration, pending draft loss and permanent image removal; appointment reopening is not introduced |
| `/app/configuracoes` | Disconnect calendar (1) | Integration access/synchronization impact |
| `/app/pacientes` | Remove Patient photo (1) | Shows Patient context and removes only the saved photo; no contact matching or Patient deletion |
| `/app/notas-fiscais` | Simulate/issue workflow; cancel invoice (2) | Local legal-validity wording and cancellation reason |
| `/app/configuracoes/fiscal` | Save impactful fiscal changes (1) | Confirm configured fiscal impact; ordinary incomplete draft remains savable |
| `/app/agendamentos`, appointment detail | Clear settlement; cancel appointment; record no-show (3) | Clear exact payment fields, release slot or record terminal status |
| `/app/agenda`, also professional edit in `/app/equipe` | Remove weekly availability; delete exception (2) | Future availability changes; existing bookings remain intact |
| Appointment notification drawer | Revoke WhatsApp consent (1) | Stop allowed sends until new consent; no dedicated route, parent `/app/agendamentos` |

## J. Phone normalization

Inventory: `Clinic.phone`, `User.phone`, `Profile.phone`, `Profile.whatsappNumber`, `Appointment.patientPhone`, `ServiceInvoice.customerPhone`, `ClinicalRecord.patientPhone`, `NotificationConsent.phone`, `Patient.phone`: **eight models, nine columns**.

Consumers include forms/DTOs, profile/contact display, appointment and clinical snapshots, invoice generation, patient listing/attention/history, consent/notification destinations and administrative/team identity display. Recognizable Brazilian writes now use local digits; legacy masked values remain readable through existing compatibility and display formatting. Unrecognized clinical/fiscal snapshots are not silently truncated by the new backend snapshot helper.

No historical rows were modified or counted in production; no backfill or Prisma migration was added. Compatibility was selected because changing write normalization does not require rewriting legacy identity records. The existing 40-migration chain was tested from zero and against schema drift in disposable PostgreSQL.

Identity remains independent of phone: DTO transforms do not choose Patient IDs; explicit selection reaches the existing Patient ownership guard; no-selection uses new-patient intent. Existing integration/ownership suites were rerun. No uniqueness constraint, merge, deduplication or contact-based ID inference was added.

## K. Fiscal provider routing

Normal browser payloads, including authenticated ordinary users, cannot write `fiscalProvider` or `fiscalProviderMode`: forbidden extra keys are rejected by the validation pipe. Initial persisted defaults are supplied by backend `fiscalConfig` (`FISCAL_PROVIDER`, `FISCAL_PROVIDER_MODE`, default LOCAL). Ordinary fiscal-profile updates do not replace those columns. Changing environment defaults does not retroactively rewrite existing profile rows; changing those stored values requires privileged internal maintenance, for which no browser/API surface was added. Backend operators retain that control; this pass performs no production configuration change. Local simulation remains the implemented provider behavior.

## L. Validation record

Backend final checks passed: `typecheck`, `lint:check` (non-mutating lint), `deadcode`, `prisma:validate`, `build`; `test:cov --runInBand`: **107 suites / 2,684 tests passed**, statements **94.49%**, branches **86.43%**, functions **88.97%**, lines **94.70%**. Integration: **12 suites / 183 tests passed**. E2E: **1 suite / 26 tests passed**. Migrations: **40 from zero**, exact schema agreement and corrective replay as no-op with data intact. Jest integration/E2E emitted its configured force-exit notice; integration also emitted pg's concurrent-query deprecation warning. These warnings are not omitted from the evidence.

Frontend static/build checks passed: `typecheck`, `check:biome`, `check:unused`, `knip`, `knip:production`, `build`. Knip reports advisory configuration/test-contract tag hints; it reports no failing unused-code findings. Vite reports a large-chunk warning. Final focused appointment/billing group: **3 files / 109 tests passed**, including monthly/yearly confirmation wording and idle versus pending outside dismissal.

An isolated archived HEAD baseline passed **406 files / 5,772 tests**, with statements **96.64%**, branches **97.17%**, functions **97.25%**, lines **97.09%**. The [per-file comparison](form-coverage-comparison.md) records all 108 changed instrumented files. Coverage classification evidence remains in the [coverage policy](frontend-coverage-policy.md); neither a global pass nor an E/F classification is represented as numerical nondecrease for every touched file.

Full frontend tests/coverage passed with `bun run test:coverage --maxWorkers=2`: **417 files / 6,134 tests**, statements **96.82% (10,419/10,761)**, branches **97.23% (8,792/9,042)**, functions **97.36% (3,441/3,534)**, lines **97.32% (9,562/9,825)**. Duration: **640.22 seconds**. The coverage report command was regenerated from this run. All four aggregate metrics exceed the archived HEAD baseline. Documentation check passed **689 local links across both repositories**; both diffs pass `git diff --check`.

Ten existing touched files have at least one lower percentage: ConfirmDialog, ClinicFormModal, ImageAttachmentPanel, InvoiceForm, FiscalInvoicesPageContainer, AppointmentPaymentSection, CreateAppointmentModal, AvailabilityManager, ExceptionForm and ExceptionManager. The comparison lists exact before/after metrics. Their remaining defensive/browser branches are classified in the coverage policy; this does **not** satisfy a literal requirement that every touched-file percentage be nondecreasing. No thresholds, exclusions or ignore directives were weakened to hide this result.

Earlier aggregate attempts are not passes: an unrestricted-worker run was interrupted under contention; one intermediate run had **415 files / 6,104 tests / four failures**, and another passed its tests but failed the branch floor. The identified failures were corrected and the final complete run above supersedes them. A final Biome formatting failure in the billing test was corrected and the full check rerun successfully. The backend also had an earlier failed coverage attempt; only the successful final totals above are acceptance evidence.

## M. Human QA route matrix

Use disposable/demo data, two distinct Patients with identical contact attributes, and an account for each applicable role. For network failure checks, reject only the relevant test API request. Do not perform destructive QA on production data. `$clinicalRecordId` is the router's parameter: replace it with the prepared record's ID.

| Route | Preparation / steps | Expected result |
| --- | --- | --- |
| `/acessar` | Switch login/register; enter invalid email and weak/valid password; paste phone where requested | Shared messages, correct autocomplete, no native validation popup; ordinary registration direct |
| `/acessar/completar-perfil` | Fresh account needing completion; paste names/phone and clear optional data | Visible labels/prompts, canonical payload, recoverable API error |
| `/recuperar-senha`, `/recuperar-senha/redefinir` | Test reset token; invalid email, weak/mismatched and valid new password | Shared password policy, correct autocomplete, error recovery |
| `/app/agendamentos` | Search two same-contact Patients; type query; choose A then B, clear, create without selection | Debounce before request, distinct row IDs, exact selected Patient reuse; new intent does not reuse by contacts |
| `/app/agendamentos` | Paste +55/0055/local and DDD 55; edit name/date/time; submit with missing fields | No raw truncation; custom linked errors; final appointments cannot be normally edited |
| `/app/agendamentos` | Settled payment: select pending/canceled, primary button/Enter/dedicated action; cancel dialog; then confirm; inject failure and retry | No mutation before confirm; Cancel preserves settlement; success clears three fields; no duplicate; retry remains available |
| `/app/agenda` | Add/edit weekly availability and exception; omit times/date; remove existing entries | Visible custom errors; removal confirmation with correct scope; pending/cancel/failure behavior |
| `/app/equipe` | Create/edit professional; password/contact inputs; open availability/exceptions; change sensitive role/status | Same policies as admin; explicit impact confirmation; forbidden role controls absent |
| `/app/prontuario/$clinicalRecordId` | Load record A, edit tooth, fail save, retry without editing; switch A/B with delayed responses | Dirty/error preserved on failure; successful retry clears them; no cross-Patient chart/late write contamination |
| `/app/prontuario/$clinicalRecordId` | Fail chart load; retry; edit then navigate during debounce; reload/close tab | Explicit noneditable load error; retry loads chart; meaningful unsaved edits prompt; real browser unload prompt |
| `/app/prontuario/$clinicalRecordId` | Type clinical text below/near limit; long tooth note; review dictation; upload/delete images | No dangling description; threshold announcement only; no arbitrary tooth-note cap; section prompt; size rejection/compression and sensitive removal clear |
| `/app/notas-fiscais` | Create draft without optional email; decimal ISS; clear optional fields; double-click save; simulate/cancel | Correct nullable payload/precision; one save; local simulation wording; sensitive confirmation and recoverable errors |
| `/app/configuracoes/fiscal` | Save with empty CEP/UF; then simulate incomplete profile; fill complete profile; attempt provider keys in request | Draft saves; issuance rejected until complete; provider keys rejected; routing unchanged |
| `/app/financeiro` | Reject/clear a range boundary then blur; create/edit categories, transactions/fixed expenses with missing fields/date | Visible date equals active filter after blur; linked field error and no invalid mutation; cents/date rules consistent |
| `/app/estoque` | Create/edit product with blank/zero/nonzero purchase price and reload; invalid name/category/quantity/color; adjust blank vs zero | Null stays absent, zero stays zero; linked field errors; blank adjustment never sets zero; correct delete/deactivate/reactivate confirmations |
| `/app/admin/users` | Attempt own deactivation/role removal; update other user's sensitive data; retry failed submit | Actor-based backend rejection for self-lockout; correct session-impact wording; no duplicate action |
| `/app/admin/clinics` | Edit name/status with mocked compatible service, cancel/confirm and fail/retry | Frontend confirmation behavior testable; end-to-end persistence blocked by missing backend CRUD |
| `/app/configuracoes` | Paste phones, CPF/CNPJ/CEP; manual address edit during ViaCEP response; disconnect calendar | Correct formatting/autocomplete; no late overwrite of manual address; context-aware disconnect confirmation |
| `/app/pacientes`, `/app/pacientes/atencao`, `/app/inicio` | Canonical and masked contacts; A/B with identical attributes; open attention WhatsApp destination | Formatted contact presentation, correct stable identity; recognized BR link includes 55; foreign legacy destination preserved |
| `/app/relatorios` | Dataset containing PROCESSING invoice; switch invoice status filters and totals | Canonical label/filter includes processing; totals reflect current filters |
| `/app/assinatura` | Test-mode subscription; plan change/cancellation, slow/failing request | Factual financial impact confirmation; Cancel safe; pending duplicate prevention; recovery; provider acceptance needs test-mode QA |
| `/app/configuracoes/notificacoes` | Preferences; from appointment open notification drawer and revoke consent | Appropriate helper/disabled states; explicit consent revocation and recovery |
| `/app/admin/compliance`, `/direitos-do-titular/solicitar` | Validation failure then valid privacy request/status update | Labeled fields, meaningful prompts, errors and role restrictions |

For every masked field above also exercise typing, invalid characters, paste, backspace, Delete, select-all replacement, partial input, Android/iOS keyboard and desktop keyboard-only navigation. These are human acceptance steps, not claims of completed browser execution.

## N. Remaining acceptance boundaries

- Actual desktop/mobile browser QA, screen-reader announcements, beforeunload and throttled A/B navigation were not executed by this takeover. Automated jsdom tests are not equivalent evidence.
- Admin-clinic CRUD is an existing frontend/backend contract gap. Adding a new administrative backend feature is outside this form-hardening pass; it requires explicit product/backend scope.
- Real fiscal issuance/provider integration is not implemented by local simulation. Stripe, Calendar and messaging provider acceptance require their external test environments.
- All requested automated gates pass. However, ten touched files have a lower coverage percentage in at least one metric than archived HEAD, as detailed in L and the comparison. The strict per-file nondecrease condition is not claimed satisfied; E/F classifications document the remaining defensive/browser cases without changing instrumentation. The inventory itself does not prove every field's runtime/backend behavior.

Both repositories are ready for human QA with these explicit boundaries. The blanket statement “no known gaps remain” is withheld: backend clinic CRUD, browser/provider acceptance and strict per-file numerical coverage parity remain limitations of this delivery.

## O. Git safety

Both repositories remain on `dev/yago`. Incoming and takeover changes remain uncommitted. The index was initially empty; no staging/unstaging or history operations were necessary. The following counts were verified after validation. No commit or push. The cached diff is empty in both repositories.

| Repository | Staged | Tracked unstaged | Untracked files | Total changed paths |
| --- | ---: | ---: | ---: | ---: |
| dentalflow-web | 0 | 172 | 39 | 211 |
| dentalflow-api | 0 | 45 | 6 | 51 |

Counts use `git status --porcelain=v1 --untracked-files=all` (directories are expanded). A temporary archived HEAD was created solely for coverage comparison; no repository branch/worktree/index was replaced.
