# Final coverage gaps — 2026-09-10

Historical first-pass inventory, before the 20 continuation tests and two fixes.
Voice/settings locations and counts must be refreshed before further work.
See [the handoff](HARDENING-HANDOFF.md) for the latest validation baseline.

Source: the complete final `bun run test:coverage --maxWorkers=2` run. All 380 suites and 4967 tests passed. No new coverage exclusions were applied.

| Metric | Initial | Final |
| --- | ---: | ---: |
| Statements | 84.56% | 89.60% (8788/9808) |
| Branches | 82.08% | 86.84% (7071/8142) |
| Functions | 80.20% | 85.76% (2886/3365) |
| Lines | 85.35% | 90.40% (8123/8985) |

218 production files remain below 100% in at least one dimension. This is an exact inventory of open gaps, not a certification that all important behavior is covered.

## How to read this report

A = important test work still open; B = worthwhile additional behavior/integration tests; C candidate = inspect a defensive branch before deciding it is unreachable; D candidate = narrowly review non-behavioral wiring, without excluding it here. No E/dead-file classification was established. C1–C4 refer to the audit's critical/shared/UI/low-value coverage categories. No category automatically excuses a gap.

Files are ranked by missing branch arms, then ascending line coverage. S/B/F/L means statements/branches/functions/lines. Branch entries are `line:column bID.arm type (location)`, with one-based lines, zero-based columns and zero-based arm indexes. `(condition)` means V8 omitted an arm span (usually an implicit else); the parent condition is reported. A dash means no missing entries in that dimension. Anonymous function names are Istanbul report identifiers, not new exported APIs.

The entries identify exact unexecuted locations. Generic A/B classifications intentionally remain open where individual reachability has not been established; they are not invented explanations for excluding executable production behavior.

## 1. src/features/clinical-records/components/VoiceDictationCard.tsx

S/B/F/L: 89.12% / 77.68% / 92.85% / 91.81%. Missing branch arms: 52.

A / C1 — maximum-duration auto-stop, audio conversion failures, microphone absence, late processing/timer paths and optional suggestion values need further tests. Some reset/nullable defenses may be unreachable through enabled UI; no blanket exclusion is justified.

- Lines: 109-110, 115-116, 323-324, 327-328, 331-332, 384-385, 447-449, 460-461, 554-558, 642, 653-654, 720, 729, 914.
- Branches: `82:2 b0.1 if (condition)`; `108:6 b2.0 if (arm)`; `114:6 b3.0 if (arm)`; `322:4 b15.0 if (arm)`; `326:4 b16.0 if (arm)`; `330:4 b17.0 if (arm)`; `363:6 b18.0 if (arm)`; `376:6 b19.0 if (arm)`; `379:8 b20.0 if (arm)`; `383:8 b22.0 if (arm)`; `401:8 b24.1 if (condition)`; `419:8 b27.1 if (condition)`; `432:10 b29.0 if (arm)`; `448:10 b31.0 if (arm)`; `448:10 b31.1 if (condition)`; `448:14 b32.0 binary-expr (arm)`; `448:39 b32.1 binary-expr (arm)`; `459:8 b33.0 if (arm)`; `495:8 b37.0 if (arm)`; `513:4 b39.0 if (arm)`; `526:4 b41.0 if (arm)`; `529:6 b42.0 if (arm)`; `550:4 b44.0 if (arm)`; `553:4 b46.0 if (arm)`; `581:49 b49.1 binary-expr (arm)`; `581:66 b49.2 binary-expr (arm)`; `587:8 b50.1 if (condition)`; `600:8 b53.0 if (arm)`; `638:8 b55.0 if (arm)`; `650:6 b56.1 if (condition)`; `653:19 b57.1 if (arm)`; `651:46 b58.1 binary-expr (arm)`; `653:19 b59.0 if (arm)`; `653:19 b59.1 if (condition)`; `670:61 b61.1 binary-expr (arm)`; `678:75 b63.1 binary-expr (arm)`; `690:4 b67.1 if (condition)`; `720:11 b69.1 if (arm)`; `729:11 b70.1 if (arm)`; `743:55 b72.1 binary-expr (arm)`; `744:49 b73.1 binary-expr (arm)`; `755:41 b74.1 binary-expr (arm)`; `911:20 b88.1 binary-expr (arm)`; `917:44 b89.0 cond-expr (arm)`; `917:58 b89.1 cond-expr (arm)`; `928:38 b90.1 binary-expr (arm)`; `928:61 b90.2 binary-expr (arm)`; `978:77 b95.1 binary-expr (arm)`; `1044:62 b100.1 binary-expr (arm)`; `1110:90 b104.1 binary-expr (arm)`; `1214:31 b108.1 binary-expr (arm)`; `1234:42 b110.1 binary-expr (arm)`.
- Functions: `(anonymous_5)@120`; `(anonymous_19)@446`; `(anonymous_44)@914`; `(anonymous_45)@914`.

## 2. src/features/settings/containers/SettingsPageContainer.tsx

S/B/F/L: 86.98% / 77.50% / 82.05% / 87.87%. Missing branch arms: 36.

A / C1–C2 — debounced postal-code lookup success/failure, preserving existing address values, form callbacks and validation presentation remain incomplete.

- Lines: 124, 177-182, 189-190, 192, 195, 198, 292, 336, 351, 361.
- Branches: `123:2 b3.0 if (arm)`; `123:27 b4.1 binary-expr (arm)`; `162:32 b12.1 binary-expr (arm)`; `163:23 b13.0 cond-expr (arm)`; `169:28 b19.0 cond-expr (arm)`; `176:4 b20.1 if (condition)`; `184:24 b21.0 binary-expr (arm)`; `184:42 b21.1 binary-expr (arm)`; `185:16 b22.0 binary-expr (arm)`; `185:32 b22.1 binary-expr (arm)`; `186:17 b23.0 binary-expr (arm)`; `186:31 b23.1 binary-expr (arm)`; `189:8 b24.0 if (arm)`; `191:15 b24.1 if (arm)`; `218:4 b27.1 if (condition)`; `219:4 b28.1 if (condition)`; `220:4 b29.0 if (arm)`; `221:4 b30.0 if (arm)`; `222:4 b31.0 if (arm)`; `223:4 b32.0 if (arm)`; `224:4 b33.0 if (arm)`; `225:4 b34.0 if (arm)`; `226:4 b35.0 if (arm)`; `295:47 b41.0 cond-expr (arm)`; `393:18 b45.1 binary-expr (arm)`; `401:29 b46.1 binary-expr (arm)`; `416:73 b47.1 binary-expr (arm)`; `420:72 b48.1 binary-expr (arm)`; `561:61 b59.1 binary-expr (arm)`; `629:8 b67.0 cond-expr (arm)`; `634:6 b69.0 cond-expr (arm)`; `637:6 b70.0 cond-expr (arm)`; `673:10 b73.1 cond-expr (arm)`; `666:43 b77.1 binary-expr (arm)`; `667:12 b77.2 binary-expr (arm)`; `670:12 b78.2 binary-expr (arm)`.
- Functions: `(anonymous_6)@177`; `(anonymous_7)@182`; `(anonymous_8)@198`; `(anonymous_15)@292`; `(anonymous_17)@336`; `(anonymous_18)@351`; `(anonymous_19)@361`.

## 3. src/features/patients/containers/PatientsPageContainer.tsx

S/B/F/L: 67.30% / 71.07% / 61.53% / 68.75%. Missing branch arms: 35.

A / C1 — patient-detail appointment content, keyboard row activation, avatar mutation feedback and drawer callbacks remain incomplete.

- Lines: 97, 232-234, 240, 245, 260, 414, 561, 682, 684-687, 763.
- Branches: `102:13 b3.0 binary-expr (arm)`; `102:35 b3.1 binary-expr (arm)`; `104:11 b4.0 binary-expr (arm)`; `105:12 b4.1 binary-expr (arm)`; `114:11 b5.0 binary-expr (arm)`; `115:12 b5.1 binary-expr (arm)`; `157:8 b7.1 cond-expr (arm)`; `170:71 b8.1 cond-expr (arm)`; `171:87 b9.1 cond-expr (arm)`; `179:14 b10.1 cond-expr (arm)`; `188:50 b12.0 cond-expr (arm)`; `235:24 b18.0 cond-expr (arm)`; `235:45 b18.1 cond-expr (arm)`; `236:30 b19.0 cond-expr (arm)`; `236:64 b19.1 cond-expr (arm)`; `245:69 b20.0 binary-expr (arm)`; `245:80 b20.1 binary-expr (arm)`; `310:88 b26.1 cond-expr (arm)`; `314:75 b27.1 cond-expr (arm)`; `322:47 b28.2 binary-expr (arm)`; `322:71 b28.3 binary-expr (arm)`; `428:18 b37.0 cond-expr (arm)`; `431:29 b38.0 binary-expr (arm)`; `431:51 b38.1 binary-expr (arm)`; `616:69 b45.1 cond-expr (arm)`; `621:24 b46.1 cond-expr (arm)`; `664:32 b49.1 cond-expr (arm)`; `669:32 b50.1 cond-expr (arm)`; `684:26 b51.0 if (arm)`; `684:26 b51.1 if (condition)`; `685:26 b52.0 if (arm)`; `685:26 b52.1 if (condition)`; `685:30 b53.0 binary-expr (arm)`; `685:55 b53.1 binary-expr (arm)`; `712:28 b54.1 cond-expr (arm)`.
- Functions: `(anonymous_0)@52`; `AppointmentRow@96`; `(anonymous_9)@231`; `(anonymous_10)@245`; `(anonymous_11)@260`; `(anonymous_14)@414`; `(anonymous_18)@561`; `(anonymous_23)@682`; `(anonymous_24)@683`; `(anonymous_25)@763`.

## 4. src/features/marketing/components/RoleHeroMockup.tsx

S/B/F/L: 85.00% / 67.00% / 94.11% / 87.17%. Missing branch arms: 33.

B / C3 — marketing role/demo presentation and animation alternatives remain incompletely exercised; this is not an authorization guard.

- Lines: 44, 46, 103-105.
- Branches: `39:2 b3.1 if (condition)`; `50:17 b4.0 cond-expr (arm)`; `50:51 b4.1 cond-expr (arm)`; `58:19 b5.0 cond-expr (arm)`; `58:53 b5.1 cond-expr (arm)`; `65:23 b6.0 cond-expr (arm)`; `65:42 b6.1 cond-expr (arm)`; `71:67 b7.0 cond-expr (arm)`; `71:82 b7.1 cond-expr (arm)`; `79:21 b8.0 cond-expr (arm)`; `79:55 b8.1 cond-expr (arm)`; `84:62 b9.0 cond-expr (arm)`; `84:81 b9.1 cond-expr (arm)`; `96:21 b10.0 cond-expr (arm)`; `96:40 b10.1 cond-expr (arm)`; `104:12 b11.0 if (arm)`; `104:12 b11.1 if (condition)`; `110:27 b12.0 cond-expr (arm)`; `110:61 b12.1 cond-expr (arm)`; `116:29 b13.0 cond-expr (arm)`; `116:45 b13.1 cond-expr (arm)`; `120:58 b14.0 cond-expr (arm)`; `120:76 b14.1 cond-expr (arm)`; `126:29 b15.0 cond-expr (arm)`; `126:48 b15.1 cond-expr (arm)`; `142:14 b16.0 cond-expr (arm)`; `143:14 b16.1 cond-expr (arm)`; `149:21 b17.0 cond-expr (arm)`; `149:37 b17.1 cond-expr (arm)`; `152:58 b18.0 cond-expr (arm)`; `152:76 b18.1 cond-expr (arm)`; `154:57 b19.0 cond-expr (arm)`; `154:76 b19.1 cond-expr (arm)`.
- Functions: `(anonymous_1)@102`.

## 5. src/features/fiscal/containers/FiscalInvoicesPageContainer.tsx

S/B/F/L: 70.33% / 71.84% / 58.82% / 76.19%. Missing branch arms: 29.

A / C1 — invoice-form/action callbacks and conditional detail rendering need further integration scenarios.

- Lines: 215-221, 228-230, 235-236, 240, 264, 422-423, 462-464, 484-485, 503, 506, 509-510.
- Branches: `112:46 b0.1 binary-expr (arm)`; `116:72 b3.1 cond-expr (arm)`; `153:10 b5.1 cond-expr (arm)`; `164:10 b15.0 cond-expr (arm)`; `166:30 b16.0 binary-expr (arm)`; `166:58 b16.1 binary-expr (arm)`; `167:27 b17.0 binary-expr (arm)`; `167:52 b17.1 binary-expr (arm)`; `168:27 b18.0 binary-expr (arm)`; `168:52 b18.1 binary-expr (arm)`; `170:25 b19.0 binary-expr (arm)`; `170:48 b19.1 binary-expr (arm)`; `172:29 b20.0 binary-expr (arm)`; `172:56 b20.1 binary-expr (arm)`; `173:39 b21.0 cond-expr (arm)`; `173:65 b21.1 cond-expr (arm)`; `175:19 b22.0 binary-expr (arm)`; `175:36 b22.1 binary-expr (arm)`; `218:6 b24.0 if (arm)`; `218:6 b24.1 if (condition)`; `236:6 b25.0 if (arm)`; `236:6 b25.1 if (condition)`; `245:4 b26.0 if (arm)`; `270:4 b27.0 if (arm)`; `423:22 b42.0 if (arm)`; `423:22 b42.1 if (condition)`; `445:20 b45.1 binary-expr (arm)`; `463:22 b46.0 if (arm)`; `463:22 b46.1 if (condition)`.
- Functions: `submitInvoice@214`; `submitProfile@227`; `(anonymous_15)@421`; `(anonymous_16)@461`; `(anonymous_18)@484`; `(anonymous_19)@485`; `(anonymous_21)@502`; `(anonymous_22)@503`; `(anonymous_23)@505`; `(anonymous_24)@506`; `(anonymous_25)@509`; `(anonymous_26)@509`; `(anonymous_27)@510`; `(anonymous_28)@510`.

## 6. src/features/admin/containers/AdminFinancePageContainer.tsx

S/B/F/L: 73.07% / 67.85% / 80.55% / 73.91%. Missing branch arms: 27.

A / C1 — chart tooltip/axis formatter callbacks and remaining nullable billing presentation paths are not all exercised; event filtering/pagination are now tested.

- Lines: 166, 170, 179, 183, 258, 260-264, 266, 599.
- Branches: `258:2 b1.0 if (arm)`; `258:2 b1.1 if (condition)`; `258:6 b2.0 binary-expr (arm)`; `258:17 b2.1 binary-expr (arm)`; `260:27 b3.0 cond-expr (arm)`; `260:39 b3.1 cond-expr (arm)`; `261:31 b4.0 cond-expr (arm)`; `261:58 b4.1 cond-expr (arm)`; `262:30 b5.0 cond-expr (arm)`; `262:42 b5.1 cond-expr (arm)`; `263:30 b6.0 cond-expr (arm)`; `263:42 b6.1 cond-expr (arm)`; `264:30 b7.0 cond-expr (arm)`; `264:42 b7.1 cond-expr (arm)`; `282:33 b8.0 binary-expr (arm)`; `282:54 b8.1 binary-expr (arm)`; `308:29 b9.0 cond-expr (arm)`; `309:29 b10.0 cond-expr (arm)`; `310:28 b11.0 cond-expr (arm)`; `343:8 b13.1 cond-expr (arm)`; `361:41 b14.0 cond-expr (arm)`; `361:68 b14.1 cond-expr (arm)`; `579:61 b26.0 cond-expr (arm)`; `639:58 b29.1 binary-expr (arm)`; `655:73 b30.1 binary-expr (arm)`; `726:69 b32.1 cond-expr (arm)`; `727:51 b33.1 cond-expr (arm)`.
- Functions: `(anonymous_1)@166`; `(anonymous_2)@170`; `(anonymous_3)@179`; `(anonymous_4)@183`; `AdminChartTooltip@257`; `(anonymous_15)@312`; `(anonymous_26)@599`.

## 7. src/features/reports/containers/ReportsPageContainer.tsx

S/B/F/L: 74.46% / 69.66% / 54.90% / 79.45%. Missing branch arms: 27.

A / C1 — report/chart formatter callbacks, filter interactions and conditional/null data presentation remain incomplete.

- Lines: 168, 199, 202, 205, 258, 286, 321, 330, 337, 344, 464, 503, 513, 521, 528.
- Branches: `69:4 b2.0 if (arm)`; `81:48 b5.1 binary-expr (arm)`; `95:93 b8.1 binary-expr (arm)`; `102:65 b9.1 cond-expr (arm)`; `256:51 b21.1 binary-expr (arm)`; `258:63 b22.0 binary-expr (arm)`; `258:68 b22.1 binary-expr (arm)`; `268:42 b24.0 cond-expr (arm)`; `288:44 b26.0 cond-expr (arm)`; `288:57 b26.1 cond-expr (arm)`; `329:48 b27.1 binary-expr (arm)`; `330:80 b28.0 binary-expr (arm)`; `330:85 b28.1 binary-expr (arm)`; `336:46 b29.1 binary-expr (arm)`; `337:78 b30.0 binary-expr (arm)`; `337:83 b30.1 binary-expr (arm)`; `344:71 b32.0 cond-expr (arm)`; `344:83 b32.1 cond-expr (arm)`; `472:70 b38.0 cond-expr (arm)`; `511:51 b39.1 binary-expr (arm)`; `513:63 b40.0 binary-expr (arm)`; `513:68 b40.1 binary-expr (arm)`; `520:49 b41.1 binary-expr (arm)`; `521:81 b42.0 binary-expr (arm)`; `521:86 b42.1 binary-expr (arm)`; `528:74 b44.0 cond-expr (arm)`; `528:86 b44.1 cond-expr (arm)`.
- Functions: `(anonymous_13)@168`; `clearApptFilters@198`; `clearInvFilters@201`; `clearInvoiceFilters@204`; `(anonymous_24)@258`; `(anonymous_25)@258`; `(anonymous_28)@286`; `(anonymous_29)@286`; `(anonymous_30)@321`; `(anonymous_32)@330`; `(anonymous_33)@330`; `(anonymous_34)@337`; `(anonymous_35)@337`; `(anonymous_36)@344`; `(anonymous_37)@344`; `(anonymous_39)@464`; `(anonymous_43)@503`; `(anonymous_45)@513`; `(anonymous_46)@513`; `(anonymous_47)@521`; `(anonymous_48)@521`; `(anonymous_49)@528`; `(anonymous_50)@528`.

## 8. src/features/scheduling/components/appointments/EditAppointmentModal.tsx

S/B/F/L: 72.89% / 76.92% / 60.00% / 73.46%. Missing branch arms: 21.

A / C1 — edit-form callbacks, conditional appointment fields and asynchronous modal lifecycle paths remain incomplete.

- Lines: 103-105, 116-119, 121, 138, 165, 170, 173, 178, 184, 189, 229, 286, 297, 316-318, 320-322, 333, 364.
- Branches: `112:4 b2.1 if (condition)`; `117:4 b3.0 if (arm)`; `120:11 b3.1 if (arm)`; `135:35 b6.1 binary-expr (arm)`; `164:4 b13.0 if (arm)`; `164:30 b14.1 binary-expr (arm)`; `172:4 b15.0 if (arm)`; `180:4 b16.0 if (arm)`; `182:6 b17.1 binary-expr (arm)`; `200:10 b18.1 cond-expr (arm)`; `202:23 b19.0 binary-expr (arm)`; `202:41 b19.1 binary-expr (arm)`; `204:26 b20.0 binary-expr (arm)`; `204:54 b20.1 binary-expr (arm)`; `206:19 b21.0 binary-expr (arm)`; `206:40 b21.1 binary-expr (arm)`; `212:59 b22.1 cond-expr (arm)`; `220:58 b23.1 cond-expr (arm)`; `229:62 b24.0 binary-expr (arm)`; `229:71 b24.1 binary-expr (arm)`; `249:64 b26.1 binary-expr (arm)`.
- Functions: `(anonymous_8)@102`; `(anonymous_12)@116`; `(anonymous_13)@119`; `(anonymous_14)@121`; `(anonymous_16)@138`; `(anonymous_22)@229`; `(anonymous_24)@286`; `(anonymous_25)@297`; `(anonymous_26)@315`; `(anonymous_27)@320`; `(anonymous_28)@321`; `(anonymous_29)@322`; `(anonymous_30)@333`; `(anonymous_33)@364`.

## 9. src/features/marketing/components/AnimatedImpactSection.tsx

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%. Missing branch arms: 20.

B / C3 — untested browser-visible animation/interaction behavior; not a static configuration file and not excluded.

- Lines: 29, 88-89, 91-92, 98, 101, 103-104, 106-109, 112-113, 115-117, 119-121, 124-125, 128, 132-133, 135, 137, 168, 170, 201.
- Branches: `88:2 b0.0 if (arm)`; `88:2 b0.1 if (condition)`; `104:4 b1.0 if (arm)`; `104:4 b1.1 if (condition)`; `107:4 b2.0 if (arm)`; `107:4 b2.1 if (condition)`; `121:6 b3.0 if (arm)`; `121:6 b3.1 if (condition)`; `142:20 b4.0 cond-expr (arm)`; `142:50 b4.1 cond-expr (arm)`; `144:44 b5.0 cond-expr (arm)`; `144:79 b5.1 cond-expr (arm)`; `152:9 b6.0 binary-expr (arm)`; `153:10 b6.1 binary-expr (arm)`; `182:24 b7.0 cond-expr (arm)`; `182:54 b7.1 cond-expr (arm)`; `209:24 b8.0 cond-expr (arm)`; `209:40 b8.1 cond-expr (arm)`; `211:48 b9.0 cond-expr (arm)`; `211:58 b9.1 cond-expr (arm)`.
- Functions: `formatValue@87`; `useCountUp@100`; `(anonymous_2)@103`; `(anonymous_3)@115`; `(anonymous_4)@125`; `ImpactCard@131`; `AnimatedImpactSection@167`; `(anonymous_7)@201`.

## 10. src/features/scheduling/components/appointments/CreateAppointmentModal.tsx

S/B/F/L: 69.49% / 72.97% / 58.82% / 71.68%. Missing branch arms: 20.

A / C1 — creation-form callbacks, conditional appointment fields and asynchronous modal lifecycle paths remain incomplete.

- Lines: 109-110, 113, 134-136, 146-149, 151, 169, 191, 194, 199, 202, 207, 213, 218, 255, 266, 307-311, 338-341, 354, 454.
- Branches: `102:4 b0.0 if (arm)`; `103:4 b1.1 if (condition)`; `141:4 b3.0 if (arm)`; `142:4 b4.1 if (condition)`; `147:4 b5.0 if (arm)`; `150:11 b5.1 if (arm)`; `190:4 b9.0 if (arm)`; `193:4 b11.0 if (arm)`; `201:4 b12.0 if (arm)`; `209:4 b13.0 if (arm)`; `211:6 b14.1 binary-expr (arm)`; `257:44 b20.0 cond-expr (arm)`; `257:58 b20.1 cond-expr (arm)`; `266:53 b21.0 binary-expr (arm)`; `266:62 b21.1 binary-expr (arm)`; `304:51 b22.1 binary-expr (arm)`; `304:72 b22.2 binary-expr (arm)`; `316:53 b23.0 cond-expr (arm)`; `333:76 b24.2 binary-expr (arm)`; `353:23 b26.0 cond-expr (arm)`.
- Functions: `(anonymous_2)@112`; `(anonymous_3)@113`; `(anonymous_6)@124`; `(anonymous_8)@133`; `(anonymous_10)@146`; `(anonymous_12)@169`; `(anonymous_19)@266`; `(anonymous_20)@306`; `(anonymous_22)@338`; `(anonymous_23)@339`; `(anonymous_24)@340`; `(anonymous_25)@341`; `(anonymous_26)@354`; `(anonymous_33)@454`.

## 11. src/features/inventory/components/ProductFormModal.tsx

S/B/F/L: 71.42% / 73.97% / 50.00% / 72.22%. Missing branch arms: 19.

A / C1–C2 — product form callbacks, optional values and validation/disabled presentation need additional scenarios.

- Lines: 107-108, 111-112, 166, 169, 178, 267, 281, 312, 324, 331, 349, 367, 376.
- Branches: `60:73 b0.1 cond-expr (arm)`; `62:34 b1.1 binary-expr (arm)`; `64:68 b2.1 cond-expr (arm)`; `65:40 b3.1 binary-expr (arm)`; `66:28 b4.1 binary-expr (arm)`; `98:4 b5.0 if (arm)`; `106:4 b7.0 if (arm)`; `110:4 b8.0 if (arm)`; `120:10 b10.0 cond-expr (arm)`; `119:52 b11.2 binary-expr (arm)`; `140:44 b17.1 binary-expr (arm)`; `141:39 b18.1 binary-expr (arm)`; `142:50 b19.1 binary-expr (arm)`; `143:38 b20.1 binary-expr (arm)`; `167:12 b25.0 cond-expr (arm)`; `168:12 b25.1 cond-expr (arm)`; `178:55 b27.0 binary-expr (arm)`; `178:66 b27.1 binary-expr (arm)`; `219:26 b30.1 binary-expr (arm)`.
- Functions: `(anonymous_6)@178`; `(anonymous_10)@267`; `(anonymous_11)@281`; `(anonymous_12)@312`; `(anonymous_13)@324`; `(anonymous_14)@331`; `(anonymous_15)@349`; `(anonymous_16)@367`; `(anonymous_17)@376`.

## 12. src/features/patients/containers/PatientsAttentionContainer.tsx

S/B/F/L: 73.91% / 81.00% / 75.00% / 74.41%. Missing branch arms: 19.

A / C1 — remaining patient attention actions, conditional values and list interactions need further integration tests.

- Lines: 149, 499-500, 613, 615-618, 681-682, 709.
- Branches: `149:64 b3.0 binary-expr (arm)`; `149:73 b3.1 binary-expr (arm)`; `414:54 b24.1 cond-expr (arm)`; `420:62 b25.1 cond-expr (arm)`; `426:57 b26.1 cond-expr (arm)`; `432:72 b27.1 cond-expr (arm)`; `531:157 b32.0 cond-expr (arm)`; `542:64 b34.1 cond-expr (arm)`; `547:24 b35.1 cond-expr (arm)`; `595:32 b37.1 cond-expr (arm)`; `600:32 b38.1 cond-expr (arm)`; `615:26 b39.0 if (arm)`; `615:26 b39.1 if (condition)`; `616:26 b40.0 if (arm)`; `616:26 b40.1 if (condition)`; `616:30 b41.0 binary-expr (arm)`; `616:51 b41.1 binary-expr (arm)`; `636:30 b42.1 binary-expr (arm)`; `654:28 b43.1 cond-expr (arm)`.
- Functions: `(anonymous_5)@149`; `(anonymous_15)@498`; `(anonymous_19)@613`; `(anonymous_20)@614`; `(anonymous_22)@680`; `(anonymous_23)@709`.

## 13. src/features/scheduling/components/calendar/WeekCalendar.tsx

S/B/F/L: 98.03% / 64.81% / 100.00% / 100.00%. Missing branch arms: 19.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `104:4 b0.0 if (arm)`; `184:31 b2.1 binary-expr (arm)`; `184:54 b2.2 binary-expr (arm)`; `186:54 b4.1 binary-expr (arm)`; `193:28 b5.0 cond-expr (arm)`; `192:33 b6.1 binary-expr (arm)`; `195:30 b7.0 cond-expr (arm)`; `207:28 b9.0 cond-expr (arm)`; `206:33 b10.1 binary-expr (arm)`; `209:30 b11.0 cond-expr (arm)`; `222:44 b15.0 cond-expr (arm)`; `225:53 b16.1 binary-expr (arm)`; `226:22 b16.2 binary-expr (arm)`; `282:30 b19.0 cond-expr (arm)`; `281:35 b20.1 binary-expr (arm)`; `284:32 b21.0 cond-expr (arm)`; `298:36 b22.1 cond-expr (arm)`; `304:36 b23.1 cond-expr (arm)`; `323:77 b24.1 binary-expr (arm)`.
- Functions: —.

## 14. src/features/marketing/components/landing/DentalArchScene.tsx

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%. Missing branch arms: 18.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 8, 16-21, 24-25, 30-32, 37, 44, 54-58, 60-64, 66, 68-77, 109-114, 118-119, 130, 132-133, 135, 137-140, 143-144, 147, 164-166, 169-171, 174-175, 194-198, 201-202, 204-205, 209-211, 215-217, 220-225, 228, 245, 253, 296, 308.
- Branches: `69:34 b0.0 cond-expr (arm)`; `69:40 b0.1 cond-expr (arm)`; `71:11 b1.0 binary-expr (arm)`; `71:26 b1.1 binary-expr (arm)`; `72:42 b2.0 binary-expr (arm)`; `72:65 b2.1 binary-expr (arm)`; `84:28 b3.0 cond-expr (arm)`; `84:40 b3.1 cond-expr (arm)`; `84:54 b4.0 cond-expr (arm)`; `84:65 b4.1 cond-expr (arm)`; `135:33 b5.0 cond-expr (arm)`; `135:37 b5.1 cond-expr (arm)`; `138:4 b6.0 if (arm)`; `138:4 b6.1 if (condition)`; `196:22 b7.0 binary-expr (arm)`; `196:33 b7.1 binary-expr (arm)`; `220:36 b8.0 cond-expr (arm)`; `220:43 b8.1 cond-expr (arm)`.
- Functions: `archPoint@43`; `(anonymous_1)@54`; `(anonymous_2)@56`; `(anonymous_3)@68`; `Tooth@108`; `(anonymous_5)@118`; `(anonymous_6)@130`; `(anonymous_7)@132`; `(anonymous_8)@163`; `(anonymous_9)@168`; `(anonymous_10)@173`; `ArchContents@193`; `(anonymous_12)@205`; `(anonymous_13)@209`; `(anonymous_14)@210`; `(anonymous_15)@215`; `(anonymous_16)@245`; `(anonymous_17)@253`; `DentalArchScene@295`.

## 15. src/features/dashboard/components/TodayAppointmentsChart.tsx

S/B/F/L: 75.47% / 76.62% / 64.70% / 77.27%. Missing branch arms: 18.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 53-56, 79-80, 165-166, 183-184.
- Branches: `53:2 b2.0 if (arm)`; `53:2 b2.1 if (condition)`; `53:6 b3.0 binary-expr (arm)`; `53:17 b3.1 binary-expr (arm)`; `63:39 b4.0 cond-expr (arm)`; `63:52 b4.1 cond-expr (arm)`; `72:9 b5.0 default-arg (arm)`; `73:9 b6.0 default-arg (arm)`; `74:18 b7.0 default-arg (arm)`; `75:18 b8.0 default-arg (arm)`; `76:17 b9.0 default-arg (arm)`; `77:15 b10.0 default-arg (arm)`; `177:55 b15.1 cond-expr (arm)`; `183:30 b17.0 cond-expr (arm)`; `184:30 b18.0 cond-expr (arm)`; `247:20 b29.0 if (arm)`; `253:20 b30.1 if (condition)`; `259:20 b31.0 if (arm)`.
- Functions: `CustomTooltip@52`; `ActiveSector@70`; `(anonymous_7)@165`; `(anonymous_8)@166`; `(anonymous_9)@183`; `(anonymous_10)@184`.

## 16. src/features/clinical-records/containers/ClinicalRecordEditorContainer.tsx

S/B/F/L: 88.07% / 84.74% / 77.50% / 92.06%. Missing branch arms: 18.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 294, 326-327, 349, 508, 550, 574, 624, 642, 659.
- Branches: `146:8 b4.0 if (arm)`; `152:8 b6.1 if (condition)`; `293:6 b20.7 switch (arm)`; `301:4 b22.0 if (arm)`; `311:4 b23.0 if (arm)`; `318:4 b25.1 if (condition)`; `322:4 b26.0 if (arm)`; `325:4 b27.0 if (arm)`; `337:4 b28.0 if (arm)`; `340:6 b29.1 if (condition)`; `347:8 b30.0 if (arm)`; `362:4 b31.0 if (arm)`; `376:4 b32.1 if (condition)`; `383:4 b33.0 if (arm)`; `397:34 b37.1 binary-expr (arm)`; `404:64 b39.0 cond-expr (arm)`; `404:122 b40.0 cond-expr (arm)`; `666:62 b46.1 binary-expr (arm)`.
- Functions: `(anonymous_3)@148`; `(anonymous_21)@326`; `(anonymous_24)@348`; `(anonymous_32)@508`; `(anonymous_34)@550`; `(anonymous_35)@574`; `(anonymous_36)@624`; `(anonymous_37)@642`; `(anonymous_38)@659`.

## 17. src/components/layout/AppShell.tsx

S/B/F/L: 97.84% / 81.05% / 96.96% / 97.59%. Missing branch arms: 18.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: 179, 195.
- Branches: `177:18 b2.0 cond-expr (arm)`; `195:33 b3.0 cond-expr (arm)`; `195:42 b3.1 cond-expr (arm)`; `198:51 b4.1 cond-expr (arm)`; `199:41 b5.1 cond-expr (arm)`; `270:88 b23.1 cond-expr (arm)`; `270:82 b24.1 binary-expr (arm)`; `327:38 b27.0 cond-expr (arm)`; `335:38 b28.0 cond-expr (arm)`; `351:53 b30.0 cond-expr (arm)`; `354:42 b31.1 binary-expr (arm)`; `380:43 b33.0 cond-expr (arm)`; `383:32 b34.1 binary-expr (arm)`; `464:45 b39.0 cond-expr (arm)`; `468:28 b40.0 cond-expr (arm)`; `494:53 b41.1 cond-expr (arm)`; `545:16 b43.1 cond-expr (arm)`; `544:61 b44.0 cond-expr (arm)`.
- Functions: `cycleTheme@194`.

## 18. src/features/inventory/components/CategoryManagerModal.tsx

S/B/F/L: 80.64% / 71.66% / 82.60% / 82.02%. Missing branch arms: 17.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 77-81, 104-105, 109-110, 135, 168, 179, 242, 391, 450, 453.
- Branches: `76:4 b1.0 if (arm)`; `103:4 b2.0 if (arm)`; `108:4 b3.0 if (arm)`; `137:12 b7.0 cond-expr (arm)`; `138:12 b7.1 cond-expr (arm)`; `156:4 b8.0 if (arm)`; `167:6 b9.0 if (arm)`; `179:57 b10.0 binary-expr (arm)`; `179:68 b10.1 binary-expr (arm)`; `220:32 b12.1 binary-expr (arm)`; `332:69 b21.1 cond-expr (arm)`; `391:68 b22.0 binary-expr (arm)`; `391:79 b22.1 binary-expr (arm)`; `445:2 b27.1 if (condition)`; `446:4 b28.1 if (condition)`; `450:11 b29.0 binary-expr (arm)`; `450:28 b29.1 binary-expr (arm)`.
- Functions: `(anonymous_9)@179`; `(anonymous_12)@242`; `(anonymous_13)@242`; `(anonymous_21)@391`.

## 19. src/features/inventory/components/InventoryProductCard.tsx

S/B/F/L: 100.00% / 70.17% / 100.00% / 100.00%. Missing branch arms: 17.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `69:8 b5.1 binary-expr (arm)`; `70:132 b6.0 cond-expr (arm)`; `70:234 b6.1 cond-expr (arm)`; `74:14 b7.0 cond-expr (arm)`; `75:14 b7.1 cond-expr (arm)`; `81:8 b8.1 binary-expr (arm)`; `82:134 b9.0 cond-expr (arm)`; `82:236 b9.1 cond-expr (arm)`; `85:42 b10.0 cond-expr (arm)`; `85:63 b10.1 cond-expr (arm)`; `94:76 b11.0 cond-expr (arm)`; `94:138 b12.0 cond-expr (arm)`; `105:14 b13.1 cond-expr (arm)`; `112:76 b14.0 cond-expr (arm)`; `112:143 b15.0 cond-expr (arm)`; `114:21 b16.0 cond-expr (arm)`; `128:10 b18.1 binary-expr (arm)`.
- Functions: —.

## 20. src/features/finance/components/ExpenseClassifyAction.tsx

S/B/F/L: 47.61% / 46.42% / 16.66% / 47.61%. Missing branch arms: 15.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 11, 13, 19, 86-87, 92, 101, 103, 127, 137, 152.
- Branches: `14:8 b0.0 cond-expr (arm)`; `15:8 b0.1 cond-expr (arm)`; `16:10 b1.0 cond-expr (arm)`; `17:10 b1.1 cond-expr (arm)`; `85:2 b6.0 if (arm)`; `86:4 b7.0 if (arm)`; `86:4 b7.1 if (condition)`; `86:8 b8.0 binary-expr (arm)`; `86:40 b8.1 binary-expr (arm)`; `115:13 b9.0 binary-expr (arm)`; `115:44 b9.1 binary-expr (arm)`; `118:9 b10.0 binary-expr (arm)`; `119:10 b10.1 binary-expr (arm)`; `129:26 b11.0 cond-expr (arm)`; `129:92 b11.1 cond-expr (arm)`.
- Functions: `ConfidenceBadge@10`; `(anonymous_2)@92`; `(anonymous_3)@127`; `(anonymous_4)@137`; `(anonymous_5)@152`.

## 21. src/features/notifications/pages/NotificationSettingsPage.tsx

S/B/F/L: 74.19% / 75.80% / 71.42% / 74.19%. Missing branch arms: 15.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 64-66, 71-73, 75, 222.
- Branches: `55:46 b3.1 cond-expr (arm)`; `60:12 b4.1 cond-expr (arm)`; `58:14 b5.0 cond-expr (arm)`; `64:44 b6.0 cond-expr (arm)`; `64:58 b6.1 cond-expr (arm)`; `130:24 b13.0 cond-expr (arm)`; `137:24 b15.0 cond-expr (arm)`; `140:24 b16.0 cond-expr (arm)`; `139:40 b17.1 binary-expr (arm)`; `142:26 b18.0 cond-expr (arm)`; `169:48 b23.2 binary-expr (arm)`; `170:12 b23.3 binary-expr (arm)`; `175:29 b24.1 binary-expr (arm)`; `176:12 b24.2 binary-expr (arm)`; `199:14 b27.1 binary-expr (arm)`.
- Functions: `(anonymous_3)@70`; `(anonymous_5)@222`.

## 22. src/features/patients/components/AvatarCropModal.tsx

S/B/F/L: 90.80% / 79.16% / 91.42% / 93.03%. Missing branch arms: 15.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 89-91, 93, 95, 134, 184-185, 205-206, 426.
- Branches: `87:4 b1.1 if (condition)`; `87:18 b2.1 binary-expr (arm)`; `133:4 b3.1 if (condition)`; `147:70 b5.1 cond-expr (arm)`; `166:57 b9.0 cond-expr (arm)`; `183:6 b11.0 if (arm)`; `204:6 b12.0 if (arm)`; `222:6 b13.0 if (arm)`; `230:10 b15.0 if (arm)`; `271:16 b19.1 cond-expr (arm)`; `330:54 b21.1 binary-expr (arm)`; `330:80 b22.1 binary-expr (arm)`; `378:4 b23.0 if (arm)`; `426:8 b26.0 if (arm)`; `426:8 b26.1 if (condition)`.
- Functions: `(anonymous_4)@89`; `(anonymous_5)@95`; `(anonymous_31)@425`.

## 23. src/features/finance/components/MonthlyFinanceDiagnosisCard.tsx

S/B/F/L: 95.65% / 72.00% / 100.00% / 100.00%. Missing branch arms: 14.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `91:2 b0.0 if (arm)`; `125:88 b1.1 cond-expr (arm)`; `125:75 b2.1 cond-expr (arm)`; `142:91 b3.1 cond-expr (arm)`; `145:16 b4.0 cond-expr (arm)`; `148:18 b5.1 cond-expr (arm)`; `149:20 b6.0 cond-expr (arm)`; `150:20 b6.1 cond-expr (arm)`; `185:12 b7.1 binary-expr (arm)`; `190:48 b8.1 cond-expr (arm)`; `201:12 b9.0 cond-expr (arm)`; `311:8 b18.1 binary-expr (arm)`; `312:8 b18.2 binary-expr (arm)`; `313:10 b18.3 binary-expr (arm)`.
- Functions: —.

## 24. src/features/scheduling/components/appointments/AppointmentClinicalSection.tsx

S/B/F/L: 52.17% / 45.83% / 50.00% / 52.38%. Missing branch arms: 13.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 37-39, 46-48, 55-56, 61, 67.
- Branches: `37:4 b2.0 if (arm)`; `37:4 b2.1 if (condition)`; `50:19 b3.0 binary-expr (arm)`; `50:46 b3.1 binary-expr (arm)`; `52:22 b4.0 binary-expr (arm)`; `52:50 b4.1 binary-expr (arm)`; `53:22 b5.0 binary-expr (arm)`; `53:50 b5.1 binary-expr (arm)`; `74:8 b6.0 cond-expr (arm)`; `79:8 b7.0 cond-expr (arm)`; `106:35 b8.0 cond-expr (arm)`; `113:14 b9.0 cond-expr (arm)`; `120:28 b10.0 cond-expr (arm)`.
- Functions: `(anonymous_2)@36`; `(anonymous_3)@45`.

## 25. src/features/auth/components/AuthForm.tsx

S/B/F/L: 70.42% / 81.42% / 88.88% / 72.46%. Missing branch arms: 13.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 93-94, 104, 106-109, 115, 117, 125, 132, 134-137, 139, 359-361.
- Branches: `58:4 b0.1 if (condition)`; `92:4 b5.0 if (arm)`; `97:4 b7.1 if (condition)`; `107:6 b9.0 if (arm)`; `114:13 b9.1 if (arm)`; `134:30 b10.0 cond-expr (arm)`; `134:58 b10.1 cond-expr (arm)`; `292:14 b23.0 cond-expr (arm)`; `329:8 b28.1 binary-expr (arm)`; `359:2 b33.0 if (arm)`; `359:2 b33.1 if (condition)`; `360:2 b34.0 if (arm)`; `360:2 b34.1 if (condition)`.
- Functions: `getAuthErrorMessage@358`.

## 26. src/features/dashboard/containers/DashboardPageContainer.tsx

S/B/F/L: 84.37% / 77.58% / 65.21% / 83.87%. Missing branch arms: 13.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 85, 180, 276, 309, 313.
- Branches: `85:25 b1.0 binary-expr (arm)`; `85:40 b1.1 binary-expr (arm)`; `85:58 b2.0 binary-expr (arm)`; `85:73 b2.1 binary-expr (arm)`; `96:54 b3.1 binary-expr (arm)`; `118:16 b5.1 binary-expr (arm)`; `209:76 b12.0 cond-expr (arm)`; `240:22 b14.1 binary-expr (arm)`; `307:8 b22.1 cond-expr (arm)`; `319:19 b23.0 binary-expr (arm)`; `320:20 b23.1 binary-expr (arm)`; `360:47 b25.0 cond-expr (arm)`; `370:61 b27.0 cond-expr (arm)`.
- Functions: `(anonymous_5)@85`; `(anonymous_8)@180`; `(anonymous_9)@181`; `(anonymous_10)@182`; `(anonymous_16)@276`; `(anonymous_17)@284`; `(anonymous_19)@309`; `(anonymous_20)@313`.

## 27. src/features/fiscal/components/FiscalProfileForm.tsx

S/B/F/L: 96.92% / 83.33% / 96.00% / 98.38%. Missing branch arms: 13.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 102.
- Branches: `81:43 b10.1 binary-expr (arm)`; `82:55 b11.1 binary-expr (arm)`; `83:39 b12.1 binary-expr (arm)`; `84:38 b13.1 binary-expr (arm)`; `101:4 b15.0 if (arm)`; `152:41 b20.1 binary-expr (arm)`; `176:53 b22.1 binary-expr (arm)`; `184:49 b23.1 binary-expr (arm)`; `218:18 b27.1 binary-expr (arm)`; `242:49 b28.1 binary-expr (arm)`; `327:43 b33.1 binary-expr (arm)`; `335:36 b34.1 binary-expr (arm)`; `343:44 b35.1 binary-expr (arm)`.
- Functions: `(anonymous_6)@102`.

## 28. src/features/clinical-records/components/ImageAttachmentPanel.tsx

S/B/F/L: 98.69% / 88.49% / 100.00% / 100.00%. Missing branch arms: 13.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `34:2 b0.0 if (arm)`; `213:6 b17.1 if (condition)`; `214:6 b18.1 if (condition)`; `300:29 b26.0 cond-expr (arm)`; `373:78 b34.1 cond-expr (arm)`; `392:10 b36.1 if (condition)`; `430:14 b38.1 cond-expr (arm)`; `425:59 b39.1 binary-expr (arm)`; `467:4 b42.0 if (arm)`; `483:6 b44.1 if (condition)`; `488:37 b46.1 binary-expr (arm)`; `491:8 b47.1 cond-expr (arm)`; `526:10 b49.1 cond-expr (arm)`.
- Functions: —.

## 29. src/features/marketing/components/LandingIntegrationsSection.tsx

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%. Missing branch arms: 12.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 13, 29-30, 32, 74-77, 79, 115, 128.
- Branches: `37:20 b0.0 cond-expr (arm)`; `37:50 b0.1 cond-expr (arm)`; `39:44 b1.0 cond-expr (arm)`; `39:79 b1.1 cond-expr (arm)`; `45:12 b2.0 cond-expr (arm)`; `52:12 b2.1 cond-expr (arm)`; `89:24 b3.0 cond-expr (arm)`; `89:54 b3.1 cond-expr (arm)`; `104:24 b4.0 cond-expr (arm)`; `104:40 b4.1 cond-expr (arm)`; `106:48 b5.0 cond-expr (arm)`; `106:58 b5.1 cond-expr (arm)`.
- Functions: `IntegrationCard@28`; `LandingIntegrationsSection@73`; `(anonymous_2)@76`; `(anonymous_3)@76`; `(anonymous_4)@77`; `(anonymous_5)@115`; `(anonymous_6)@128`.

## 30. src/features/scheduling/components/availability/ExceptionManager.tsx

S/B/F/L: 75.75% / 70.00% / 84.21% / 77.04%. Missing branch arms: 12.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 76-82, 84, 86, 105, 123, 140, 181, 249.
- Branches: `84:38 b5.0 cond-expr (arm)`; `84:52 b5.1 cond-expr (arm)`; `91:4 b6.0 if (arm)`; `101:89 b7.1 cond-expr (arm)`; `106:38 b8.0 cond-expr (arm)`; `106:52 b8.1 cond-expr (arm)`; `115:4 b9.0 if (arm)`; `124:38 b10.0 cond-expr (arm)`; `124:52 b10.1 cond-expr (arm)`; `140:38 b11.0 cond-expr (arm)`; `140:52 b11.1 cond-expr (arm)`; `174:18 b14.1 binary-expr (arm)`.
- Functions: `handleAdd@75`; `(anonymous_12)@181`; `(anonymous_18)@249`.

## 31. src/features/marketing/components/DataMigrationSection.tsx

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%. Missing branch arms: 10.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 9, 33, 41, 65-67, 106, 144.
- Branches: `73:26 b0.0 cond-expr (arm)`; `74:26 b0.1 cond-expr (arm)`; `82:30 b1.0 cond-expr (arm)`; `83:30 b1.1 cond-expr (arm)`; `96:42 b2.0 cond-expr (arm)`; `96:63 b2.1 cond-expr (arm)`; `111:32 b3.0 cond-expr (arm)`; `112:32 b3.1 cond-expr (arm)`; `121:19 b4.0 binary-expr (arm)`; `122:20 b4.1 binary-expr (arm)`.
- Functions: `DataMigrationSection@40`; `(anonymous_1)@64`; `(anonymous_2)@106`; `(anonymous_3)@144`.

## 32. src/features/marketing/components/landing/FlowOrbit.tsx

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%. Missing branch arms: 10.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 20, 22, 26, 42-43, 45-51, 54, 59, 88, 132, 178-179, 226-227, 229, 231.
- Branches: `46:4 b0.0 if (arm)`; `46:4 b0.1 if (condition)`; `46:8 b1.0 binary-expr (arm)`; `46:41 b1.1 binary-expr (arm)`; `54:9 b2.0 binary-expr (arm)`; `54:20 b2.1 binary-expr (arm)`; `229:2 b3.0 if (arm)`; `229:2 b3.1 if (condition)`; `234:8 b4.0 cond-expr (arm)`; `238:8 b4.1 cond-expr (arm)`.
- Functions: `(anonymous_0)@20`; `useStaticOrbit@41`; `(anonymous_2)@45`; `(anonymous_3)@49`; `(anonymous_4)@51`; `OrbitPoster@58`; `StaticOrbit@87`; `(anonymous_7)@132`; `(anonymous_8)@177`; `FlowOrbit@225`.

## 33. src/features/scheduling/components/mobile/MobileAgendaTimeline.tsx

S/B/F/L: 97.82% / 84.12% / 100.00% / 97.61%. Missing branch arms: 10.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 88.
- Branches: `48:52 b2.1 cond-expr (arm)`; `57:10 b3.1 cond-expr (arm)`; `58:12 b4.0 cond-expr (arm)`; `59:12 b4.1 cond-expr (arm)`; `75:40 b6.1 binary-expr (arm)`; `75:73 b7.1 binary-expr (arm)`; `84:4 b9.1 if (condition)`; `199:56 b24.1 cond-expr (arm)`; `201:50 b25.0 cond-expr (arm)`; `242:54 b28.1 binary-expr (arm)`.
- Functions: —.

## 34. src/features/scheduling/utils/week-calendar-layout.ts

S/B/F/L: 98.85% / 89.13% / 100.00% / 100.00%. Missing branch arms: 10.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `45:37 b2.1 binary-expr (arm)`; `45:70 b3.1 binary-expr (arm)`; `47:41 b5.1 binary-expr (arm)`; `47:68 b6.1 binary-expr (arm)`; `55:27 b9.1 binary-expr (arm)`; `56:28 b11.1 binary-expr (arm)`; `56:51 b12.1 binary-expr (arm)`; `86:74 b18.1 cond-expr (arm)`; `177:4 b37.0 if (arm)`; `185:54 b41.1 binary-expr (arm)`.
- Functions: —.

## 35. src/features/inventory/components/StockMovementModal.tsx

S/B/F/L: 82.14% / 82.69% / 72.22% / 86.00%. Missing branch arms: 9.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 89-90, 116, 119, 126, 284, 295.
- Branches: `82:4 b3.0 if (arm)`; `88:6 b5.0 if (arm)`; `105:48 b9.1 binary-expr (arm)`; `106:42 b10.1 binary-expr (arm)`; `117:12 b13.0 cond-expr (arm)`; `118:12 b13.1 cond-expr (arm)`; `126:55 b14.0 binary-expr (arm)`; `126:64 b14.1 binary-expr (arm)`; `332:59 b24.1 cond-expr (arm)`.
- Functions: `(anonymous_5)@126`; `(anonymous_12)@284`; `(anonymous_13)@284`; `(anonymous_14)@295`; `(anonymous_15)@295`.

## 36. src/features/marketing/pages/PlansPage.tsx

S/B/F/L: 97.67% / 84.48% / 95.83% / 97.61%. Missing branch arms: 9.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 445.
- Branches: `116:60 b0.1 cond-expr (arm)`; `173:60 b1.1 cond-expr (arm)`; `445:65 b10.0 cond-expr (arm)`; `445:72 b10.1 cond-expr (arm)`; `475:57 b11.1 cond-expr (arm)`; `534:50 b12.1 cond-expr (arm)`; `539:65 b14.1 cond-expr (arm)`; `702:22 b24.1 binary-expr (arm)`; `708:8 b25.1 binary-expr (arm)`.
- Functions: `(anonymous_14)@445`.

## 37. src/features/dashboard/containers/ProductivityCenter.tsx

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%. Missing branch arms: 9.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `66:87 b0.1 binary-expr (arm)`; `68:27 b1.1 binary-expr (arm)`; `110:30 b3.1 binary-expr (arm)`; `181:8 b5.0 cond-expr (arm)`; `229:8 b10.1 cond-expr (arm)`; `289:44 b15.1 cond-expr (arm)`; `294:53 b16.1 cond-expr (arm)`; `313:46 b18.0 cond-expr (arm)`; `462:70 b32.1 cond-expr (arm)`.
- Functions: —.

## 38. src/features/marketing/components/VideoSection.tsx

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%. Missing branch arms: 8.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 8-10, 13-14, 16, 51, 82.
- Branches: `26:24 b0.0 cond-expr (arm)`; `26:54 b0.1 cond-expr (arm)`; `65:24 b1.0 cond-expr (arm)`; `65:54 b1.1 cond-expr (arm)`; `67:48 b2.0 cond-expr (arm)`; `67:58 b2.1 cond-expr (arm)`; `71:14 b3.0 cond-expr (arm)`; `80:14 b3.1 cond-expr (arm)`.
- Functions: `VideoSection@12`; `(anonymous_1)@51`; `(anonymous_2)@82`.

## 39. src/features/marketing/components/landing/FlowOrbitScene.tsx

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%. Missing branch arms: 8.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 20-23, 27, 39-41, 46-58, 60-62, 65-66, 83-84, 86-88, 90-93, 96, 134-137, 139, 141, 144-145, 151-153, 157-159, 161-166, 169, 189, 217.
- Branches: `52:4 b0.0 if (arm)`; `52:4 b0.1 if (condition)`; `88:4 b1.0 if (arm)`; `88:4 b1.1 if (condition)`; `144:4 b2.0 if (arm)`; `144:4 b2.1 if (condition)`; `159:4 b3.0 if (arm)`; `159:4 b3.1 if (condition)`.
- Functions: `(anonymous_0)@39`; `useGlowTexture@45`; `(anonymous_2)@46`; `(anonymous_3)@65`; `OrbitNode@82`; `(anonymous_5)@86`; `OrbitContent@133`; `(anonymous_7)@139`; `(anonymous_8)@151`; `(anonymous_9)@157`; `(anonymous_10)@189`; `FlowOrbitScene@216`.

## 40. src/features/scheduling/components/appointments/AppointmentPaymentSection.tsx

S/B/F/L: 85.36% / 83.33% / 57.14% / 85.00%. Missing branch arms: 8.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 168, 187, 199, 205, 235, 273.
- Branches: `58:8 b2.1 binary-expr (arm)`; `68:8 b4.1 binary-expr (arm)`; `73:8 b5.1 binary-expr (arm)`; `110:42 b10.1 binary-expr (arm)`; `111:76 b11.1 cond-expr (arm)`; `248:82 b19.1 cond-expr (arm)`; `251:45 b20.0 cond-expr (arm)`; `267:14 b22.2 binary-expr (arm)`.
- Functions: `(anonymous_5)@168`; `(anonymous_6)@187`; `(anonymous_7)@199`; `(anonymous_8)@205`; `(anonymous_10)@235`; `(anonymous_13)@273`.

## 41. src/features/team/components/ClinicMemberFormModal.tsx

S/B/F/L: 86.36% / 87.50% / 72.22% / 85.93%. Missing branch arms: 8.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 104, 107, 133-134, 169, 199, 223-224, 230.
- Branches: `105:14 b5.0 cond-expr (arm)`; `106:14 b5.1 cond-expr (arm)`; `132:4 b10.0 if (arm)`; `132:20 b11.1 binary-expr (arm)`; `162:52 b15.1 cond-expr (arm)`; `169:55 b16.0 binary-expr (arm)`; `169:66 b16.1 binary-expr (arm)`; `338:41 b29.1 cond-expr (arm)`.
- Functions: `(anonymous_4)@102`; `(anonymous_9)@169`; `(anonymous_10)@199`; `(anonymous_14)@222`; `(anonymous_15)@230`.

## 42. src/features/inventory/hooks/useInventoryPage.ts

S/B/F/L: 98.04% / 88.05% / 95.91% / 98.93%. Missing branch arms: 8.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: 184-185.
- Branches: `96:14 b3.1 cond-expr (arm)`; `135:4 b8.0 if (arm)`; `150:4 b9.0 if (arm)`; `184:50 b11.0 cond-expr (arm)`; `184:64 b11.1 cond-expr (arm)`; `216:52 b17.0 cond-expr (arm)`; `261:52 b21.0 cond-expr (arm)`; `320:6 b25.1 if (condition)`.
- Functions: `(anonymous_21)@183`; `(anonymous_48)@366`.

## 43. src/features/clinical-records/hooks/useClinicalRecordAutosave.ts

S/B/F/L: 89.79% / 75.00% / 100.00% / 100.00%. Missing branch arms: 8.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `69:8 b5.0 if (arm)`; `76:8 b7.0 if (arm)`; `78:10 b8.0 if (arm)`; `79:61 b9.1 cond-expr (arm)`; `82:8 b10.0 if (arm)`; `89:6 b11.1 if (condition)`; `102:4 b14.1 if (condition)`; `103:4 b15.0 if (arm)`.
- Functions: —.

## 44. src/features/inventory/components/InventoryProductTable.tsx

S/B/F/L: 100.00% / 82.97% / 100.00% / 100.00%. Missing branch arms: 8.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `68:10 b2.0 cond-expr (arm)`; `184:36 b11.0 cond-expr (arm)`; `186:38 b12.0 cond-expr (arm)`; `216:24 b14.1 cond-expr (arm)`; `226:28 b15.0 cond-expr (arm)`; `228:30 b16.0 cond-expr (arm)`; `235:24 b17.1 cond-expr (arm)`; `246:43 b19.1 binary-expr (arm)`.
- Functions: —.

## 45. src/features/inventory/components/ProductDetailsDrawer.tsx

S/B/F/L: 88.88% / 83.33% / 87.50% / 88.88%. Missing branch arms: 7.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 41.
- Branches: `41:60 b0.0 binary-expr (arm)`; `41:71 b0.1 binary-expr (arm)`; `97:26 b3.0 cond-expr (arm)`; `99:28 b5.0 cond-expr (arm)`; `181:22 b13.1 cond-expr (arm)`; `185:41 b14.1 binary-expr (arm)`; `191:22 b15.1 cond-expr (arm)`.
- Functions: `(anonymous_1)@41`.

## 46. src/features/billing/pages/SubscriptionSuccessPage.tsx

S/B/F/L: 91.86% / 88.88% / 100.00% / 93.67%. Missing branch arms: 7.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 782-783, 788-789, 795.
- Branches: `235:6 b5.0 if (arm)`; `643:53 b23.0 cond-expr (arm)`; `646:63 b24.1 binary-expr (arm)`; `781:2 b27.1 if (condition)`; `782:2 b28.0 if (arm)`; `782:2 b28.1 if (condition)`; `787:2 b29.1 if (condition)`.
- Functions: —.

## 47. src/features/patients/components/CameraPreviewModal.tsx

S/B/F/L: 87.30% / 80.55% / 80.00% / 94.64%. Missing branch arms: 7.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 100, 108-109.
- Branches: `42:8 b3.1 if (condition)`; `47:8 b4.0 if (arm)`; `70:4 b9.0 if (arm)`; `76:4 b12.0 if (arm)`; `81:8 b13.0 if (arm)`; `100:8 b14.0 if (arm)`; `100:8 b14.1 if (condition)`.
- Functions: `(anonymous_8)@99`; `(anonymous_9)@107`.

## 48. src/features/scheduling/components/mobile/MobileAgendaList.tsx

S/B/F/L: 97.36% / 83.72% / 100.00% / 97.05%. Missing branch arms: 7.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 86.
- Branches: `46:52 b2.1 cond-expr (arm)`; `55:10 b3.1 cond-expr (arm)`; `56:12 b4.0 cond-expr (arm)`; `57:12 b4.1 cond-expr (arm)`; `74:40 b6.1 binary-expr (arm)`; `74:73 b7.1 binary-expr (arm)`; `82:4 b9.1 if (condition)`.
- Functions: —.

## 49. src/features/clinical-records/containers/ClinicalRecordPrintContainer.tsx

S/B/F/L: 95.65% / 90.41% / 100.00% / 100.00%. Missing branch arms: 7.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `53:8 b0.0 if (arm)`; `61:8 b4.1 if (condition)`; `63:8 b5.1 if (condition)`; `76:2 b8.0 if (arm)`; `117:55 b13.1 cond-expr (arm)`; `224:44 b28.1 binary-expr (arm)`; `258:45 b33.1 binary-expr (arm)`.
- Functions: —.

## 50. src/features/fiscal/components/InvoiceForm.tsx

S/B/F/L: 100.00% / 78.12% / 100.00% / 100.00%. Missing branch arms: 7.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `20:47 b0.1 binary-expr (arm)`; `24:46 b3.1 binary-expr (arm)`; `93:48 b10.1 binary-expr (arm)`; `109:45 b11.1 binary-expr (arm)`; `122:45 b12.1 binary-expr (arm)`; `153:43 b13.1 binary-expr (arm)`; `183:35 b14.1 binary-expr (arm)`.
- Functions: —.

## 51. src/features/marketing/components/PricingSection.tsx

S/B/F/L: 100.00% / 79.41% / 100.00% / 100.00%. Missing branch arms: 7.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `38:54 b0.1 cond-expr (arm)`; `65:54 b1.1 cond-expr (arm)`; `67:58 b2.1 cond-expr (arm)`; `90:54 b3.1 cond-expr (arm)`; `92:58 b4.1 cond-expr (arm)`; `139:50 b5.1 cond-expr (arm)`; `144:65 b7.1 cond-expr (arm)`.
- Functions: —.

## 52. src/features/scheduling/components/shared/GoogleCalendarButton.tsx

S/B/F/L: 83.33% / 50.00% / 100.00% / 83.33%. Missing branch arms: 6.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 23.
- Branches: `22:2 b0.0 if (arm)`; `31:17 b2.0 binary-expr (arm)`; `31:51 b2.1 binary-expr (arm)`; `35:12 b3.0 cond-expr (arm)`; `37:12 b3.1 cond-expr (arm)`; `65:10 b5.0 cond-expr (arm)`.
- Functions: —.

## 53. src/components/common/AiAssistantCard.tsx

S/B/F/L: 90.90% / 94.73% / 94.11% / 94.52%. Missing branch arms: 6.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: 60, 66, 105, 114.
- Branches: `59:4 b0.1 switch (arm)`; `65:4 b0.2 switch (arm)`; `229:4 b17.0 if (arm)`; `247:4 b20.0 if (arm)`; `296:69 b30.1 binary-expr (arm)`; `438:216 b46.1 cond-expr (arm)`.
- Functions: `(anonymous_13)@252`.

## 54. src/features/billing/components/PricingCard.tsx

S/B/F/L: 95.91% / 94.59% / 92.30% / 94.87%. Missing branch arms: 6.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 303, 343.
- Branches: `62:66 b3.2 binary-expr (arm)`; `63:44 b4.1 binary-expr (arm)`; `109:81 b13.1 binary-expr (arm)`; `136:66 b18.1 cond-expr (arm)`; `217:70 b21.1 binary-expr (arm)`; `339:2 b39.1 if (condition)`.
- Functions: `(anonymous_8)@303`.

## 55. src/features/reports/utils/report-filter-chips.ts

S/B/F/L: 97.29% / 86.36% / 100.00% / 97.29%. Missing branch arms: 6.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: 92.
- Branches: `72:83 b5.1 binary-expr (arm)`; `77:65 b7.1 binary-expr (arm)`; `91:2 b10.0 if (arm)`; `97:62 b13.1 binary-expr (arm)`; `108:61 b15.1 binary-expr (arm)`; `134:65 b21.1 binary-expr (arm)`.
- Functions: —.

## 56. src/features/finance/components/ProcedureMarginsSection.tsx

S/B/F/L: 98.36% / 95.23% / 100.00% / 97.91%. Missing branch arms: 6.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 229.
- Branches: `228:6 b20.4 switch (arm)`; `223:32 b21.1 binary-expr (arm)`; `257:88 b29.0 cond-expr (arm)`; `350:55 b39.2 binary-expr (arm)`; `351:12 b39.3 binary-expr (arm)`; `506:16 b54.0 cond-expr (arm)`.
- Functions: —.

## 57. src/features/admin/components/UserFormModal.tsx

S/B/F/L: 98.48% / 92.10% / 95.00% / 98.43%. Missing branch arms: 6.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 170.
- Branches: `145:29 b17.1 binary-expr (arm)`; `148:52 b19.1 binary-expr (arm)`; `158:52 b22.1 binary-expr (arm)`; `170:55 b24.0 binary-expr (arm)`; `170:66 b24.1 binary-expr (arm)`; `228:24 b29.1 if (condition)`.
- Functions: `(anonymous_9)@170`.

## 58. src/features/clinical-records/components/OdontogramSection.tsx

S/B/F/L: 94.87% / 92.10% / 96.29% / 98.57%. Missing branch arms: 6.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 235.
- Branches: `48:4 b4.0 if (arm)`; `61:4 b6.0 if (arm)`; `72:4 b7.0 if (arm)`; `190:12 b23.1 if (condition)`; `193:12 b24.1 if (condition)`; `208:31 b25.1 binary-expr (arm)`.
- Functions: `(anonymous_20)@235`.

## 59. src/features/marketing/components/landing/DentalArchSection.tsx

S/B/F/L: 100.00% / 62.50% / 100.00% / 100.00%. Missing branch arms: 6.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `32:28 b0.0 cond-expr (arm)`; `35:35 b1.0 cond-expr (arm)`; `36:33 b2.0 cond-expr (arm)`; `39:58 b3.0 cond-expr (arm)`; `42:40 b4.0 cond-expr (arm)`; `43:67 b5.0 cond-expr (arm)`.
- Functions: —.

## 60. src/features/scheduling/hooks/useSchedulePage.ts

S/B/F/L: 100.00% / 80.00% / 83.33% / 100.00%. Missing branch arms: 6.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `106:6 b7.1 if (condition)`; `139:58 b10.1 cond-expr (arm)`; `155:32 b11.0 cond-expr (arm)`; `156:46 b12.0 cond-expr (arm)`; `162:58 b13.1 cond-expr (arm)`; `184:58 b14.1 cond-expr (arm)`.
- Functions: `(anonymous_7)@109`; `(anonymous_11)@189`.

## 61. src/features/finance/components/TransactionsTable.tsx

S/B/F/L: 86.66% / 86.48% / 75.00% / 86.66%. Missing branch arms: 5.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 296, 305.
- Branches: `87:10 b3.0 cond-expr (arm)`; `152:55 b8.1 binary-expr (arm)`; `153:47 b9.0 cond-expr (arm)`; `275:26 b16.1 binary-expr (arm)`; `281:61 b17.1 binary-expr (arm)`.
- Functions: `(anonymous_6)@296`; `(anonymous_7)@305`.

## 62. src/features/scheduling/components/appointments/AppointmentServiceValueSection.tsx

S/B/F/L: 86.66% / 86.11% / 83.33% / 92.30%. Missing branch arms: 5.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 76.
- Branches: `76:75 b7.0 cond-expr (arm)`; `76:80 b7.1 cond-expr (arm)`; `76:20 b8.0 binary-expr (arm)`; `76:43 b8.1 binary-expr (arm)`; `80:4 b9.0 if (arm)`.
- Functions: `handleServiceChange@75`.

## 63. src/features/dashboard/containers/DentistHomePageContainer.tsx

S/B/F/L: 96.55% / 90.00% / 88.88% / 95.83%. Missing branch arms: 5.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 213, 279.
- Branches: `81:59 b3.1 binary-expr (arm)`; `81:92 b4.1 binary-expr (arm)`; `145:49 b14.0 cond-expr (arm)`; `220:26 b19.1 binary-expr (arm)`; `313:12 b24.1 binary-expr (arm)`.
- Functions: `(anonymous_23)@213`; `(anonymous_24)@279`; `(anonymous_25)@281`.

## 64. src/features/inventory/hooks/usePersistedCopilot.ts

S/B/F/L: 94.11% / 77.27% / 100.00% / 97.87%. Missing branch arms: 5.

B / C2 — both real consumers exercise persisted load/generate/error/retry behavior. Remaining cancellation defenses are retained; removed draft unmount assertions did not prove observable behavior.

- Lines: 87.
- Branches: `37:8 b0.0 if (arm)`; `41:8 b2.0 if (arm)`; `42:8 b3.1 if (condition)`; `56:8 b6.1 if (condition)`; `74:6 b8.1 if (condition)`.
- Functions: —.

## 65. src/features/compliance/components/PrivacyRequestsTab.tsx

S/B/F/L: 100.00% / 86.84% / 100.00% / 100.00%. Missing branch arms: 5.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `74:50 b3.0 cond-expr (arm)`; `92:55 b5.0 cond-expr (arm)`; `124:65 b10.1 binary-expr (arm)`; `161:62 b13.1 binary-expr (arm)`; `192:58 b15.1 binary-expr (arm)`.
- Functions: —.

## 66. src/features/fiscal/utils/print-invoice.ts

S/B/F/L: 100.00% / 64.28% / 100.00% / 100.00%. Missing branch arms: 5.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `55:32 b2.0 cond-expr (arm)`; `70:28 b3.0 cond-expr (arm)`; `77:34 b4.0 cond-expr (arm)`; `78:41 b5.0 cond-expr (arm)`; `81:20 b6.0 cond-expr (arm)`.
- Functions: —.

## 67. src/features/marketing/components/landing/Reveal.tsx

S/B/F/L: 100.00% / 70.58% / 100.00% / 100.00%. Missing branch arms: 5.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `32:25 b2.0 cond-expr (arm)`; `33:47 b3.1 cond-expr (arm)`; `33:28 b4.1 binary-expr (arm)`; `70:47 b8.1 cond-expr (arm)`; `70:28 b9.1 binary-expr (arm)`.
- Functions: —.

## 68. src/features/marketing/pages/IntegrationsPage.tsx

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%. Missing branch arms: 4.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 11, 39, 43, 66-68, 141.
- Branches: `76:24 b0.0 cond-expr (arm)`; `83:24 b0.1 cond-expr (arm)`; `97:23 b1.0 binary-expr (arm)`; `97:50 b1.1 binary-expr (arm)`.
- Functions: `IntegrationsPage@38`; `(anonymous_1)@65`; `(anonymous_2)@141`.

## 69. src/features/scheduling/constants/appointment-filters.ts

S/B/F/L: 50.00% / 0.00% / 0.00% / 50.00%. Missing branch arms: 4.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 12, 17-18.
- Branches: `12:32 b0.0 binary-expr (arm)`; `12:60 b0.1 binary-expr (arm)`; `12:66 b1.0 binary-expr (arm)`; `12:94 b1.1 binary-expr (arm)`.
- Functions: `(anonymous_0)@12`; `(anonymous_1)@17`; `(anonymous_2)@18`.

## 70. src/features/scheduling/containers/AppointmentsPageContainer.tsx

S/B/F/L: 66.66% / 66.66% / 45.45% / 66.66%. Missing branch arms: 4.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 145, 156, 168, 178, 184, 190.
- Branches: `66:35 b0.0 cond-expr (arm)`; `73:36 b1.1 cond-expr (arm)`; `73:60 b2.0 cond-expr (arm)`; `73:68 b2.1 cond-expr (arm)`.
- Functions: `(anonymous_5)@145`; `(anonymous_6)@156`; `(anonymous_7)@168`; `(anonymous_8)@178`; `(anonymous_9)@184`; `(anonymous_10)@190`.

## 71. src/features/finance/components/FinancialAnalysisPanel.tsx

S/B/F/L: 71.42% / 50.00% / 66.66% / 75.00%. Missing branch arms: 4.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 26-28.
- Branches: `21:44 b0.0 cond-expr (arm)`; `21:21 b1.1 binary-expr (arm)`; `24:4 b2.0 if (arm)`; `25:4 b3.1 if (condition)`.
- Functions: `(anonymous_2)@26`.

## 72. src/features/scheduling/containers/SchedulePageContainer.tsx

S/B/F/L: 92.85% / 83.33% / 66.66% / 92.85%. Missing branch arms: 4.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 249.
- Branches: `58:35 b0.0 cond-expr (arm)`; `65:36 b1.1 cond-expr (arm)`; `65:60 b2.0 cond-expr (arm)`; `65:68 b2.1 cond-expr (arm)`.
- Functions: `(anonymous_6)@165`; `(anonymous_7)@249`; `(anonymous_8)@251`.

## 73. src/features/auth/pages/CompleteProfilePage.tsx

S/B/F/L: 95.74% / 85.71% / 100.00% / 95.65%. Missing branch arms: 4.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 59-60.
- Branches: `31:44 b1.1 binary-expr (arm)`; `31:67 b2.1 binary-expr (arm)`; `58:4 b8.0 if (arm)`; `88:12 b10.1 cond-expr (arm)`.
- Functions: —.

## 74. src/features/clinical-records/components/ClinicalStickyBar.tsx

S/B/F/L: 81.81% / 77.77% / 100.00% / 100.00%. Missing branch arms: 4.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `15:2 b0.0 if (arm)`; `16:2 b1.0 if (arm)`; `125:8 b7.1 binary-expr (arm)`; `128:8 b8.1 binary-expr (arm)`.
- Functions: —.

## 75. src/features/clinical-records/hooks/useClinicalTemplates.ts

S/B/F/L: 100.00% / 50.00% / 100.00% / 100.00%. Missing branch arms: 4.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `31:8 b0.1 if (condition)`; `34:8 b1.1 if (condition)`; `37:8 b2.1 if (condition)`; `70:70 b3.1 cond-expr (arm)`.
- Functions: —.

## 76. src/features/compliance/components/AuditLogsTab.tsx

S/B/F/L: 100.00% / 91.30% / 100.00% / 100.00%. Missing branch arms: 4.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `59:8 b2.1 if (condition)`; `62:8 b3.1 if (condition)`; `92:70 b8.0 cond-expr (arm)`; `136:65 b13.1 binary-expr (arm)`.
- Functions: —.

## 77. src/features/finance/components/IncomeExpensesChart.tsx

S/B/F/L: 100.00% / 93.10% / 100.00% / 100.00%. Missing branch arms: 4.

B / C2–C3 — application tooltip/sign and toggle behavior now run; remaining chart callbacks, reduction alternatives and nullable fallbacks need targeted cases/reachability review.

- Lines: —.
- Branches: `54:53 b2.1 binary-expr (arm)`; `76:50 b7.1 binary-expr (arm)`; `133:38 b18.0 cond-expr (arm)`; `160:82 b22.1 binary-expr (arm)`.
- Functions: —.

## 78. src/features/scheduling/hooks/useAppointmentsPage.ts

S/B/F/L: 100.00% / 87.50% / 90.90% / 100.00%. Missing branch arms: 4.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `121:6 b5.1 if (condition)`; `194:58 b11.1 cond-expr (arm)`; `217:58 b14.1 cond-expr (arm)`; `239:58 b15.1 cond-expr (arm)`.
- Functions: `(anonymous_9)@124`; `(anonymous_21)@246`.

## 79. src/config/company.ts

S/B/F/L: 63.15% / 50.00% / 60.00% / 66.66%. Missing branch arms: 3.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: 165, 169-170, 172-173, 175.
- Branches: `168:2 b0.0 if (arm)`; `172:4 b1.0 if (arm)`; `172:4 b1.1 if (condition)`.
- Functions: `(anonymous_1)@165`; `(anonymous_2)@169`.

## 80. src/features/patients/components/PatientAvatarWidget.tsx

S/B/F/L: 89.55% / 93.02% / 100.00% / 90.00%. Missing branch arms: 3.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 93-98.
- Branches: `70:4 b5.0 if (arm)`; `91:11 b9.1 if (arm)`; `138:6 b12.1 if (condition)`.
- Functions: —.

## 81. src/components/common/PasswordResetModal.tsx

S/B/F/L: 91.17% / 84.21% / 87.50% / 90.62%. Missing branch arms: 3.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: 67-68, 87.
- Branches: `66:4 b3.0 if (arm)`; `87:55 b6.0 binary-expr (arm)`; `87:66 b6.1 binary-expr (arm)`.
- Functions: `(anonymous_5)@87`.

## 82. src/features/billing/containers/SubscriptionPageContainer.tsx

S/B/F/L: 94.73% / 90.32% / 87.50% / 93.75%. Missing branch arms: 3.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 198.
- Branches: `134:16 b12.1 binary-expr (arm)`; `135:16 b12.2 binary-expr (arm)`; `156:71 b13.2 binary-expr (arm)`.
- Functions: `(anonymous_7)@198`.

## 83. src/features/fiscal/components/AppointmentInvoicePickerModal.tsx

S/B/F/L: 93.18% / 90.62% / 85.00% / 94.87%. Missing branch arms: 3.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 94, 240.
- Branches: `76:63 b1.1 binary-expr (arm)`; `94:53 b2.0 binary-expr (arm)`; `94:62 b2.1 binary-expr (arm)`.
- Functions: `(anonymous_8)@94`; `(anonymous_15)@240`; `(anonymous_16)@240`.

## 84. src/features/admin/containers/AdminClinicsPageContainer.tsx

S/B/F/L: 92.30% / 85.00% / 94.44% / 96.00%. Missing branch arms: 3.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 274.
- Branches: `243:32 b4.0 if (arm)`; `244:32 b5.1 if (condition)`; `244:61 b6.1 binary-expr (arm)`.
- Functions: `(anonymous_13)@274`.

## 85. src/features/scheduling/components/availability/AvailabilityManager.tsx

S/B/F/L: 98.03% / 85.00% / 92.85% / 97.91%. Missing branch arms: 3.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 134.
- Branches: `52:67 b1.1 cond-expr (arm)`; `56:55 b2.1 cond-expr (arm)`; `72:55 b3.1 cond-expr (arm)`.
- Functions: `(anonymous_11)@134`.

## 86. src/components/common/MonthPickerInput.tsx

S/B/F/L: 96.55% / 92.68% / 100.00% / 100.00%. Missing branch arms: 3.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: —.
- Branches: `39:2 b1.0 if (arm)`; `48:2 b4.0 if (arm)`; `147:38 b17.1 binary-expr (arm)`.
- Functions: —.

## 87. src/features/admin/hooks/useAdminFinancePage.ts

S/B/F/L: 98.71% / 86.36% / 100.00% / 100.00%. Missing branch arms: 3.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `74:47 b0.1 cond-expr (arm)`; `107:8 b2.0 if (arm)`; `186:24 b10.1 binary-expr (arm)`.
- Functions: —.

## 88. src/features/fiscal/hooks/useFiscalInvoicesPage.ts

S/B/F/L: 98.00% / 86.36% / 100.00% / 100.00%. Missing branch arms: 3.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `85:8 b3.0 if (arm)`; `92:8 b4.0 if (arm)`; `106:8 b7.1 if (condition)`.
- Functions: —.

## 89. src/features/inventory/components/StockAbnormalConsumptionSection.tsx

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%. Missing branch arms: 3.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `211:63 b9.1 cond-expr (arm)`; `216:66 b10.1 cond-expr (arm)`; `221:60 b11.1 cond-expr (arm)`.
- Functions: —.

## 90. src/features/marketing/components/landing/DentalArch.tsx

S/B/F/L: 92.30% / 85.00% / 81.81% / 100.00%. Missing branch arms: 3.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `23:44 b0.0 cond-expr (arm)`; `48:4 b2.0 if (arm)`; `171:8 b9.0 cond-expr (arm)`.
- Functions: `(anonymous_0)@9`; `(anonymous_5)@51`.

## 91. src/features/marketing/pages/FeatureDetailPage.tsx

S/B/F/L: 100.00% / 83.33% / 100.00% / 100.00%. Missing branch arms: 3.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `46:60 b0.1 cond-expr (arm)`; `84:60 b1.1 cond-expr (arm)`; `369:57 b8.1 cond-expr (arm)`.
- Functions: —.

## 92. src/features/patients/hooks/usePatientAvatar.ts

S/B/F/L: 95.74% / 86.36% / 94.11% / 100.00%. Missing branch arms: 3.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `74:8 b8.1 if (condition)`; `81:8 b9.1 if (condition)`; `90:6 b10.0 if (arm)`.
- Functions: `(anonymous_16)@97`.

## 93. src/features/scheduling/components/SchedulingToolbar.tsx

S/B/F/L: 100.00% / 75.00% / 25.00% / 100.00%. Missing branch arms: 3.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `81:23 b3.1 binary-expr (arm)`; `82:20 b4.1 binary-expr (arm)`; `83:26 b5.1 binary-expr (arm)`.
- Functions: `(anonymous_1)@81`; `(anonymous_2)@82`; `(anonymous_3)@83`.

## 94. src/lib/validators/br.ts

S/B/F/L: 99.09% / 96.29% / 100.00% / 100.00%. Missing branch arms: 3.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `25:2 b4.0 if (arm)`; `53:23 b12.0 cond-expr (arm)`; `60:23 b14.0 cond-expr (arm)`.
- Functions: —.

## 95. src/features/finance/components/CategoryEditModal.tsx

S/B/F/L: 60.00% / 66.66% / 60.00% / 60.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 40, 94.
- Branches: `40:66 b0.0 binary-expr (arm)`; `40:75 b0.1 binary-expr (arm)`.
- Functions: `(anonymous_1)@40`; `(anonymous_4)@94`.

## 96. src/features/marketing/components/landing/ProductShowcaseSection.tsx

S/B/F/L: 67.56% / 80.00% / 47.82% / 67.56%. Missing branch arms: 2.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 38, 115, 133, 147, 161, 174, 236, 240, 248, 303, 311, 327.
- Branches: `137:25 b0.0 cond-expr (arm)`; `137:57 b0.1 cond-expr (arm)`.
- Functions: `Tile@37`; `ProntuarioMock@114`; `(anonymous_6)@133`; `(anonymous_7)@147`; `FinanceiroMock@160`; `(anonymous_9)@174`; `EquipeMock@235`; `(anonymous_13)@240`; `(anonymous_14)@248`; `(anonymous_16)@303`; `(anonymous_17)@311`; `(anonymous_19)@327`.

## 97. src/features/finance/components/FixedExpenseEditModal.tsx

S/B/F/L: 80.00% / 66.66% / 80.00% / 80.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 47, 159.
- Branches: `47:65 b0.0 binary-expr (arm)`; `47:74 b0.1 binary-expr (arm)`.
- Functions: `(anonymous_1)@47`; `(anonymous_9)@159`.

## 98. src/features/fiscal/components/FiscalInvoiceFiltersBar.tsx

S/B/F/L: 80.00% / 86.66% / 75.00% / 80.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 61.
- Branches: `62:39 b2.0 cond-expr (arm)`; `62:51 b2.1 cond-expr (arm)`.
- Functions: `(anonymous_2)@61`.

## 99. src/features/team/components/TeamMembersTable.tsx

S/B/F/L: 75.00% / 80.00% / 75.00% / 81.81%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 68-69.
- Branches: `46:18 b0.0 if (arm)`; `47:18 b1.1 if (condition)`.
- Functions: `(anonymous_6)@68`; `(anonymous_7)@69`.

## 100. src/features/finance/containers/FinancePageContainer.tsx

S/B/F/L: 87.50% / 92.30% / 91.66% / 86.95%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 127-129.
- Branches: `167:16 b4.1 if (condition)`; `342:68 b12.1 cond-expr (arm)`.
- Functions: `(anonymous_1)@126`.

## 101. src/features/scheduling/components/appointments/AppointmentTable.tsx

S/B/F/L: 85.71% / 92.00% / 81.81% / 89.47%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 122, 219.
- Branches: `183:8 b8.0 if (arm)`; `184:8 b9.1 if (condition)`.
- Functions: `(anonymous_4)@122`; `(anonymous_10)@219`.

## 102. src/features/finance/components/TransactionEditModal.tsx

S/B/F/L: 90.00% / 66.66% / 90.00% / 90.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 45.
- Branches: `45:69 b0.0 binary-expr (arm)`; `45:78 b0.1 binary-expr (arm)`.
- Functions: `(anonymous_1)@45`.

## 103. src/features/scheduling/components/appointments/AppointmentDrawer.tsx

S/B/F/L: 90.00% / 93.54% / 80.00% / 90.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 56.
- Branches: `56:62 b2.0 binary-expr (arm)`; `56:71 b2.1 binary-expr (arm)`.
- Functions: `(anonymous_3)@56`.

## 104. src/features/inventory/utils/inventory-format.ts

S/B/F/L: 84.61% / 80.00% / 100.00% / 91.66%. Missing branch arms: 2.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: 64.
- Branches: `37:25 b0.1 binary-expr (arm)`; `51:2 b4.0 if (arm)`.
- Functions: —.

## 105. src/features/marketing/hooks/useDropdownNav.ts

S/B/F/L: 96.87% / 80.00% / 100.00% / 96.00%. Missing branch arms: 2.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 19.
- Branches: `18:6 b0.0 if (arm)`; `23:6 b2.1 if (condition)`.
- Functions: —.

## 106. src/features/admin/components/ClinicFormModal.tsx

S/B/F/L: 96.55% / 93.54% / 88.88% / 96.29%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 87.
- Branches: `87:55 b7.0 binary-expr (arm)`; `87:66 b7.1 binary-expr (arm)`.
- Functions: `(anonymous_6)@87`.

## 107. src/features/admin/containers/AdminUsersPageContainer.tsx

S/B/F/L: 96.42% / 91.66% / 95.45% / 96.29%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 384.
- Branches: `277:30 b5.1 if (condition)`; `277:59 b6.1 binary-expr (arm)`.
- Functions: `(anonymous_19)@384`.

## 108. src/features/admin/components/ClinicHealthSection.tsx

S/B/F/L: 96.77% / 93.10% / 100.00% / 96.77%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 90.
- Branches: `89:2 b9.0 if (arm)`; `105:59 b13.0 cond-expr (arm)`.
- Functions: —.

## 109. src/components/common/DatePickerInput.tsx

S/B/F/L: 96.96% / 96.36% / 100.00% / 100.00%. Missing branch arms: 2.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: —.
- Branches: `74:4 b10.0 if (arm)`; `75:4 b11.0 if (arm)`.
- Functions: —.

## 110. src/components/layout/SiteFooter.tsx

S/B/F/L: 100.00% / 66.66% / 100.00% / 100.00%. Missing branch arms: 2.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: —.
- Branches: `47:22 b0.0 cond-expr (arm)`; `49:15 b1.1 binary-expr (arm)`.
- Functions: —.

## 111. src/features/auth/pages/ResetPasswordPage.tsx

S/B/F/L: 96.00% / 88.88% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `24:4 b0.0 if (arm)`; `33:45 b1.1 cond-expr (arm)`.
- Functions: —.

## 112. src/features/clinical-records/components/ClinicalSection.tsx

S/B/F/L: 100.00% / 85.71% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `59:47 b2.1 cond-expr (arm)`; `76:45 b5.1 cond-expr (arm)`.
- Functions: —.

## 113. src/features/clinical-records/hooks/useClinicalRecord.ts

S/B/F/L: 100.00% / 93.10% / 100.00% / 100.00%. Missing branch arms: 2.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `37:8 b1.1 if (condition)`; `229:8 b13.1 if (condition)`.
- Functions: —.

## 114. src/features/compliance/components/CookieConsentLogsTab.tsx

S/B/F/L: 100.00% / 95.23% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `102:70 b5.0 cond-expr (arm)`; `146:65 b10.1 binary-expr (arm)`.
- Functions: —.

## 115. src/features/finance/components/ColorPicker.tsx

S/B/F/L: 100.00% / 66.66% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `18:48 b0.1 binary-expr (arm)`; `19:72 b1.1 binary-expr (arm)`.
- Functions: —.

## 116. src/features/finance/components/KpiGrid.tsx

S/B/F/L: 100.00% / 94.44% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `58:51 b10.1 cond-expr (arm)`; `72:60 b13.1 cond-expr (arm)`.
- Functions: —.

## 117. src/features/finance/hooks/useExpenseClassifier.ts

S/B/F/L: 100.00% / 86.66% / 100.00% / 100.00%. Missing branch arms: 2.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `58:8 b5.1 if (condition)`; `64:38 b6.0 cond-expr (arm)`.
- Functions: —.

## 118. src/features/finance/hooks/useFinanceTransactions.ts

S/B/F/L: 98.43% / 93.75% / 100.00% / 100.00%. Missing branch arms: 2.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `47:59 b0.1 cond-expr (arm)`; `114:6 b7.0 if (arm)`.
- Functions: —.

## 119. src/features/fiscal/containers/FiscalProfilePageContainer.tsx

S/B/F/L: 100.00% / 93.33% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `54:83 b2.1 cond-expr (arm)`; `68:79 b9.1 cond-expr (arm)`.
- Functions: —.

## 120. src/features/inventory/components/StockMovementHistory.tsx

S/B/F/L: 95.23% / 85.71% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `28:4 b0.0 if (arm)`; `92:14 b6.1 binary-expr (arm)`.
- Functions: —.

## 121. src/features/inventory/containers/InventoryPageContainer.tsx

S/B/F/L: 100.00% / 95.83% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `132:91 b3.1 cond-expr (arm)`; `151:53 b5.0 cond-expr (arm)`.
- Functions: —.

## 122. src/features/marketing/components/FeatureMockups.tsx

S/B/F/L: 100.00% / 96.55% / 100.00% / 100.00%. Missing branch arms: 2.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `96:30 b12.1 binary-expr (arm)`; `97:31 b13.1 binary-expr (arm)`.
- Functions: —.

## 123. src/features/marketing/pages/FeaturesPage.tsx

S/B/F/L: 100.00% / 90.90% / 100.00% / 100.00%. Missing branch arms: 2.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `160:58 b0.1 cond-expr (arm)`; `487:57 b10.1 cond-expr (arm)`.
- Functions: —.

## 124. src/features/reports/components/ReportCard.tsx

S/B/F/L: 96.15% / 96.42% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `57:4 b2.0 if (arm)`; `79:59 b4.1 cond-expr (arm)`.
- Functions: —.

## 125. src/features/scheduling/components/availability/ExceptionForm.tsx

S/B/F/L: 100.00% / 95.55% / 100.00% / 100.00%. Missing branch arms: 2.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `50:53 b2.1 cond-expr (arm)`; `53:43 b4.1 binary-expr (arm)`.
- Functions: —.

## 126. src/lib/date-time-formatters.ts

S/B/F/L: 97.64% / 95.23% / 100.00% / 100.00%. Missing branch arms: 2.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `52:2 b9.0 if (arm)`; `54:2 b10.0 if (arm)`.
- Functions: —.

## 127. src/features/billing/components/BillingIntervalToggle.tsx

S/B/F/L: 66.66% / 95.65% / 66.66% / 66.66%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 36.
- Branches: `72:22 b7.0 cond-expr (arm)`.
- Functions: `(anonymous_1)@36`.

## 128. src/features/team/containers/TeamPageContainer.tsx

S/B/F/L: 81.81% / 91.66% / 77.77% / 81.81%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 175, 181.
- Branches: `79:29 b1.1 binary-expr (arm)`.
- Functions: `(anonymous_3)@175`; `(anonymous_4)@181`.

## 129. src/features/notifications/components/AppointmentNotificationActions.tsx

S/B/F/L: 90.90% / 90.00% / 80.00% / 89.47%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 107, 123.
- Branches: `70:50 b2.1 binary-expr (arm)`.
- Functions: `(anonymous_8)@107`; `(anonymous_9)@123`.

## 130. src/features/clinical-records/containers/ClinicalRecordsListContainer.tsx

S/B/F/L: 93.02% / 98.11% / 85.00% / 92.30%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 211, 223, 229.
- Branches: `47:15 b2.1 if (condition)`.
- Functions: `(anonymous_12)@211`; `(anonymous_14)@223`; `(anonymous_15)@229`.

## 131. src/features/auth/components/ProtectedAppRoute.tsx

S/B/F/L: 98.00% / 98.07% / 100.00% / 97.82%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 150.
- Branches: `149:2 b24.1 if (condition)`.
- Functions: —.

## 132. src/components/common/ConfirmDialog.tsx

S/B/F/L: 100.00% / 96.55% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: —.
- Branches: `43:18 b6.1 binary-expr (arm)`.
- Functions: —.

## 133. src/components/common/GlobalAlerts.tsx

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: —.
- Branches: `57:12 b2.1 cond-expr (arm)`.
- Functions: —.

## 134. src/components/common/SectionHeading.tsx

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: —.
- Branches: `42:52 b6.0 cond-expr (arm)`.
- Functions: —.

## 135. src/features/admin/hooks/useAdminClinicsPage.ts

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `96:81 b3.1 cond-expr (arm)`.
- Functions: —.

## 136. src/features/admin/hooks/useAdminUsersPage.ts

S/B/F/L: 100.00% / 90.00% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `96:69 b2.1 cond-expr (arm)`.
- Functions: —.

## 137. src/features/clinical-records/components/odontogram/OdontogramLegend.tsx

S/B/F/L: 100.00% / 85.71% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `23:25 b2.1 binary-expr (arm)`.
- Functions: —.

## 138. src/features/clinical-records/components/odontogram/OdontogramToothDetailsPanel.tsx

S/B/F/L: 100.00% / 94.73% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `51:6 b4.1 binary-expr (arm)`.
- Functions: —.

## 139. src/features/clinical-records/hooks/useClinicalRecords.ts

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `43:8 b3.1 if (condition)`.
- Functions: —.

## 140. src/features/clinical-records/hooks/usePatientClinicalTimeline.ts

S/B/F/L: 100.00% / 90.00% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `42:8 b3.1 if (condition)`.
- Functions: —.

## 141. src/features/clinical-records/utils/apply-clinical-dictation-fields.ts

S/B/F/L: 100.00% / 94.44% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `92:72 b8.1 binary-expr (arm)`.
- Functions: —.

## 142. src/features/clinical-records/utils/parse-dictation-odontogram.ts

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `120:71 b5.1 binary-expr (arm)`.
- Functions: —.

## 143. src/features/compliance/services/compliance.service.ts

S/B/F/L: 100.00% / 85.71% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `21:25 b2.1 cond-expr (arm)`.
- Functions: —.

## 144. src/features/dashboard/hooks/useDashboardPage.ts

S/B/F/L: 100.00% / 92.85% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `58:73 b4.1 binary-expr (arm)`.
- Functions: —.

## 145. src/features/finance/components/CategoriesPanel.tsx

S/B/F/L: 100.00% / 90.00% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `80:62 b1.1 binary-expr (arm)`.
- Functions: —.

## 146. src/features/finance/components/FinanceInsight.tsx

S/B/F/L: 100.00% / 83.33% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `24:16 b1.1 cond-expr (arm)`.
- Functions: —.

## 147. src/features/finance/hooks/useAiAssistantFinance.ts

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `31:8 b2.1 if (condition)`.
- Functions: —.

## 148. src/features/finance/hooks/useFinancePage.ts

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `128:47 b2.1 cond-expr (arm)`.
- Functions: —.

## 149. src/features/fiscal/components/InvoiceDetails.tsx

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `94:81 b4.1 cond-expr (arm)`.
- Functions: —.

## 150. src/features/fiscal/utils/invoice-format.ts

S/B/F/L: 100.00% / 75.00% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `5:42 b0.1 binary-expr (arm)`.
- Functions: —.

## 151. src/features/inventory/components/InventoryKpiGrid.tsx

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `44:36 b3.0 cond-expr (arm)`.
- Functions: —.

## 152. src/features/inventory/hooks/useAiAssistantInventory.ts

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `34:8 b2.1 if (condition)`.
- Functions: —.

## 153. src/features/marketing/components/PublicHeader.tsx

S/B/F/L: 100.00% / 97.50% / 100.00% / 100.00%. Missing branch arms: 1.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `157:24 b5.0 cond-expr (arm)`.
- Functions: —.

## 154. src/features/marketing/components/PublicLayout.tsx

S/B/F/L: 100.00% / 80.00% / 100.00% / 100.00%. Missing branch arms: 1.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `35:12 b2.0 cond-expr (arm)`.
- Functions: —.

## 155. src/features/marketing/components/RoleModulesPanel.tsx

S/B/F/L: 83.33% / 88.88% / 100.00% / 100.00%. Missing branch arms: 1.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `38:16 b1.0 if (arm)`.
- Functions: —.

## 156. src/features/marketing/components/RoleSwitcher.tsx

S/B/F/L: 94.11% / 87.50% / 100.00% / 100.00%. Missing branch arms: 1.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `47:2 b3.0 if (arm)`.
- Functions: —.

## 157. src/features/marketing/config/features.ts

S/B/F/L: 97.05% / 90.00% / 100.00% / 100.00%. Missing branch arms: 1.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `365:6 b2.0 if (arm)`.
- Functions: —.

## 158. src/features/marketing/pages/FaqPage.tsx

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%. Missing branch arms: 1.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: —.
- Branches: `117:22 b3.1 cond-expr (arm)`.
- Functions: —.

## 159. src/features/notifications/components/MessageHistoryDrawer.tsx

S/B/F/L: 100.00% / 95.00% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `20:36 b0.1 cond-expr (arm)`.
- Functions: —.

## 160. src/features/notifications/components/NotificationSendDrawer.tsx

S/B/F/L: 100.00% / 98.33% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `152:65 b15.1 binary-expr (arm)`.
- Functions: —.

## 161. src/features/notifications/hooks/useNotificationConsent.ts

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `53:93 b3.1 cond-expr (arm)`.
- Functions: —.

## 162. src/features/scheduling/components/availability/ExceptionEditModal.tsx

S/B/F/L: 94.11% / 95.00% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `39:4 b1.0 if (arm)`.
- Functions: —.

## 163. src/features/scheduling/components/mobile/MobileAppointmentCard.tsx

S/B/F/L: 100.00% / 94.11% / 100.00% / 100.00%. Missing branch arms: 1.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: —.
- Branches: `40:45 b5.1 binary-expr (arm)`.
- Functions: —.

## 164. src/features/scheduling/hooks/useAppointmentCancel.ts

S/B/F/L: 100.00% / 90.00% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `44:58 b4.1 cond-expr (arm)`.
- Functions: —.

## 165. src/features/scheduling/hooks/useAppointmentStatusChange.ts

S/B/F/L: 100.00% / 83.33% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `33:58 b2.1 cond-expr (arm)`.
- Functions: —.

## 166. src/features/scheduling/utils/appointment-state-machine.ts

S/B/F/L: 100.00% / 92.85% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `61:62 b5.1 binary-expr (arm)`.
- Functions: —.

## 167. src/features/team/hooks/useTeamPage.ts

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `42:25 b0.0 cond-expr (arm)`.
- Functions: —.

## 168. src/lib/date-time-input.ts

S/B/F/L: 97.50% / 96.15% / 100.00% / 100.00%. Missing branch arms: 1.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: `72:2 b12.0 if (arm)`.
- Functions: —.

## 169. src/services/http.ts

S/B/F/L: 100.00% / 98.11% / 100.00% / 100.00%. Missing branch arms: 1.

C candidate / C2 — remaining nullish fallback in error translation needs reachability review against the translator contract. HTTP refresh/retry/concurrency and error outcomes are tested; no exclusion added.

- Lines: —.
- Branches: `80:72 b5.1 binary-expr (arm)`.
- Functions: —.

## 170. src/App.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6.
- Branches: —.
- Functions: `App@5`.

## 171. src/main.tsx

S/B/F/L: 0.00% / 100.00% / 100.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 7, 9.
- Branches: —.
- Functions: —.

## 172. src/app/RootRoute.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

B / C2–C4 — composition/lazy-loading wiring remains incompletely executed by the unit harness. Real route guards are tested separately; browser integration is still useful.

- Lines: 13.
- Branches: —.
- Functions: `RootRoute@12`.

## 173. src/features/admin/pages/AdminClinicsPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `AdminClinicsPage@3`.

## 174. src/features/admin/pages/AdminDashboardPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `AdminDashboardPage@3`.

## 175. src/features/admin/pages/AdminFinancePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `AdminFinancePage@3`.

## 176. src/features/admin/pages/AdminUsersPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `AdminUsersPage@3`.

## 177. src/features/billing/pages/SubscriptionPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `SubscriptionPage@3`.

## 178. src/features/clinical-records/pages/ClinicalRecordEditorPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6-7.
- Branches: —.
- Functions: `ClinicalRecordEditorPage@5`.

## 179. src/features/clinical-records/pages/ClinicalRecordPrintPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6-7.
- Branches: —.
- Functions: `ClinicalRecordPrintPage@5`.

## 180. src/features/clinical-records/pages/ClinicalRecordsPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `ClinicalRecordsPage@3`.

## 181. src/features/compliance/pages/CompliancePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `CompliancePage@3`.

## 182. src/features/dashboard/pages/DashboardPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `DashboardPage@3`.

## 183. src/features/dashboard/pages/DentistHomePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `DentistHomePage@3`.

## 184. src/features/finance/pages/FinancePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `FinancePage@3`.

## 185. src/features/fiscal/pages/FiscalInvoicesPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `FiscalInvoicesPage@3`.

## 186. src/features/fiscal/pages/FiscalProfilePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 8.
- Branches: —.
- Functions: `FiscalProfilePage@7`.

## 187. src/features/inventory/pages/InventoryPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `InventoryPage@3`.

## 188. src/features/inventory/types/inventory.types.ts

S/B/F/L: 0.00% / 100.00% / 100.00% / 0.00%. Missing branch arms: 0.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 1, 12.
- Branches: —.
- Functions: —.

## 189. src/features/marketing/components/SectionDivider.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 21, 87, 89.
- Branches: —.
- Functions: `SectionDivider@86`.

## 190. src/features/marketing/components/TrialCtaSection.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

B / C3 — marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

- Lines: 9, 12, 57.
- Branches: —.
- Functions: `TrialCtaSection@11`; `(anonymous_1)@57`.

## 191. src/features/marketing/pages/AgendaFeaturePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `AgendaFeaturePage@5`.

## 192. src/features/marketing/pages/AiFeaturePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `AiFeaturePage@5`.

## 193. src/features/marketing/pages/ClinicalRecordsFeaturePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `ClinicalRecordsFeaturePage@5`.

## 194. src/features/marketing/pages/FinanceFeaturePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `FinanceFeaturePage@5`.

## 195. src/features/marketing/pages/FiscalFeaturePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `FiscalFeaturePage@5`.

## 196. src/features/marketing/pages/ForDentistPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `ForDentistPage@5`.

## 197. src/features/marketing/pages/ForManagerPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `ForManagerPage@5`.

## 198. src/features/marketing/pages/ForNewClinicPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `ForNewClinicPage@5`.

## 199. src/features/marketing/pages/ForSecretaryPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `ForSecretaryPage@5`.

## 200. src/features/marketing/pages/InventoryFeaturePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `InventoryFeaturePage@5`.

## 201. src/features/marketing/pages/PatientsFeaturePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `PatientsFeaturePage@5`.

## 202. src/features/marketing/pages/ReportsFeaturePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `ReportsFeaturePage@5`.

## 203. src/features/marketing/pages/WhatsappFeaturePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 6, 10.
- Branches: —.
- Functions: `WhatsappFeaturePage@5`.

## 204. src/features/patients/pages/PatientsAttentionPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `PatientsAttentionPage@3`.

## 205. src/features/patients/pages/PatientsPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `PatientsPage@3`.

## 206. src/features/reports/pages/ReportsPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `ReportsPage@3`.

## 207. src/features/scheduling/pages/AppointmentsPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `AppointmentsPage@3`.

## 208. src/features/scheduling/pages/SchedulePage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `SchedulePage@3`.

## 209. src/features/settings/pages/SettingsPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `SettingsPage@3`.

## 210. src/features/team/pages/TeamPage.tsx

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%. Missing branch arms: 0.

D candidate / C4 — thin declarative renderer/bootstrap; useful route/browser integration coverage is preferable to call-count padding. Retained in coverage, not excluded.

- Lines: 4.
- Branches: —.
- Functions: `TeamPage@3`.

## 211. src/app/route-components.tsx

S/B/F/L: 33.33% / 100.00% / 0.00% / 33.33%. Missing branch arms: 0.

B / C2–C4 — composition/lazy-loading wiring remains incompletely executed by the unit harness. Real route guards are tested separately; browser integration is still useful.

- Lines: 4-5, 10-11, 16-17, 22-23, 28-29, 34-35, 40-41, 46-47, 52-53, 58-59, 64-65, 70-71, 76-77, 82-83, 88-89, 94-95, 100-101, 106-107, 112-113, 118-119, 124-125, 130-131, 136-137, 142-143, 148-149, 154-155, 160-161, 167-168, 173-174, 179-180, 185-186, 191-192, 197-198, 203-204, 209-210, 215-216, 221-222, 227-228, 233-234, 239-240, 246-247, 252-253, 258-259, 264-265, 270-271, 276-277, 282-283, 288-289, 294-295, 300-301, 306-307, 312-313, 318-319, 324-325, 330-331, 336-337.
- Branches: —.
- Functions: `(anonymous_0)@4`; `(anonymous_1)@5`; `(anonymous_2)@10`; `(anonymous_3)@11`; `(anonymous_4)@16`; `(anonymous_5)@17`; `(anonymous_6)@22`; `(anonymous_7)@23`; `(anonymous_8)@28`; `(anonymous_9)@29`; `(anonymous_10)@34`; `(anonymous_11)@35`; `(anonymous_12)@40`; `(anonymous_13)@41`; `(anonymous_14)@46`; `(anonymous_15)@47`; `(anonymous_16)@52`; `(anonymous_17)@53`; `(anonymous_18)@58`; `(anonymous_19)@59`; `(anonymous_20)@64`; `(anonymous_21)@65`; `(anonymous_22)@70`; `(anonymous_23)@71`; `(anonymous_24)@76`; `(anonymous_25)@77`; `(anonymous_26)@82`; `(anonymous_27)@83`; `(anonymous_28)@88`; `(anonymous_29)@89`; `(anonymous_30)@94`; `(anonymous_31)@95`; `(anonymous_32)@100`; `(anonymous_33)@101`; `(anonymous_34)@106`; `(anonymous_35)@107`; `(anonymous_36)@112`; `(anonymous_37)@113`; `(anonymous_38)@118`; `(anonymous_39)@119`; `(anonymous_40)@124`; `(anonymous_41)@125`; `(anonymous_42)@130`; `(anonymous_43)@131`; `(anonymous_44)@136`; `(anonymous_45)@137`; `(anonymous_46)@142`; `(anonymous_47)@143`; `(anonymous_48)@148`; `(anonymous_49)@149`; `(anonymous_50)@154`; `(anonymous_51)@155`; `(anonymous_52)@160`; `(anonymous_53)@161`; `(anonymous_54)@167`; `(anonymous_55)@168`; `(anonymous_56)@173`; `(anonymous_57)@174`; `(anonymous_58)@179`; `(anonymous_59)@180`; `(anonymous_60)@185`; `(anonymous_61)@186`; `(anonymous_62)@191`; `(anonymous_63)@192`; `(anonymous_64)@197`; `(anonymous_65)@198`; `(anonymous_66)@203`; `(anonymous_67)@204`; `(anonymous_68)@209`; `(anonymous_69)@210`; `(anonymous_70)@215`; `(anonymous_71)@216`; `(anonymous_72)@221`; `(anonymous_73)@222`; `(anonymous_74)@227`; `(anonymous_75)@228`; `(anonymous_76)@233`; `(anonymous_77)@234`; `(anonymous_78)@239`; `(anonymous_79)@240`; `(anonymous_80)@246`; `(anonymous_81)@247`; `(anonymous_82)@252`; `(anonymous_83)@253`; `(anonymous_84)@258`; `(anonymous_85)@259`; `(anonymous_86)@264`; `(anonymous_87)@265`; `(anonymous_88)@270`; `(anonymous_89)@271`; `(anonymous_90)@276`; `(anonymous_91)@277`; `(anonymous_92)@282`; `(anonymous_93)@283`; `(anonymous_94)@288`; `(anonymous_95)@289`; `(anonymous_96)@294`; `(anonymous_97)@295`; `(anonymous_98)@300`; `(anonymous_99)@301`; `(anonymous_100)@306`; `(anonymous_101)@307`; `(anonymous_102)@312`; `(anonymous_103)@313`; `(anonymous_104)@318`; `(anonymous_105)@319`; `(anonymous_106)@324`; `(anonymous_107)@325`; `(anonymous_108)@330`; `(anonymous_109)@331`; `(anonymous_110)@336`; `(anonymous_111)@337`.

## 212. src/features/finance/components/FixedExpenseForm.tsx

S/B/F/L: 75.00% / 100.00% / 75.00% / 75.00%. Missing branch arms: 0.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 99, 126.
- Branches: —.
- Functions: `(anonymous_4)@99`; `(anonymous_6)@126`.

## 213. src/features/reports/components/ReportPreviewPanel.tsx

S/B/F/L: 80.00% / 100.00% / 100.00% / 80.00%. Missing branch arms: 0.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 22.
- Branches: —.
- Functions: —.

## 214. src/features/scheduling/components/appointments/AppointmentStatusActions.tsx

S/B/F/L: 81.81% / 100.00% / 66.66% / 80.00%. Missing branch arms: 0.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 65, 78.
- Branches: —.
- Functions: `(anonymous_3)@65`; `(anonymous_4)@78`.

## 215. src/features/scheduling/components/appointments/StatusActionMenu.tsx

S/B/F/L: 81.81% / 100.00% / 66.66% / 80.00%. Missing branch arms: 0.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 55, 69.
- Branches: —.
- Functions: `(anonymous_3)@55`; `(anonymous_4)@69`.

## 216. src/features/finance/components/TransactionForm.tsx

S/B/F/L: 88.88% / 100.00% / 88.88% / 88.88%. Missing branch arms: 0.

A review / C1–C3 — remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

- Lines: 134.
- Branches: —.
- Functions: `(anonymous_7)@134`.

## 217. src/components/common/ListToolbar.tsx

S/B/F/L: 95.65% / 100.00% / 92.30% / 95.00%. Missing branch arms: 0.

B / C2–C3 — remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

- Lines: 169.
- Branches: —.
- Functions: `(anonymous_10)@169`.

## 218. src/features/clinical-records/hooks/useUnsavedChangesGuard.ts

S/B/F/L: 93.75% / 100.00% / 83.33% / 100.00%. Missing branch arms: 0.

B / C2 — remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

- Lines: —.
- Branches: —.
- Functions: `(anonymous_5)@62`.
