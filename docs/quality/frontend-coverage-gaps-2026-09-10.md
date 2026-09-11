# Frontend coverage inventory — 2026-09-11 continuation

The first global table records the baseline at 2f21c07. The continuation checkpoint below records the newer full-suite measurement and closed domain entries. The filename is retained for existing links.

**Verdict: PARTIAL.** A/B entries are still meaningful testable behavior or edge cases. Listing them is not a claim that they were tested or that convergence was achieved. No coverage exclusions or coverage-ignore comments were added. All categories remain in the raw denominator.

| Metric | Starting baseline at 2f21c07 | Covered / total |
| --- | ---: | ---: |
| statements | 91.58% | 9005 / 9832 |
| branches | 89.47% | 7276 / 8132 |
| functions | 88.51% | 2983 / 3370 |
| lines | 92.18% | 8297 / 9000 |

A = meaningful behavior still requiring tests. B = meaningful edge case still requiring tests. C = proven dead code (removed, recorded in the handoff). D = non-behavioral wiring/static declarations; no exclusion applied. E = defensive/unreachable arm with a specific invariant. F = browser integration requiring manual/E2E QA. Mixed files keep their testable A/B gaps; browser limitations do not waive unrelated logic.

The starting full report contained **217 files** with uncovered locations. Closed scheduling, clinical, finance, fiscal, inventory and protected-route sections have been removed; surviving locations in those domains have exact D/E/F rationales. Other domains retain their open A/B locations pending their batches.

## Continuation from 2f21c07 — in progress

Starting full-suite baseline: 383 suites / 5,060 tests, S/B/F/L 91.58% / 89.47% / 88.51% / 92.18%. A newer full-suite checkpoint is recorded below.

Scheduling: 46 suites / 623 tests passed in the complete domain run after correcting an aggregate timeout in a payment test. Domain-only coverage: S99.20% / B98.36% / F97.96% / L99.71%. The domain command omits the existing router tests covering calendar-return-search; its absence is not a new production gap. All surviving scheduling locations below now have exact D/E rationale. No exclusions or production scheduling changes. Scheduling added 65 tests in three new suites plus existing suites. ProtectedAppRoute adds one missing-user access test and measures 100% across all four metrics.

Clinical domain: 40 suites / 660 tests passed; +59 tests relative to this continuation start. Domain S/B/F/L: 97.69% / 96.24% / 98.88% / 99.04%. Closed meaningful editor, autosave, list, template, timeline, attachment, print, odontogram and dictation gaps. Exact remaining D/E/F explanations follow. Confirmed fixes: stuck autosave indicator; prior patient print state; expired dictation responses/timers; duplicate pending microphone requests; expired recorder stop events. Typecheck/Biome results are recorded in the handoff. The newer full-suite checkpoint is recorded below.

Full coverage checkpoint after finance/fiscal: **386 suites / 5,262 tests passed**, +202 tests since 2f21c07. Global S/B/F/L: **92.95% / 93.07% / 90.63% / 93.42%**. This is a progress measurement, not final convergence or completion of all validation gates.

Finance: 33 domain suites / 451 tests passed. Coverage in the complete run: 99.85% / 98.74% / 99.61% / 99.84% (S/B/F/L). Covered classifier apply errors, diagnosis refresh/retry, role-restricted generation, category changes, hook failures, form dates/amounts/colors, mobile/desktop transaction actions, nullable data, margins, contextual filter clearing and expense-category editing. Confirmed fixes expose failed category application/diagnosis refresh and prevent duplicate Escape dismissal in the three finance edit dialogs. Removed the unreachable default return in ProcedureMarginsSection: its private SortKey union and selector admit exactly revenue, volume, margin and name; all four cases are tested.

Fiscal: the previous complete domain run passed 16 suites / 428 tests; the subsequent reload regression suite passed all 41 tests (11 added), then all fiscal tests ran in the full checkpoint above. Coverage in that complete run: 99.40% / 99.56% / 98.86% / 99.57% (S/B/F/L). Covered nullable profile/invoice fields, form integration, overlapping workspaces, warning combinations, filter clearing, picker pagination/reset and escaped print output including zero ISS. Confirmed fixes discard obsolete CEP lookups, filter/reload/picker responses, preserve current filters after mutation completion and dismiss the picker once on Escape. Invoice hook focused coverage is 100% in all four metrics.

Typecheck, Biome and git diff --check passed through these commits. Full validation beyond this coverage checkpoint (standalone tests, build, unused checks and both Knip modes) remains pending for convergence. No push, merge, branch switch, dependencies, API contracts, role permissions or coverage exclusions changed. Browser checks remain unexecuted.

Inventory continuation after the full checkpoint: **30 suites / 432 tests passed**, +60 inventory tests and one suite since that checkpoint. Domain S/B/F/L: **98.74% / 98.46% / 99.59% / 99.26%**. The previous global measurement remains a checkpoint; it has not yet been rerun after these inventory changes.

Closed product create/edit validation, optional fields, numeric/date payloads, failure/retry and reset; stock movement quantities, zero adjustment, busy state and retry; category validation, create/update/delete errors, nested cancellation and lifecycle; critical mobile/desktop states, missing values, filters, KPIs, partial anomaly datasets, copilot failures and formatting. Existing owner category access and plan gates remain unchanged. Four dialog regressions confirmed duplicate Escape dismissal (product, movement, category manager and details), now fixed. Two history regressions confirmed old product responses/errors replacing the current history, now discarded.

Removed StockMovementHistory's unreachable refreshKey < 0 branch: the sole production source initializes the counter to zero and only increments it. The effect retains refreshKey as an intentional reload dependency using a one-line Biome useExhaustiveDependencies rationale; this is a lint annotation, not a coverage ignore. Remaining inventory locations have exact D/E/F reasons below. Two new anomaly assertions initially matched both KPI labels and badges; corrected selectors passed in the entire domain rerun. Typecheck, Biome and diff checks passed. Browser QA and the later full validation sequence remain pending.

Priority order: P0 role/access/consent boundaries; P1 scheduling, clinical correctness and finance/fiscal calculations; P2 forms, mutations, persistence and stale-response recovery; P3 interaction, filtering and lifecycle; P4 nullable display/formatting; P5 marketing/static presentation. Mixed files close higher-priority behavior first. Original location IDs remain stable references, not an alphabetical work queue.

## 1. src/features/clinical-records/components/VoiceDictationCard.tsx

Classification: **D/E/F**. All testable branches identified in this batch are covered; no exclusion or ignore directive. Browser media, rendering and printing limits remain in the [manual QA checklist](frontend-manual-qa-2026-09-11.md).

S/B/F/L: 96.20% / 91.93% / 100.00% / 98.30%.

- 82: b0.1 — E: getSupportedMimeType is called only after the MediaRecorder support guard; the browser global cannot disappear within this synchronous format-selection path.
- 324: b15.0 — E: reset controls are available only after recording/processing ends; onstop or its fallback clears the stop timer before those states.
- 328: b16.0 — E: success/error/timeout clear the processing timer before reset controls become available.
- 332: b17.0 — E: completion/error clear the progress timer; timeout also clears it, including the tested slow-conversion case.
- 365: b18.0 — E: processAudio is invoked synchronously by onstop after its mounted guard; no async boundary separates these checks.
- 380: b19.0 — E: onstop accepts only the current recorder once; prior processing ends or reset clears its timer before another recording can process.
- 383: b20.0 — E: unmount/reset/completion cancel this timeout; abort paths also clear it before leaving processing.
- 424: b28.1 — D: import.meta.env.DEV is a build-time flag. The production build removes this debug-only metadata block; build and browser QA remain required final checks.
- 437: b30.0 — E: the mounted/aborted check already ran after conversion; only synchronous size validation and timer cancellation occur before this repeat guard.
- 453: b32.0 — E: unmount/reset/timeout and settled requests cancel this progress timer before leaving processing.
- 534: b44.0 — E: stopping immediately hides its button and clears the recording interval; the previous stop timer is settled or reset before another stop can occur.
- 537: b45.0 — E: unmount clears the fallback; accepted onstop clears it before marking processing complete.
- 558: b47.0 — E: the start button exists only in idle/requesting states and is disabled while requesting; read-only rendering hides it entirely.
- 615: b58.0 — E: processed/expired recorders clear mediaRecorderRef; the recorder-identity guard above rejects their duplicate stop events first.
- 694: b69.1 — E: every normalized odontogram suggestion initializes an editable note entry; deselection preserves it and reset removes both collections together.
- 759: b78.1 — E: edit-mode controls are rendered only for fields with a nonempty current value in the same render.
- 999: b102.1 — E: success initializes a mode for every suggested field key; reset clears fields and modes together before rendering idle.
- 1131: b111.1 — E: normalized odontogram suggestions and their editable note entries are initialized together; note inputs never delete keys.
- 1235: b115.1 — E: every transition to error assigns a non-null message; reset clears the message while transitioning to idle.
- 1255: b117.1 — D/E: debug-only fallback; effectiveMime is always recorder.mimeType, a preferred MIME, or the nonempty audio/webm default.

## 2. src/features/marketing/components/AnimatedImpactSection.tsx

Classification: **A**. untested browser-visible animation/interaction behavior; not a static configuration file and not excluded.

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%.

- Uncovered lines: 29, 88-89, 91-92, 98, 101, 103-104, 106-109, 112-113, 115-117, 119-121, 124-125, 128, 132-133, 135, 137, 168, 170, 201.
- Uncovered functions: `formatValue@87`; `useCountUp@100`; `(anonymous_2)@103`; `(anonymous_3)@115`; `(anonymous_4)@125`; `ImpactCard@131`; `AnimatedImpactSection@167`; `(anonymous_7)@201`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 88:2 b0.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!decimalDigits) {` |
| 88:2 b0.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!decimalDigits) {` |
| 104:4 b1.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!isActive) return` |
| 104:4 b1.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!isActive) return` |
| 107:4 b2.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (reduceMotion) {` |
| 107:4 b2.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (reduceMotion) {` |
| 121:6 b3.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (progress < 1) raf = window.requestAnimationFrame(tick)` |
| 121:6 b3.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (progress < 1) raf = window.requestAnimationFrame(tick)` |
| 142:20 b4.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',` |
| 142:50 b4.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',` |
| 144:44 b5.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '${Math.min(index * 60, 300)}ms' : '0ms' }}` |
| 144:79 b5.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '${Math.min(index * 60, 300)}ms' : '0ms' }}` |
| 152:9 b6.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{metric.displayPrefix && (` |
| 153:10 b6.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<span className="text-base font-medium text-slate-400">{metric.displayPrefix}</span>` |
| 182:24 b7.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',` |
| 182:54 b7.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',` |
| 209:24 b8.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'opacity-100' : 'opacity-0',` |
| 209:40 b8.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'opacity-100' : 'opacity-0',` |
| 211:48 b9.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '380ms' : '0ms' }}` |
| 211:58 b9.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '380ms' : '0ms' }}` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 87 formatValue | `function formatValue(raw: number, decimalDigits?: number): string { if (!decimalDigits) { return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(raw)` |
| 100 useCountUp | `function useCountUp(target: number, isActive: boolean): number { const [value, setValue] = useState(0)` |
| 103 (anonymous_2) | `useEffect(() => { if (!isActive) return` |
| 115 (anonymous_3) | `const tick = (now: number) => { const elapsed = now - startTime const progress = Math.min(elapsed / COUNT_UP_DURATION_MS, 1)` |
| 125 (anonymous_4) | `return () => window.cancelAnimationFrame(raf) }, [isActive, target])` |
| 131 ImpactCard | `function ImpactCard({ metric, index }: { metric: ImpactMetric; index: number }) { const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.12) const Icon = metric.icon` |
| 167 AnimatedImpactSection | `export function AnimatedImpactSection() { const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.12)` |
| 201 (anonymous_7) | `<ImpactCard key={metric.id} metric={metric} index={index} /> ))} </div>` |

## 4. src/features/patients/containers/PatientsAttentionContainer.tsx

Classification: **A**. Open A/B: keyboard activation and descendant-event handling, WhatsApp filtering, resizing pagination, nullable contact/visit/next-appointment/professional presentation, drawer dismissal and reason overflow. These are meaningful application behaviors; no exclusion is justified.

S/B/F/L: 73.91% / 81.00% / 75.00% / 74.41%.

- Uncovered lines: 149, 499-500, 613, 615-618, 681-682, 709.
- Uncovered functions: `(anonymous_5)@149`; `(anonymous_15)@498`; `(anonymous_19)@613`; `(anonymous_20)@614`; `(anonymous_22)@680`; `(anonymous_23)@709`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 149:64 b3.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={!!item} onOpenChange={(open: boolean) => !open && onClose()}>` |
| 149:73 b3.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={!!item} onOpenChange={(open: boolean) => !open && onClose()}>` |
| 414:54 b24.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `tone={summary.total > 0 ? 'warning' : 'neutral'}` |
| 420:62 b25.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `tone={summary.pendingPayment > 0 ? 'danger' : 'neutral'}` |
| 426:57 b26.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `tone={summary.inactive > 0 ? 'warning' : 'neutral'}` |
| 432:72 b27.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `tone={summary.withoutUpcomingAppointment > 0 ? 'info' : 'neutral'}` |
| 531:157 b32.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? '${filteredItems.length} paciente${filteredItems.length !== 1 ? 's' : ''} encontrado${filteredItems.length !== 1 ? 's' : ''}${hasFilters ? ' com os filtros aplicados' : ''}.'` |
| 542:64 b34.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `hasFilters ? 'Nenhum paciente encontrado' : 'Todos os pacientes estão em dia'` |
| 547:24 b35.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'Nenhuma pendência encontrada.'` |
| 595:32 b37.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'Todos os pacientes estão em dia'` |
| 600:32 b38.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'Nenhuma pendência encontrada.'` |
| 615:26 b39.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (e.target !== e.currentTarget) return` |
| 615:26 b39.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (e.target !== e.currentTarget) return` |
| 616:26 b40.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (e.key === 'Enter' \|\| e.key === ' ') {` |
| 616:26 b40.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (e.key === 'Enter' \|\| e.key === ' ') {` |
| 616:30 b41.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (e.key === 'Enter' \|\| e.key === ' ') {` |
| 616:51 b41.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (e.key === 'Enter' \|\| e.key === ' ') {` |
| 636:30 b42.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">` |
| 654:28 b43.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<span className="text-muted-foreground">—</span>` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 149 (anonymous_5) | `<Dialog.Root open={!!item} onOpenChange={(open: boolean) => !open && onClose()}> <Dialog.Portal> <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150" />` |
| 498 (anonymous_15) | `onValueChange={(v) => { setWhatsappFilter(v as WhatsAppFilter) setPage(1)` |
| 613 (anonymous_19) | `onClick={() => setSelectedItem(item)} onKeyDown={(e) => { if (e.target !== e.currentTarget) return` |
| 614 (anonymous_20) | `onKeyDown={(e) => { if (e.target !== e.currentTarget) return if (e.key === 'Enter' \|\| e.key === ' ') {` |
| 680 (anonymous_22) | `onPageSizeChange={(s) => { setPageSize(s) setPage(1)` |
| 709 (anonymous_23) | `onClose={() => setSelectedItem(null)} avatarUrl={selectedItem ? avatarsByIdentifier[selectedItem.identifier] : undefined} />` |

## 6. src/features/marketing/components/landing/DentalArchScene.tsx

Classification: **F**. Three.js geometry/materials, renderer frames and WebGL lighting require a real canvas/GPU. Unit mocks cannot certify the rendered scene.

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%.

- Uncovered lines: 8, 16-21, 24-25, 30-32, 37, 44, 54-58, 60-64, 66, 68-77, 109-114, 118-119, 130, 132-133, 135, 137-140, 143-144, 147, 164-166, 169-171, 174-175, 194-198, 201-202, 204-205, 209-211, 215-217, 220-225, 228, 245, 253, 296, 308.
- Uncovered functions: `archPoint@43`; `(anonymous_1)@54`; `(anonymous_2)@56`; `(anonymous_3)@68`; `Tooth@108`; `(anonymous_5)@118`; `(anonymous_6)@130`; `(anonymous_7)@132`; `(anonymous_8)@163`; `(anonymous_9)@168`; `(anonymous_10)@173`; `ArchContents@193`; `(anonymous_12)@205`; `(anonymous_13)@209`; `(anonymous_14)@210`; `(anonymous_15)@215`; `(anonymous_16)@245`; `(anonymous_17)@253`; `DentalArchScene@295`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 69:34 b0.0 cond-expr (arm) | F: see file rationale. | `const target = (COUNT === 1 ? 0.5 : k / (COUNT - 1)) * total` |
| 69:40 b0.1 cond-expr (arm) | F: see file rationale. | `const target = (COUNT === 1 ? 0.5 : k / (COUNT - 1)) * total` |
| 71:11 b1.0 binary-expr (arm) | F: see file rationale. | `while (i < SAMPLES && cum[i] < target) i++` |
| 71:26 b1.1 binary-expr (arm) | F: see file rationale. | `while (i < SAMPLES && cum[i] < target) i++` |
| 72:42 b2.0 binary-expr (arm) | F: see file rationale. | `const segT = (target - cum[i - 1]) / (cum[i] - cum[i - 1] \|\| 1)` |
| 72:65 b2.1 binary-expr (arm) | F: see file rationale. | `const segT = (target - cum[i - 1]) / (cum[i] - cum[i - 1] \|\| 1)` |
| 84:28 b3.0 cond-expr (arm) | F: see file rationale. | `variant: absT < 0.3 ? 'incisor' : absT < 0.62 ? 'canine' : 'molar',` |
| 84:40 b3.1 cond-expr (arm) | F: see file rationale. | `variant: absT < 0.3 ? 'incisor' : absT < 0.62 ? 'canine' : 'molar',` |
| 84:54 b4.0 cond-expr (arm) | F: see file rationale. | `variant: absT < 0.3 ? 'incisor' : absT < 0.62 ? 'canine' : 'molar',` |
| 84:65 b4.1 cond-expr (arm) | F: see file rationale. | `variant: absT < 0.3 ? 'incisor' : absT < 0.62 ? 'canine' : 'molar',` |
| 135:33 b5.0 cond-expr (arm) | F: see file rationale. | `lift.current += ((isActive ? 1 : 0) - lift.current) * Math.min(1, delta * 6)` |
| 135:37 b5.1 cond-expr (arm) | F: see file rationale. | `lift.current += ((isActive ? 1 : 0) - lift.current) * Math.min(1, delta * 6)` |
| 138:4 b6.0 if (arm) | F: see file rationale. | `if (node) {` |
| 138:4 b6.1 if (condition) | F: see file rationale. | `if (node) {` |
| 196:22 b7.0 binary-expr (arm) | F: see file rationale. | `const activeIndex = hovered ?? selectedIndex` |
| 196:33 b7.1 binary-expr (arm) | F: see file rationale. | `const activeIndex = hovered ?? selectedIndex` |
| 220:36 b8.0 cond-expr (arm) | F: see file rationale. | `const damp = hovered !== null ? 0.12 : 1` |
| 220:43 b8.1 cond-expr (arm) | F: see file rationale. | `const damp = hovered !== null ? 0.12 : 1` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 43 archPoint | `function archPoint(theta: number) { return { x: Math.sin(theta) * RX, y: 0, z: Math.cos(theta) * RZ } }` |
| 54 (anonymous_1) | `const PLACEMENTS: ToothPlacement[] = (() => { const SAMPLES = 240 const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => {` |
| 56 (anonymous_2) | `const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => { const theta = (-1 + (2 * i) / SAMPLES) * THETA_MAX return { theta, ...archPoint(theta) }` |
| 68 (anonymous_3) | `return DENTAL_WORKFLOWS.map((_, k) => { const target = (COUNT === 1 ? 0.5 : k / (COUNT - 1)) * total let i = 1` |
| 108 Tooth | `}) { const visible = useRef<THREE.Group>(null) const lift = useRef(0)` |
| 118 (anonymous_5) | `const material = useMemo(() => { return new THREE.MeshStandardMaterial({ color: ENAMEL,` |
| 130 (anonymous_6) | `useEffect(() => () => material.dispose(), [material]) useFrame((_, delta) => {` |
| 132 (anonymous_7) | `useFrame((_, delta) => { elapsed.current += delta // Calm, slightly slow ease toward the active state.` |
| 163 (anonymous_8) | `onPointerOver={(event: ThreeEvent<PointerEvent>) => { event.stopPropagation() onActivate(index)` |
| 168 (anonymous_9) | `onPointerOut={(event: ThreeEvent<PointerEvent>) => { event.stopPropagation() onClear()` |
| 173 (anonymous_10) | `onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation() onSelect(index)` |
| 193 ArchContents | `}) { const [hovered, setHovered] = useState<number \| null>(null) const elapsed = useRef(0)` |
| 205 (anonymous_12) | `() => PLACEMENTS[activeIndex].position.clone().add(new THREE.Vector3(0, 1.05, 0.15)), [activeIndex], )` |
| 209 (anonymous_13) | `useEffect(() => { return () => { document.body.style.cursor = ''` |
| 210 (anonymous_14) | `return () => { document.body.style.cursor = '' }` |
| 215 (anonymous_15) | `useFrame((state, delta) => { elapsed.current += delta const time = elapsed.current` |
| 245 (anonymous_16) | `<Tooth key={workflow.key} geometry={toothGeometry}` |
| 253 (anonymous_17) | `onClear={() => setHovered(null)} onSelect={onSelect} />` |
| 295 DentalArchScene | `}) { return ( <Canvas` |

## 7. src/features/dashboard/components/TodayAppointmentsChart.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 75.47% / 76.62% / 64.70% / 77.27%.

- Uncovered lines: 53-56, 79-80, 165-166, 183-184.
- Uncovered functions: `CustomTooltip@52`; `ActiveSector@70`; `(anonymous_7)@165`; `(anonymous_8)@166`; `(anonymous_9)@183`; `(anonymous_10)@184`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 53:2 b2.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!active \|\| !payload?.length) return null` |
| 53:2 b2.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!active \|\| !payload?.length) return null` |
| 53:6 b3.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!active \|\| !payload?.length) return null` |
| 53:17 b3.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!active \|\| !payload?.length) return null` |
| 63:39 b4.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{row.count} {row.count === 1 ? 'consulta' : 'consultas'}` |
| 63:52 b4.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{row.count} {row.count === 1 ? 'consulta' : 'consultas'}` |
| 72:9 b5.0 default-arg (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `cx = 0,` |
| 73:9 b6.0 default-arg (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `cy = 0,` |
| 74:18 b7.0 default-arg (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `innerRadius = 0,` |
| 75:18 b8.0 default-arg (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `outerRadius = 0,` |
| 76:17 b9.0 default-arg (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `startAngle = 0,` |
| 77:15 b10.0 default-arg (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `endAngle = 0,` |
| 177:55 b15.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `paddingAngle={pieRows.length > 1 ? 2 : 0}` |
| 183:30 b17.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `onMouseEnter={isHoverDevice ? (_, index) => setHoveredIndex(index) : undefined}` |
| 184:30 b18.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `onMouseLeave={isHoverDevice ? () => setHoveredIndex(null) : undefined}` |
| 247:20 b29.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!active) return` |
| 253:20 b30.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (isHoverDevice) setSelectedIndex(null)` |
| 259:20 b31.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!active) return` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 52 CustomTooltip | `}) { if (!active \|\| !payload?.length) return null const row = payload[0].payload` |
| 70 ActiveSector | `function ActiveSector(props: PieSectorDataItem) { const { cx = 0,` |
| 165 (anonymous_7) | `onMouseDown={(e) => e.preventDefault()} onTouchStart={(e) => e.preventDefault()} >` |
| 166 (anonymous_8) | `onTouchStart={(e) => e.preventDefault()} > <ResponsiveContainer width="100%" height={300}>` |
| 183 (anonymous_9) | `onMouseEnter={isHoverDevice ? (_, index) => setHoveredIndex(index) : undefined} onMouseLeave={isHoverDevice ? () => setHoveredIndex(null) : undefined} >` |
| 184 (anonymous_10) | `onMouseLeave={isHoverDevice ? () => setHoveredIndex(null) : undefined} > {pieRows.map((row) => (` |

## 8. src/features/clinical-records/containers/ClinicalRecordEditorContainer.tsx

Classification: **E**. Forty tests pass. S95.36% / B92.37% / F100% / L99.20%. Added patient odontogram persistence, draft-save error/retry, optional-load failure, stale unmount response, alert throttling/reset/cleanup, all section toggles, mixed dictation application preserving existing conditions, and chief-complaint-only dictation.

Remaining exact branches (no exclusions):

- Line 293/default switch arm: all seven SectionId members are handled and all callers pass literal members.
- Lines 301, 362 and 383 read-only guards: template/dictation sidebar only exists when canEditClinicalContent is true, with handlers captured in the same render.
- Line 311 missing template target: OTHER is the only unmapped category and ClinicalTemplateSelectorPanel disables its button.
- Line 318 absent target section: all five mapped target-field categories also have a TEMPLATE_SECTION_MAP entry.
- Line 322 save read-only guard: real sticky/action bars expose save only for editable records.
- Line 337 odontogram read-only guard: OdontogramSection receives readOnly and disables mutation controls.
- Line 383 empty suggestions guard: VoiceDictationCard calls onApplyOdontogram only when its selected payload has length greater than zero.
- Line 666 null private-notes fallback: in read-only mode the surrounding section only renders when record.privateNotes is truthy.

## 9. src/components/layout/AppShell.tsx

Classification: **A**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 97.84% / 81.05% / 96.96% / 97.59%.

- Uncovered lines: 179, 195.
- Uncovered functions: `cycleTheme@194`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 177:18 b2.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}` |
| 195:33 b3.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setTheme(theme === 'light' ? 'dark' : 'light')` |
| 195:42 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setTheme(theme === 'light' ? 'dark' : 'light')` |
| 198:51 b4.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const label = theme === 'light' ? 'Tema claro' : 'Tema escuro'` |
| 199:41 b5.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const Icon = theme === 'light' ? Sun : Moon` |
| 270:88 b23.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const primaryRoutes = user?.role ? (MOBILE_PRIMARY_ROUTES_BY_ROLE[user.role] ?? []) : []` |
| 270:82 b24.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const primaryRoutes = user?.role ? (MOBILE_PRIMARY_ROUTES_BY_ROLE[user.role] ?? []) : []` |
| 327:38 b27.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `hasActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50',` |
| 335:38 b28.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `hasActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/40',` |
| 351:53 b30.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `aria-current={active ? 'page' : undefined}` |
| 354:42 b31.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `active && 'bg-sidebar-accent font-semibold text-sidebar-primary',` |
| 380:43 b33.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `aria-current={active ? 'page' : undefined}` |
| 383:32 b34.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `active && 'bg-sidebar-accent text-sidebar-primary',` |
| 464:45 b39.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `aria-current={active ? 'page' : undefined}` |
| 468:28 b40.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'bg-sidebar-accent text-sidebar-primary'` |
| 494:53 b41.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{user ? getUserDisplayName(user) : 'Usuário'}` |
| 545:16 b43.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: ' · expira hoje'}` |
| 544:61 b44.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? ' · ${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}'` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 194 cycleTheme | `function cycleTheme() { setTheme(theme === 'light' ? 'dark' : 'light') }` |

## 10. src/features/inventory/components/CategoryManagerModal.tsx

Classification: **E**. Exact residual explanations follow; no coverage exclusion or ignore directive was added.

S/B/F/L: 98.92% / 98.33% / 100.00% / 100.00%.

- 156:4 b8.0 — E: confirmation controls are mounted only for an existing deletingCategory; the missing-target guard has no callable user control.

## 12. src/features/finance/components/ExpenseClassifyAction.tsx

Classification: **E**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 100.00% / 96.66% / 100.00% / 100.00%.

- 115:44 b9.1 — E: SOURCE_LABEL covers every ClassificationSource variant accepted by the typed classifier response.

## 13. src/features/notifications/pages/NotificationSettingsPage.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 74.19% / 75.80% / 71.42% / 74.19%.

- Uncovered lines: 64-66, 71-73, 75, 222.
- Uncovered functions: `(anonymous_3)@70`; `(anonymous_5)@222`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 55:46 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `title: enabled ? 'WhatsApp ativado' : 'WhatsApp desativado',` |
| 60:12 b4.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'Notificações WhatsApp desativadas.',` |
| 58:14 b5.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'WhatsApp real ativo. Mensagens só serão enviadas por ação explícita.'` |
| 64:44 b6.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const msg = err instanceof ApiError ? err.message : 'Erro ao salvar preferências.'` |
| 64:58 b6.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const msg = err instanceof ApiError ? err.message : 'Erro ao salvar preferências.'` |
| 130:24 b13.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'WhatsApp real ativo'` |
| 137:24 b15.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'Mensagens enviadas via Meta WhatsApp Business Cloud API.'` |
| 140:24 b16.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'Ative para enviar mensagens via WhatsApp Cloud API.'` |
| 139:40 b17.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: isRealProvider && providerConfigured` |
| 142:26 b18.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'Configure as credenciais da Meta antes de ativar o envio real.'` |
| 169:48 b23.2 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{whatsappEnabled && isRealProvider && providerConfigured && (` |
| 170:12 b23.3 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<div className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300">` |
| 175:29 b24.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{isRealProvider && !providerConfigured && (` |
| 176:12 b24.2 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-300">` |
| 199:14 b27.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<p className="text-xs text-muted-foreground">` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 70 (anonymous_3) | `const handleHoursChange = async (hours: number) => { setLocalHours(hours) try {` |
| 222 (anonymous_5) | `onValueChange={(value) => handleHoursChange(Number(value))} disabled={isSaving} >` |

## 14. src/features/patients/components/AvatarCropModal.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 90.80% / 79.16% / 91.42% / 93.03%.

- Uncovered lines: 89-91, 93, 95, 134, 184-185, 205-206, 426.
- Uncovered functions: `(anonymous_4)@89`; `(anonymous_5)@95`; `(anonymous_31)@425`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 87:4 b1.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!shell \|\| typeof ResizeObserver === 'undefined') return` |
| 87:18 b2.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!shell \|\| typeof ResizeObserver === 'undefined') return` |
| 133:4 b3.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (cropSize === clampedCropSize) return` |
| 147:70 b5.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `return next.x === current.x && next.y === current.y ? current : next` |
| 166:57 b9.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setCropSize((current) => (current === nextCropSize ? current : nextCropSize))` |
| 183:6 b11.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (rafId.current !== null) {` |
| 204:6 b12.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (rafId.current !== null) {` |
| 222:6 b13.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!activeInteraction.current) return` |
| 230:10 b15.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!interaction \|\| !pp) return` |
| 271:16 b19.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: nextTransform.offset` |
| 330:54 b21.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const nextNaturalSize = { w: el.naturalWidth \|\| 1, h: el.naturalHeight \|\| 1 }` |
| 330:80 b22.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const nextNaturalSize = { w: el.naturalWidth \|\| 1, h: el.naturalHeight \|\| 1 }` |
| 378:4 b23.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!img) return` |
| 426:8 b26.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!isOpen) onCancel()` |
| 426:8 b26.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!isOpen) onCancel()` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 89 (anonymous_4) | `const observer = new ResizeObserver(([entry]) => { const nextWidth = Math.min(STAGE_WIDTH, Math.max(1, entry.contentRect.width)) setStageWidth(nextWidth)` |
| 95 (anonymous_5) | `return () => observer.disconnect() }, [])` |
| 425 (anonymous_31) | `onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}` |

## 16. src/features/scheduling/components/appointments/AppointmentClinicalSection.tsx

Classification: **E**. handleOpen is bound only to the record-present button and captures that same render's record. A record-absent render exposes creation instead. The missing-record return cannot be activated through this UI.

Measured after this domain batch: S/B/F/L 95.65% / 95.83% / 100.00% / 100.00%.

Uncovered lines: none. Functions: none.

- 37:4 b2.0 (if): E, invariant above.

## 17. src/features/auth/components/AuthForm.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 70.42% / 81.42% / 88.88% / 72.46%.

- Uncovered lines: 93-94, 104, 106-109, 115, 117, 125, 132, 134-137, 139, 359-361.
- Uncovered functions: `getAuthErrorMessage@358`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 58:4 b0.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (mode === 'login' \|\| mode === 'register') {` |
| 92:4 b5.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!isLogin && !isValidPersonName(normalizedResponsibleName)) {` |
| 97:4 b7.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!isLogin && !acceptedTerms) {` |
| 107:6 b9.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (isLogin) {` |
| 114:13 b9.1 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `} else {` |
| 134:30 b10.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const title = isLogin ? 'Não foi possível entrar' : 'Não foi possível criar a conta'` |
| 134:58 b10.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const title = isLogin ? 'Não foi possível entrar' : 'Não foi possível criar a conta'` |
| 292:14 b23.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<>` |
| 329:8 b28.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<div className="mt-4">` |
| 359:2 b33.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (error instanceof ApiError) return error.message` |
| 359:2 b33.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (error instanceof ApiError) return error.message` |
| 360:2 b34.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (error instanceof Error) return error.message` |
| 360:2 b34.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (error instanceof Error) return error.message` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 358 getAuthErrorMessage | `function getAuthErrorMessage(error: unknown) { if (error instanceof ApiError) return error.message if (error instanceof Error) return error.message` |

## 18. src/features/dashboard/containers/DashboardPageContainer.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 84.37% / 77.58% / 65.21% / 83.87%.

- Uncovered lines: 85, 180, 276, 309, 313.
- Uncovered functions: `(anonymous_5)@85`; `(anonymous_8)@180`; `(anonymous_9)@181`; `(anonymous_10)@182`; `(anonymous_16)@276`; `(anonymous_17)@284`; `(anonymous_19)@309`; `(anonymous_20)@313`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 85:25 b1.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))` |
| 85:40 b1.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))` |
| 85:58 b2.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))` |
| 85:73 b2.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))` |
| 96:54 b3.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `(a.paymentStatus === 'PAYMENT_PENDING' \|\| a.paymentStatus === 'PARTIALLY_PAID') &&` |
| 118:16 b5.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{error && <InlineFeedback>{error}</InlineFeedback>}` |
| 209:76 b12.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? '${appointments.length} consulta${appointments.length !== 1 ? 's' : ''} aguardando confirmação'` |
| 240:22 b14.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<span className="block truncate text-xs text-muted-foreground">` |
| 307:8 b22.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<ul className="mt-4 divide-y divide-border">` |
| 319:19 b23.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{appt.service && (` |
| 320:20 b23.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<span className="block truncate text-xs text-muted-foreground">` |
| 360:47 b25.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{appt.profile?.displayName ? ' · ${appt.profile.displayName}' : ''}` |
| 370:61 b27.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{appt.paymentStatus === 'PARTIALLY_PAID' ? 'Parcial' : 'Pendente'}` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 85 (anonymous_5) | `.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')) .slice(0, 8), [appointments],` |
| 180 (anonymous_8) | `onClose={() => setDrawerAppointment(null)} onStatusChange={() => {}} onCancelRequest={() => {}}` |
| 181 (anonymous_9) | `onStatusChange={() => {}} onCancelRequest={() => {}} />` |
| 182 (anonymous_10) | `onCancelRequest={() => {}} /> </AppPage>` |
| 276 (anonymous_16) | `onClose={() => setNotifyTarget(null)} template={confirmationTemplate} appointmentId={notifyTarget?.id ?? ''}` |
| 284 (anonymous_17) | `onSent={() => {}} /> )}` |
| 309 (anonymous_19) | `<li key={appt.id}> <button type="button"` |
| 313 (anonymous_20) | `onClick={() => onAppointmentClick(appt)} > <span className="min-w-0">` |

## 20. src/features/clinical-records/components/ImageAttachmentPanel.tsx

Classification: **D/E/F**. All testable branches identified in this batch are covered; no exclusion or ignore directive. Browser media, rendering and printing limits remain in the [manual QA checklist](frontend-manual-qa-2026-09-11.md).

S/B/F/L: 99.34% / 96.46% / 100.00% / 100.00%.

- 34: b0.0 — E: the Vite client routes mount this component only in a browser. No SSR rendering path invokes it without navigator/window.
- 392: b36.1 — E: the real confirmation dialog only exposes Confirm while open, which requires a non-null confirmDeleteId.
- 430: b38.1 — E: preview is opened only by an attachment whose dataBase64 is truthy; the captured preview object is not mutated.
- 483: b44.1 — E: this effect cleanup is returned only after assigning timerRef.current unconditionally.

## 21. src/features/marketing/components/LandingIntegrationsSection.tsx

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%.

- Uncovered lines: 13, 29-30, 32, 74-77, 79, 115, 128.
- Uncovered functions: `IntegrationCard@28`; `LandingIntegrationsSection@73`; `(anonymous_2)@76`; `(anonymous_3)@76`; `(anonymous_4)@77`; `(anonymous_5)@115`; `(anonymous_6)@128`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 37:20 b0.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',` |
| 37:50 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',` |
| 39:44 b1.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '${Math.min(index * 65, 300)}ms' : '0ms' }}` |
| 39:79 b1.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '${Math.min(index * 65, 300)}ms' : '0ms' }}` |
| 45:12 b2.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<img` |
| 52:12 b2.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Icon className="h-6 w-6 text-primary" aria-hidden="true" />` |
| 89:24 b3.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',` |
| 89:54 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',` |
| 104:24 b4.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'opacity-100' : 'opacity-0',` |
| 104:40 b4.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'opacity-100' : 'opacity-0',` |
| 106:48 b5.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '100ms' : '0ms' }}` |
| 106:58 b5.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '100ms' : '0ms' }}` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 28 IntegrationCard | `}) { const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.12) const Icon = integration.icon` |
| 73 LandingIntegrationsSection | `export function LandingIntegrationsSection() { const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>(0.12) const featured = FEATURED_INTEGRATIONS.map((name) =>` |
| 76 (anonymous_2) | `integrationCards.find((integration) => integration.name === name), ).filter((integration): integration is IntegrationCardData => Boolean(integration))` |
| 76 (anonymous_3) | `integrationCards.find((integration) => integration.name === name), ).filter((integration): integration is IntegrationCardData => Boolean(integration))` |
| 77 (anonymous_4) | `).filter((integration): integration is IntegrationCardData => Boolean(integration)) return (` |
| 115 (anonymous_5) | `<div key={text} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-slate-300"` |
| 128 (anonymous_6) | `<IntegrationCard key={integration.name} integration={integration} index={index} /> ))} </div>` |

## 22. src/features/scheduling/components/availability/ExceptionManager.tsx

Classification: **E**. Modal save/delete callbacks are exposed only with an editingException. Closing the modal removes those controls. Both guards run before the first await, so a later close cannot turn the captured target null at those checks.

Measured after this domain batch: S/B/F/L 96.96% / 95.00% / 100.00% / 100.00%.

Uncovered lines: none. Functions: none.

- 91:4 b6.0 (if): E, invariant above.
- 115:4 b9.0 (if): E, invariant above.

## 23. src/features/settings/containers/SettingsPageContainer.tsx

Classification: **B**. Open B: obsolete postal-code lookup rejection, remaining profile validation alternatives, nullable profile presentation and conditional member counters. Postal-code success/failure, stale success rejection and formatted profile saves were already covered by the starting committed tests; those are not being described as newly missing.

S/B/F/L: 99.35% / 92.77% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 192:8 b25.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (cancelled) return` |
| 225:4 b30.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (form.name.trim()) payload.name = form.name.trim()` |
| 423:73 b50.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<p className="text-sm text-foreground">{profile?.timezone ?? 'Não informado'}</p>` |
| 427:72 b51.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<p className="text-sm text-foreground">{profile?.country ?? 'Não informado'}</p>` |
| 568:61 b62.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{connected ? (status?.calendarSummary ?? 'Conectado') : 'Não conectado'}` |
| 636:8 b70.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'Anual'` |
| 641:6 b72.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? new Date(status.currentPeriodEnd).toLocaleDateString('pt-BR')` |
| 644:6 b73.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? new Date(status.trialEndsAt).toLocaleDateString('pt-BR')` |
| 680:10 b76.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `) : null}` |
| 673:43 b80.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{status.status === 'trialing' && trialDate && (` |
| 674:12 b80.2 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<span className="text-xs text-muted-foreground">· Teste até {trialDate}</span>` |
| 677:12 b81.2 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<span className="text-xs text-muted-foreground">· Renova em {renewalDate}</span>` |

## 24. src/features/fiscal/containers/FiscalInvoicesPageContainer.tsx

Classification: **E**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 99.15% / 99.02% / 100.00% / 100.00%.

- 245:4 b26.0 — E: the cancel confirmation is rendered only while cancelTarget exists; there is no user control that can call confirmation without that target.

## 25. src/features/marketing/components/DataMigrationSection.tsx

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%.

- Uncovered lines: 9, 33, 41, 65-67, 106, 144.
- Uncovered functions: `DataMigrationSection@40`; `(anonymous_1)@64`; `(anonymous_2)@106`; `(anonymous_3)@144`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 73:26 b0.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'border-emerald-200 bg-emerald-50/50'` |
| 74:26 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'border-slate-200 bg-white',` |
| 82:30 b1.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'bg-emerald-100 text-emerald-600'` |
| 83:30 b1.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'bg-slate-100 text-slate-500',` |
| 96:42 b2.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `step.accent ? 'text-emerald-800' : 'text-slate-900',` |
| 96:63 b2.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `step.accent ? 'text-emerald-800' : 'text-slate-900',` |
| 111:32 b3.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'bg-emerald-100 text-emerald-700'` |
| 112:32 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'bg-slate-100 text-slate-500',` |
| 121:19 b4.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{!isLast && (` |
| 122:20 b4.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<div` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 40 DataMigrationSection | `export function DataMigrationSection() { return ( <section className="bg-white py-24 lg:py-32" aria-labelledby="migration-heading">` |
| 64 (anonymous_1) | `{PIPELINE_STEPS.map((step, index) => { const Icon = step.icon const isLast = index === PIPELINE_STEPS.length - 1` |
| 106 (anonymous_2) | `<span key={chip} className={cn(` |
| 144 (anonymous_3) | `<li key={benefit} className="flex items-start gap-2.5"> <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"` |

## 26. src/features/marketing/components/landing/FlowOrbit.tsx

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%.

- Uncovered lines: 20, 22, 26, 42-43, 45-51, 54, 59, 88, 132, 178-179, 226-227, 229, 231.
- Uncovered functions: `(anonymous_0)@20`; `useStaticOrbit@41`; `(anonymous_2)@45`; `(anonymous_3)@49`; `(anonymous_4)@51`; `OrbitPoster@58`; `StaticOrbit@87`; `(anonymous_7)@132`; `(anonymous_8)@177`; `FlowOrbit@225`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 46:4 b0.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (typeof window === 'undefined' \|\| typeof window.matchMedia !== 'function') return` |
| 46:4 b0.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (typeof window === 'undefined' \|\| typeof window.matchMedia !== 'function') return` |
| 46:8 b1.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (typeof window === 'undefined' \|\| typeof window.matchMedia !== 'function') return` |
| 46:41 b1.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (typeof window === 'undefined' \|\| typeof window.matchMedia !== 'function') return` |
| 54:9 b2.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `return reduced \|\| smallOrCoarse` |
| 54:20 b2.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `return reduced \|\| smallOrCoarse` |
| 229:2 b3.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (isStatic) return <StaticOrbit />` |
| 229:2 b3.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (isStatic) return <StaticOrbit />` |
| 234:8 b4.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Suspense fallback={<OrbitPoster />}>` |
| 238:8 b4.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<OrbitPoster />` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 20 (anonymous_0) | `const FlowOrbitScene = lazy(() => import('./FlowOrbitScene')) const ORBIT_RADIUS = 34` |
| 41 useStaticOrbit | `function useStaticOrbit(): boolean { const reduced = usePrefersReducedMotion() const [smallOrCoarse, setSmallOrCoarse] = useState(false)` |
| 45 (anonymous_2) | `useEffect(() => { if (typeof window === 'undefined' \|\| typeof window.matchMedia !== 'function') return const query = window.matchMedia('(max-width: 767px), (pointer: coarse)')` |
| 49 (anonymous_3) | `const onChange = (event: MediaQueryListEvent) => setSmallOrCoarse(event.matches) query.addEventListener('change', onChange) return () => query.removeEventListener('change', onChange)` |
| 51 (anonymous_4) | `return () => query.removeEventListener('change', onChange) }, [])` |
| 58 OrbitPoster | `function OrbitPoster() { return ( <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-2xl">` |
| 87 StaticOrbit | `function StaticOrbit() { return ( <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-2xl">` |
| 132 (anonymous_7) | `<g key={satellite.label}> <line x1={satellite.x}` |
| 177 (anonymous_8) | `{SATELLITES.map((satellite) => { const { Icon } = satellite return (` |
| 225 FlowOrbit | `export default function FlowOrbit() { const isStatic = useStaticOrbit() const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>(0.05)` |

## 27. src/features/scheduling/components/mobile/MobileAgendaTimeline.tsx

Classification: **E**. endTime is the result of formatWallTime, which delegates to safeFormatTimeBR. Both a valid time and its default Hora não informada fallback are nonempty. The falsy endTime metadata arm is unreachable even for missing backend time data.

Measured after this domain batch: S/B/F/L 100.00% / 98.41% / 100.00% / 100.00%.

Uncovered lines: none. Functions: none.

- 199:56 b24.1 (cond-expr): E, invariant above.

## 28. src/features/scheduling/utils/week-calendar-layout.ts

Classification: **E**. specialExceptions is synchronously filtered to entries with both startTime and endTime before the loop. No await or mutation occurs between filter and this repeated guard.

Measured after this domain batch: S/B/F/L 98.85% / 98.91% / 100.00% / 100.00%.

Uncovered lines: none. Functions: none.

- 177:4 b37.0 (if): E, invariant above.

## 29. src/features/inventory/components/StockMovementModal.tsx

Classification: **E**. Exact residual explanations follow; no coverage exclusion or ignore directive was added.

S/B/F/L: 94.64% / 90.38% / 100.00% / 96.00%.

- 82:4 b3.0 — E: the submit control exists only while a product is selected; the synchronous handler cannot lose its captured product between the form event and this guard.
- 88:6 b5.0 — E: the real number input is required with min=0; native constraint validation blocks empty, negative and non-finite submissions before React onSubmit. Tests exercise invalid native values and explicit zero without synthesizing impossible submit events.
- 105:48 b9.1 — E: adjustment submission already rejected a null parsedNewQuantity; the fallback is defensive typing only. Explicit zero adjustment is tested.
- 106:42 b10.1 — E: non-adjustment submission already rejected null/non-positive parsedQuantity; this fallback cannot be selected by a valid submission.
- 328:59 b24.1 — E: the only caller receives the browser-validated required number input with min=0; native invalid values are blocked before this parser executes.
- Lines 89-90 — E: the native-validation invariant at the adjustment guard above prevents this error-return body from executing on user submission.

## 30. src/features/marketing/pages/PlansPage.tsx

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 97.67% / 84.48% / 95.83% / 97.61%.

- Uncovered lines: 445.
- Uncovered functions: `(anonymous_14)@445`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 116:60 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',` |
| 173:60 b1.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',` |
| 445:65 b10.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `onToggle={() => setOpenFaq(openFaq === index ? null : index)}` |
| 445:72 b10.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `onToggle={() => setOpenFaq(openFaq === index ? null : index)}` |
| 475:57 b11.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `ctaVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',` |
| 534:50 b12.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',` |
| 539:65 b14.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '${index * 100}ms' : '0ms' }}` |
| 702:22 b24.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isOpen && 'rotate-180',` |
| 708:8 b25.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<div` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 445 (anonymous_14) | `onToggle={() => setOpenFaq(openFaq === index ? null : index)} /> ))}` |

## 31. src/features/dashboard/containers/ProductivityCenter.tsx

Classification: **B**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 66:87 b0.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', cls[priority] ?? cls.LOW)}` |
| 68:27 b1.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{labels[priority] ?? priority}` |
| 110:30 b3.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const c = config[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' }` |
| 181:8 b5.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'Nenhuma consulta agendada para hoje'` |
| 229:8 b10.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'Consultas concluídas sem pagamento registrado'` |
| 289:44 b15.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `tone={monthNet >= 0 ? 'success' : 'danger'}` |
| 294:53 b16.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `tone={pendingReceivables > 0 ? 'warning' : 'neutral'}` |
| 313:46 b18.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? '${count} paciente${count === 1 ? '' : 's'} sem consulta há mais de 60 dias'` |
| 462:70 b32.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `tone={data.today.pendingPaymentsCount > 0 ? 'warning' : 'neutral'}` |

## 32. src/features/marketing/components/VideoSection.tsx

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%.

- Uncovered lines: 8-10, 13-14, 16, 51, 82.
- Uncovered functions: `VideoSection@12`; `(anonymous_1)@51`; `(anonymous_2)@82`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 26:24 b0.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',` |
| 26:54 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',` |
| 65:24 b1.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',` |
| 65:54 b1.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',` |
| 67:48 b2.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '120ms' : '0ms' }}` |
| 67:58 b2.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '120ms' : '0ms' }}` |
| 71:14 b3.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<iframe` |
| 80:14 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<button` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 12 VideoSection | `export function VideoSection() { const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.22) const [isPlaying, setIsPlaying] = useState(false)` |
| 51 (anonymous_1) | `<div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-950/[0.03]"` |
| 82 (anonymous_2) | `onClick={() => setIsPlaying(true)} className="group absolute inset-0 w-full cursor-pointer" aria-label="Assistir vídeo do DentalFlow"` |

## 33. src/features/marketing/components/landing/FlowOrbitScene.tsx

Classification: **F**. Three.js camera, renderer frames, geometry and effects require a real WebGL context and browser rendering QA.

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%.

- Uncovered lines: 20-23, 27, 39-41, 46-58, 60-62, 65-66, 83-84, 86-88, 90-93, 96, 134-137, 139, 141, 144-145, 151-153, 157-159, 161-166, 169, 189, 217.
- Uncovered functions: `(anonymous_0)@39`; `useGlowTexture@45`; `(anonymous_2)@46`; `(anonymous_3)@65`; `OrbitNode@82`; `(anonymous_5)@86`; `OrbitContent@133`; `(anonymous_7)@139`; `(anonymous_8)@151`; `(anonymous_9)@157`; `(anonymous_10)@189`; `FlowOrbitScene@216`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 52:4 b0.0 if (arm) | F: see file rationale. | `if (ctx) {` |
| 52:4 b0.1 if (condition) | F: see file rationale. | `if (ctx) {` |
| 88:4 b1.0 if (arm) | F: see file rationale. | `if (!node) return` |
| 88:4 b1.1 if (condition) | F: see file rationale. | `if (!node) return` |
| 144:4 b2.0 if (arm) | F: see file rationale. | `if (ringRef.current) {` |
| 144:4 b2.1 if (condition) | F: see file rationale. | `if (ringRef.current) {` |
| 159:4 b3.0 if (arm) | F: see file rationale. | `if (ringRef.current) ringRef.current.rotation.y += delta * 0.12` |
| 159:4 b3.1 if (condition) | F: see file rationale. | `if (ringRef.current) ringRef.current.rotation.y += delta * 0.12` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 39 (anonymous_0) | `const NODE_POSITIONS = MODULES.map((_, index) => { const angle = (index / MODULES.length) * Math.PI * 2 return new THREE.Vector3(Math.cos(angle) * ORBIT_RADIUS, 0, Math.sin(angle) * ORBIT_RADIUS)` |
| 45 useGlowTexture | `function useGlowTexture() { const texture = useMemo(() => { const size = 128` |
| 46 (anonymous_2) | `const texture = useMemo(() => { const size = 128 const canvas = document.createElement('canvas')` |
| 65 (anonymous_3) | `useEffect(() => () => texture.dispose(), [texture]) return texture }` |
| 82 OrbitNode | `}) { const traveler = useRef<THREE.Sprite>(null) const { Icon } = module` |
| 86 (anonymous_5) | `useFrame(() => { const node = traveler.current if (!node) return` |
| 133 OrbitContent | `function OrbitContent() { const ringRef = useRef<THREE.Group>(null) const progress = useRef(0)` |
| 139 (anonymous_7) | `useEffect(() => { // GSAP drives the seamless inward light-trace flow (linear, infinite loop). const flow = gsap.to(progress, { current: 1, duration: 5, ease: 'none', repeat: -1 })` |
| 151 (anonymous_8) | `return () => { flow.kill() entrance?.kill()` |
| 157 (anonymous_9) | `useFrame((state, delta) => { elapsed.current += delta if (ringRef.current) ringRef.current.rotation.y += delta * 0.12` |
| 189 (anonymous_10) | `<OrbitNode key={module.label} module={module}` |
| 216 FlowOrbitScene | `export default function FlowOrbitScene() { return ( <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[42rem]">` |

## 35. src/features/team/components/ClinicMemberFormModal.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 86.36% / 87.50% / 72.22% / 85.93%.

- Uncovered lines: 104, 107, 133-134, 169, 199, 223-224, 230.
- Uncovered functions: `(anonymous_4)@102`; `(anonymous_9)@169`; `(anonymous_10)@199`; `(anonymous_14)@222`; `(anonymous_15)@230`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 105:14 b5.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? err.message` |
| 106:14 b5.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'Não foi possível carregar os horários do profissional.'` |
| 132:4 b10.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (rawPhone && !isValidBrazilianPhone(rawPhone)) {` |
| 132:20 b11.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (rawPhone && !isValidBrazilianPhone(rawPhone)) {` |
| 162:52 b15.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setError(err instanceof Error ? err.message : 'Erro ao salvar usuário.')` |
| 169:55 b16.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>` |
| 169:66 b16.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>` |
| 338:41 b29.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isActive: member.isActive ? 'true' : 'false',` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 102 (anonymous_4) | `.catch((err) => { const msg = err instanceof Error` |
| 169 (anonymous_9) | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}> <Dialog.Portal> <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />` |
| 199 (anonymous_10) | `<MemberTypeSelector value={form.role} onChange={(role) => set('role', role)} /> </div>` |
| 222 (anonymous_14) | `onPhoneChange={(value) => { set('phone', value) setPhoneError(null)` |
| 230 (anonymous_15) | `<Select value={form.isActive} onValueChange={(value) => set('isActive', value)}> <SelectTrigger id="memberIsActive"> <SelectValue placeholder="Selecione o status" />` |

## 37. src/features/clinical-records/hooks/useClinicalRecordAutosave.ts

Classification: **E**. Focused coverage S100% / B96.66% / F100% / L100%. Twelve tests cover real draft clearing, indicator expiration, new edits, stale successes/errors, cancellation and timer cleanup. The only uncovered branch is line 90, the false arm of `if (timerRef.current)` in the draft-effect cleanup: that cleanup is returned only after assigning the timeout unconditionally. No ignore directive or exclusion.

## 40. src/features/billing/pages/SubscriptionSuccessPage.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 91.86% / 88.88% / 100.00% / 93.67%.

- Uncovered lines: 782-783, 788-789, 795.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 235:6 b5.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (cancelled) return` |
| 643:53 b23.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const renewalDate = status.status === 'trialing' ? status.trialEndsAt : status.currentPeriodEnd` |
| 646:63 b24.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{ icon: Package, label: 'Plano', value: status.planName ?? 'Não definido' },` |
| 781:2 b27.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (interval === 'monthly') return 'Mensal'` |
| 782:2 b28.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (interval === 'annual') return 'Anual'` |
| 782:2 b28.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (interval === 'annual') return 'Anual'` |
| 787:2 b29.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!iso) return 'Não definido'` |

## 41. src/features/patients/components/CameraPreviewModal.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 87.30% / 80.55% / 80.00% / 94.64%.

- Uncovered lines: 100, 108-109.
- Uncovered functions: `(anonymous_8)@99`; `(anonymous_9)@107`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 42:8 b3.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (videoRef.current) {` |
| 47:8 b4.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (cancelled) return` |
| 70:4 b9.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!video) return` |
| 76:4 b12.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!ctx) return` |
| 81:8 b13.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!blob) return` |
| 100:8 b14.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!isOpen) handleCancel()` |
| 100:8 b14.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!isOpen) handleCancel()` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 99 (anonymous_8) | `onOpenChange={(isOpen) => { if (!isOpen) handleCancel() }}` |
| 107 (anonymous_9) | `onEscapeKeyDown={(e) => { e.preventDefault() handleCancel()` |

## 43. src/features/clinical-records/containers/ClinicalRecordPrintContainer.tsx

Classification: **D/E/F**. All testable branches identified in this batch are covered; no exclusion or ignore directive. Browser media, rendering and printing limits remain in the [manual QA checklist](frontend-manual-qa-2026-09-11.md).

S/B/F/L: 98.00% / 98.63% / 100.00% / 100.00%.

- 80: b8.0 — E: successful preparation assigns non-null PrintData before clearing loading; failed preparation sets error, which returns before this guard.

## 45. src/features/marketing/components/PricingSection.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 100.00% / 79.41% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 38:54 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',` |
| 65:54 b1.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',` |
| 67:58 b2.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}` |
| 90:54 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',` |
| 92:58 b4.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '450ms' : '0ms' }}` |
| 139:50 b5.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',` |
| 144:65 b7.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `style={{ transitionDelay: isVisible ? '${index * 100}ms' : '0ms' }}` |

## 47. src/components/common/AiAssistantCard.tsx

Classification: **A**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 90.90% / 94.73% / 94.11% / 94.52%.

- Uncovered lines: 60, 66, 105, 114.
- Uncovered functions: `(anonymous_13)@252`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 59:4 b0.1 switch (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `case 'warning':` |
| 65:4 b0.2 switch (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `case 'danger':` |
| 229:4 b17.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (state === 'loading' \|\| effectiveDisabledReason) return` |
| 247:4 b20.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!result) return` |
| 296:69 b30.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />` |
| 438:216 b46.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'Esta análise foi gerada para o período ${formatDate(result.periodStart)} – ${formatDate(result.periodEnd)}.${canGenerate ? ' Clique em "Atualizar análise" para gerar para o período atual.' : ' O responsável da clínica pode atualizá-la a qualquer momento.'}'` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 252 (anonymous_13) | `setTimeout(() => setCopied(false), 2000) } catch { // clipboard not available in some environments — ignore silently` |

## 48. src/features/billing/components/PricingCard.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 95.91% / 94.59% / 92.30% / 94.87%.

- Uncovered lines: 303, 343.
- Uncovered functions: `(anonymous_8)@303`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 62:66 b3.2 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const tagline = plan.description ?? PLAN_TAGLINES[plan.slug] ?? null` |
| 63:44 b4.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const PlanIcon = PLAN_ICONS[plan.slug] ?? Rocket` |
| 109:81 b13.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{isCurrentPlan && <BillingStatusBadge status={billingStatus?.status ?? 'active'} />}` |
| 136:66 b18.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `Sem preço {billingInterval === 'MONTHLY' ? 'mensal' : 'anual'} disponível.` |
| 217:70 b21.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{formatCurrencyBR((plan.campaign.promotionalPriceMonthly ?? 0) / 100)}` |
| 339:2 b39.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (actionType === 'checkout' \|\| actionType === 'change_plan' \|\| actionType === 'reactivate') {` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 303 (anonymous_8) | `onAnimationEnd={() => setRocketAnimating(false)} /> ) : (` |

## 50. src/features/admin/components/UserFormModal.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 98.48% / 92.10% / 95.00% / 98.43%.

- Uncovered lines: 170.
- Uncovered functions: `(anonymous_9)@170`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 145:29 b17.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `phone: rawPhone \|\| undefined,` |
| 148:52 b19.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `clinicId: showClinicId ? form.clinicId \|\| undefined : null,` |
| 158:52 b22.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `clinicId: showClinicId ? form.clinicId \|\| undefined : undefined,` |
| 170:55 b24.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>` |
| 170:66 b24.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>` |
| 228:24 b29.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!CLINIC_REQUIRED_ROLES.includes(v as UserRole)) {` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 170 (anonymous_9) | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}> <Dialog.Portal> <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />` |

## 51. src/features/clinical-records/components/OdontogramSection.tsx

Classification: **D/E/F**. All testable branches identified in this batch are covered; no exclusion or ignore directive. Browser media, rendering and printing limits remain in the [manual QA checklist](frontend-manual-qa-2026-09-11.md).

S/B/F/L: 96.15% / 93.42% / 100.00% / 100.00%.

- 48: b4.0 — E: the real details panel hides condition controls when readOnly; its callback captures the same render.
- 61: b6.0 — E: the real details panel marks its notes input readOnly, so user edits cannot dispatch this callback.
- 72: b7.0 — E: the multi-condition panel is rendered only when !readOnly and selected teeth exist.
- 190: b23.1 — E: the details panel renders no condition controls without a selected tooth.
- 193: b24.1 — E: the details panel renders no notes input without a selected tooth.

## 52. src/features/marketing/components/landing/DentalArchSection.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 100.00% / 62.50% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 32:28 b0.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `duration: reduced ? 0 : 0.32,` |
| 35:35 b1.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `staggerChildren: reduced ? 0 : 0.07,` |
| 36:33 b2.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `delayChildren: reduced ? 0 : 0.05,` |
| 39:58 b3.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `exit: { opacity: 0, transition: { duration: reduced ? 0 : 0.28, ease: 'easeInOut' as const } },` |
| 42:40 b4.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `initial: { opacity: 0, y: reduced ? 0 : 8 },` |
| 43:67 b5.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `animate: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.4, ease: EASE_OUT } },` |

## 53. src/features/patients/containers/PatientsPageContainer.tsx

Classification: **B**. Open B: singular/plural patient counts and populated/loading clinical timeline data. Search, keyboard activation, appointment details, nullable contacts, dismissal, avatar feedback and list retry now have integration tests. The no-filter empty-list branches are E: usePatientsPage returns every patient when both date filters are absent; the list only renders with patients present or during loading, which selects skeletons.

S/B/F/L: 100.00% / 95.04% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 171:87 b9.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{patient.totalAppointments} consulta{patient.totalAppointments !== 1 ? 's' : ''}` |
| 188:50 b12.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{patient.canceledAppointments !== 1 ? 's' : ''}` |
| 616:69 b45.1 cond-expr (arm) | E: no-filter empty-list state contradicts usePatientsPage filtering plus the enclosing list/loading guards. | `hasFilters ? 'Nenhum resultado para sua busca' : 'Nenhum paciente encontrado.'` |
| 621:24 b46.1 cond-expr (arm) | E: no-filter empty-list state contradicts usePatientsPage filtering plus the enclosing list/loading guards. | `: undefined` |
| 664:32 b49.1 cond-expr (arm) | E: no-filter empty-list state contradicts usePatientsPage filtering plus the enclosing list/loading guards. | `: 'Nenhum paciente encontrado.'` |
| 669:32 b50.1 cond-expr (arm) | E: no-filter empty-list state contradicts usePatientsPage filtering plus the enclosing list/loading guards. | `: undefined` |

## 55. src/features/finance/components/TransactionsTable.tsx

Classification: **E**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 100.00% / 94.59% / 100.00% / 100.00%.

- 152:55 b8.1 — E: SOURCE_LABEL contains every member of FinancialTransactionSource (MANUAL, SERVICE_PAYMENT, FIXED_EXPENSE and ADJUSTMENT).
- 281:61 b17.1 — E: desktop uses the same complete FinancialTransactionSource mapping as the mobile card.

## 56. src/features/dashboard/containers/DentistHomePageContainer.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 96.55% / 90.00% / 88.88% / 95.83%.

- Uncovered lines: 213, 279.
- Uncovered functions: `(anonymous_23)@213`; `(anonymous_24)@279`; `(anonymous_25)@281`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 81:59 b3.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `() => [...appointments].sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),` |
| 81:92 b4.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `() => [...appointments].sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),` |
| 145:49 b14.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `tone={statusCounts.confirmed > 0 ? 'success' : 'neutral'}` |
| 220:26 b19.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<span className="block truncate text-xs text-muted-foreground">` |
| 313:12 b24.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<p className="mt-0.5 truncate text-sm text-muted-foreground">` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 213 (anonymous_23) | `onClick={() => setDrawerAppointment(appt)} > <span className="min-w-0">` |
| 279 (anonymous_24) | `onClose={() => setDrawerAppointment(null)} onStatusChange={handleStatusChange} onCancelRequest={() => {}}` |
| 281 (anonymous_25) | `onCancelRequest={() => {}} /> </AppPage>` |

## 57. src/features/inventory/hooks/usePersistedCopilot.ts

Classification: **E**. Exact residual explanations follow; no coverage exclusion or ignore directive was added.

S/B/F/L: 96.07% / 86.36% / 100.00% / 100.00%.

- 37:8 b0.0 — E: post-unmount fulfillment only suppresses local React state writes; there is no external effect. React already discards state writes after unmount, so forcing this guard provides no distinguishable product assertion. Both real callers pass stable imported service functions.
- 41:8 b2.0 — E: post-unmount rejection only suppresses local plan/quota state writes; there is no alert or other external effect to certify after the consumer leaves. Mounted HTTP and non-API failures are tested through both real consumers.
- 56:8 b6.1 — E: after unmount the loading flag has no mounted consumer; asserting a frozen renderHook result would not distinguish this guard from React discarding the update.

## 58. src/features/compliance/components/PrivacyRequestsTab.tsx

Classification: **B**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 100.00% / 86.84% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 74:50 b3.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setFilter('status', v === '__ALL__' ? '' : (v as PrivacyRequestStatus))` |
| 92:55 b5.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setFilter('requestType', v === '__ALL__' ? '' : (v as PrivacyRequestType))` |
| 124:65 b10.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isEmpty={!isLoading && !error && (result?.data.length ?? 0) === 0}` |
| 161:62 b13.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{REQUEST_TYPE_LABEL[req.requestType] ?? req.requestType}` |
| 192:58 b15.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{REQUEST_TYPE_LABEL[req.requestType] ?? req.requestType}` |

## 60. src/features/marketing/components/landing/Reveal.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 100.00% / 70.58% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 32:25 b2.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `initial={reduced ? false : 'hidden'}` |
| 33:47 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `animate={isVisible \|\| reduced ? 'show' : 'hidden'}` |
| 33:28 b4.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `animate={isVisible \|\| reduced ? 'show' : 'hidden'}` |
| 70:47 b8.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `animate={isVisible \|\| reduced ? 'show' : 'hidden'}` |
| 70:28 b9.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `animate={isVisible \|\| reduced ? 'show' : 'hidden'}` |

## 61. src/features/reports/utils/report-filter-chips.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 100.00% / 88.63% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 72:83 b5.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `chips.push({ key: 'type', label: 'Tipo: ${FINANCE_TYPE_LABELS[filters.type] ?? filters.type}' })` |
| 77:65 b7.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `label: 'Status: ${FINANCE_STATUS_LABELS[filters.status] ?? filters.status}',` |
| 97:62 b13.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `label: 'Status: ${APPT_STATUS_LABELS[filters.status] ?? filters.status}',` |
| 108:61 b15.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `label: 'Status: ${INV_STATUS_LABELS[filters.status] ?? filters.status}',` |
| 134:65 b21.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `label: 'Status: ${INVOICE_STATUS_LABELS[filters.status] ?? filters.status}',` |

## 62. src/features/marketing/pages/IntegrationsPage.tsx

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 0.00% / 0.00% / 0.00% / 0.00%.

- Uncovered lines: 11, 39, 43, 66-68, 141.
- Uncovered functions: `IntegrationsPage@38`; `(anonymous_1)@65`; `(anonymous_2)@141`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 76:24 b0.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<img` |
| 83:24 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Icon className="h-5 w-5 text-primary" aria-hidden="true" />` |
| 97:23 b1.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{integration.statusLabel \|\| style.label}` |
| 97:50 b1.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{integration.statusLabel \|\| style.label}` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 38 IntegrationsPage | `export function IntegrationsPage() { usePageMeta( 'DentalFlow \| Integrações e serviços conectados',` |
| 65 (anonymous_1) | `{integrationCards.map((integration) => { const Icon = integration.icon const style = STATUS_STYLES[integration.status]` |
| 141 (anonymous_2) | `<li key={item} className="flex items-start gap-2.5"> <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"` |

## 66. src/features/scheduling/containers/SchedulePageContainer.tsx

Classification: **D**. The two empty onCancelRequest callbacks satisfy shared component props. Both recipients receive DENTIST_ALLOWED_TRANSITIONS (COMPLETED/NO_SHOW), so no cancellation control is rendered. Permissions remain unchanged; executing no-op callbacks artificially would add no behavioral evidence.

Measured after this domain batch: S/B/F/L 100.00% / 100.00% / 77.77% / 100.00%.

Uncovered lines: none. Functions: (anonymous_6)@165, (anonymous_8)@251.



## 67. src/features/auth/pages/CompleteProfilePage.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 95.74% / 85.71% / 100.00% / 95.65%.

- Uncovered lines: 59-60.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 31:44 b1.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setResponsibleName('${user.firstName ?? ''} ${user.lastName ?? ''}'.trim())` |
| 31:67 b2.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setResponsibleName('${user.firstName ?? ''} ${user.lastName ?? ''}'.trim())` |
| 58:4 b8.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (normalizedClinic.length < 2) {` |
| 88:12 b10.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: 'Não foi possível concluir o perfil agora.'` |

## 71. src/features/compliance/components/AuditLogsTab.tsx

Classification: **B**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 100.00% / 91.30% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 59:8 b2.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!cancelled) setResolved({ resolvedKey: key, data, error: null })` |
| 62:8 b3.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!cancelled)` |
| 92:70 b8.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `onValueChange={(v) => setFilter('action', v === '__ALL__' ? '' : v)}` |
| 136:65 b13.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isEmpty={!isLoading && !error && (result?.data.length ?? 0) === 0}` |

## 72. src/features/finance/components/IncomeExpensesChart.tsx

Classification: **E**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 100.00% / 96.55% / 100.00% / 100.00%.

- 76:50 b7.1 — E: Recharts receives only the three locally declared series names, all present in CHART_SERIES_LABELS; no external series key reaches this tooltip.
- 160:82 b22.1 — E: the empty-data return precedes this access, so chartData.at(-1) exists and its typed netProfit is numeric.

## 74. src/config/company.ts

Classification: **A**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 63.15% / 50.00% / 60.00% / 66.66%.

- Uncovered lines: 165, 169-170, 172-173, 175.
- Uncovered functions: `(anonymous_1)@165`; `(anonymous_2)@169`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 168:2 b0.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (failures.length > 0) {` |
| 172:4 b1.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (import.meta.env.PROD) {` |
| 172:4 b1.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (import.meta.env.PROD) {` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 165 (anonymous_1) | `isPlaceholder(companyInfo[field] as string), )` |
| 169 (anonymous_2) | `const lines = failures.map(({ field, hint }) => ' • ${field}: ${hint}') const message = '[company.ts] ${failures.length} placeholder(s) de produção detectado(s):\n${lines.join('\n')}'` |

## 75. src/features/patients/components/PatientAvatarWidget.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 89.70% / 93.02% / 100.00% / 90.16%.

- Uncovered lines: 95-100.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 72:4 b5.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!file \|\| !onUpload) return` |
| 93:11 b9.1 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `} else {` |
| 140:6 b12.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (e.key === 'Escape') setShowSourcePicker(false)` |

## 76. src/components/common/PasswordResetModal.tsx

Classification: **A**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 91.17% / 84.21% / 87.50% / 90.62%.

- Uncovered lines: 67-68, 87.
- Uncovered functions: `(anonymous_5)@87`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 66:4 b3.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (form.password.length > PASSWORD_MAX_LENGTH) {` |
| 87:55 b6.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>` |
| 87:66 b6.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 87 (anonymous_5) | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}> <Dialog.Portal> <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />` |

## 77. src/features/billing/containers/SubscriptionPageContainer.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 94.73% / 90.32% / 87.50% / 93.75%.

- Uncovered lines: 198.
- Uncovered functions: `(anonymous_7)@198`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 134:16 b12.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `billingStatus.planKey === plan.slug &&` |
| 135:16 b12.2 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `billingStatus.billingInterval === normalizedInterval` |
| 156:71 b13.2 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isRecommended={index === 1 \|\| (plans.length === 1 && plan.hasAnalytics)}` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 198 (anonymous_7) | `onCancel={() => setShowCancelDialog(false)} /> </AppPage>` |

## 79. src/features/admin/containers/AdminClinicsPageContainer.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 92.30% / 85.00% / 94.44% / 96.00%.

- Uncovered lines: 274.
- Uncovered functions: `(anonymous_13)@274`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 243:32 b4.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (event.target !== event.currentTarget) return` |
| 244:32 b5.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (event.key === 'Enter' \|\| event.key === ' ') {` |
| 244:61 b6.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (event.key === 'Enter' \|\| event.key === ' ') {` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 274 (anonymous_13) | `onClick={() => setEditTarget(clinic)} > <Pencil className="h-3.5 w-3.5" aria-hidden="true" />` |

## 81. src/components/common/MonthPickerInput.tsx

Classification: **B**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 96.55% / 92.68% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 39:2 b1.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!match) return null` |
| 48:2 b4.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!/^\d{4}-\d{2}$/.test(isoMonth)) return ''` |
| 147:38 b17.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `aria-label={triggerLabel \|\| placeholder}` |

## 82. src/features/admin/hooks/useAdminFinancePage.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 98.71% / 86.36% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 74:47 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `error instanceof Error ? error.message : 'Não foi possível carregar os dados financeiros.'` |
| 107:8 b2.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!isMounted) return` |
| 186:24 b10.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `[field]: value \|\| undefined,` |

## 85. src/features/marketing/components/landing/DentalArch.tsx

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 92.30% / 85.00% / 81.81% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: `(anonymous_0)@9`; `(anonymous_5)@51`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 23:44 b0.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const t = DENTAL_WORKFLOWS.length === 1 ? 0 : (index / (DENTAL_WORKFLOWS.length - 1)) * 2 - 1` |
| 48:4 b2.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (typeof window === 'undefined' \|\| typeof window.matchMedia !== 'function') return` |
| 171:8 b9.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Suspense fallback={<StaticArch selectedIndex={selectedIndex} onSelect={onSelect} />}>` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 9 (anonymous_0) | `const DentalArchScene = lazy(() => import('./DentalArchScene')) type DentalArchProps = {` |
| 51 (anonymous_5) | `const onChange = (event: MediaQueryListEvent) => setSmallOrCoarse(event.matches) query.addEventListener('change', onChange) return () => query.removeEventListener('change', onChange)` |

## 86. src/features/marketing/pages/FeatureDetailPage.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 100.00% / 83.33% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 46:60 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',` |
| 84:60 b1.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',` |
| 369:57 b8.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `ctaVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',` |

## 87. src/features/patients/hooks/usePatientAvatar.ts

Classification: **A**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 95.74% / 86.36% / 94.11% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: `(anonymous_16)@97`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 74:8 b8.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (active) {` |
| 81:8 b9.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (active) setState({ avatarUrl: null, isLoading: false, isSaving: false })` |
| 90:6 b10.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!identifier) return` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 97 (anonymous_16) | `setState((s) => ({ ...s, isSaving: false })) throw new Error('Não foi possível salvar a foto.') }` |

## 88. src/features/scheduling/components/SchedulingToolbar.tsx

Classification: **E**. The only production caller, AppointmentsPageContainer, always supplies all three Google Calendar handlers (lines 110–112). The optional-prop fallbacks are empty compatibility callbacks, with no product action to assert. No exclusion applied.

Measured after this domain batch: S/B/F/L 100.00% / 75.00% / 25.00% / 100.00%.

Uncovered lines: none. Functions: (anonymous_1)@81, (anonymous_2)@82, (anonymous_3)@83.

- 81:23 b3.1 (binary-expr): E, invariant above.
- 82:20 b4.1 (binary-expr): E, invariant above.
- 83:26 b5.1 (binary-expr): E, invariant above.

## 89. src/lib/validators/br.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 99.09% / 96.29% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 25:2 b4.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (rem !== Number.parseInt(d[9])) return false` |
| 53:23 b12.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const d1 = rem < 2 ? 0 : 11 - rem` |
| 60:23 b14.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const d2 = rem < 2 ? 0 : 11 - rem` |

## 91. src/features/marketing/components/landing/ProductShowcaseSection.tsx

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 67.56% / 80.00% / 47.82% / 67.56%.

- Uncovered lines: 38, 115, 133, 147, 161, 174, 236, 240, 248, 303, 311, 327.
- Uncovered functions: `Tile@37`; `ProntuarioMock@114`; `(anonymous_6)@133`; `(anonymous_7)@147`; `FinanceiroMock@160`; `(anonymous_9)@174`; `EquipeMock@235`; `(anonymous_13)@240`; `(anonymous_14)@248`; `(anonymous_16)@303`; `(anonymous_17)@311`; `(anonymous_19)@327`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 137:25 b0.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `marked ? 'border-cyan-300 bg-cyan-100' : 'border-slate-200 bg-slate-50',` |
| 137:57 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `marked ? 'border-cyan-300 bg-cyan-100' : 'border-slate-200 bg-slate-50',` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 37 Tile | `}: { label: string; value: string; hint: string; accent: string }) { return ( <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">` |
| 114 ProntuarioMock | `function ProntuarioMock() { return ( <MockWindow title="DentalFlow · Prontuário">` |
| 133 (anonymous_6) | `<span key={'tooth-${i}'} className={cn(` |
| 147 (anonymous_7) | `<div key={evo.date} className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5"> <p className="text-[11px] font-semibold text-cyan-700">{evo.date}</p> <p className="text-xs leading-5 text-slate-600">{evo.note}</p>` |
| 160 FinanceiroMock | `function FinanceiroMock() { return ( <MockWindow title="DentalFlow · Financeiro">` |
| 174 (anonymous_9) | `<div key={'bar-${i}'} className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-400 to-cyan-400"` |
| 235 EquipeMock | `function EquipeMock() { return ( <MockWindow title="DentalFlow · Equipe">` |
| 240 (anonymous_13) | `<div key={member.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3"` |
| 248 (anonymous_14) | `.map((p) => p[0]) .join('')} </span>` |
| 303 (anonymous_16) | `render: () => <ProntuarioMock />, }, {` |
| 311 (anonymous_17) | `render: () => <FinanceiroMock />, }, {` |
| 327 (anonymous_19) | `render: () => <EquipeMock />, }, ]` |

## 93. src/features/team/components/TeamMembersTable.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 75.00% / 80.00% / 75.00% / 81.81%.

- Uncovered lines: 68-69.
- Uncovered functions: `(anonymous_6)@68`; `(anonymous_7)@69`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 46:18 b0.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (event.target !== event.currentTarget) return` |
| 47:18 b1.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (event.key === 'Enter' \|\| event.key === ' ') {` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 68 (anonymous_6) | `onPassword={() => onPassword(member)} onDelete={() => onDelete(member)} />` |
| 69 (anonymous_7) | `onDelete={() => onDelete(member)} /> </td>` |

## 94. src/features/finance/containers/FinancePageContainer.tsx

Classification: **E**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 100.00% / 96.15% / 100.00% / 100.00%.

- 167:16 b4.1 — E: this event is dispatched by a mounted client DOM button; document cannot be absent in that runtime. There is no server-rendered event path.

## 99. src/features/marketing/hooks/useDropdownNav.ts

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 96.87% / 80.00% / 100.00% / 96.00%.

- Uncovered lines: 19.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 18:6 b0.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (headerRef.current && !headerRef.current.contains(e.target as Node)) {` |
| 23:6 b2.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (e.key === 'Escape') {` |

## 100. src/features/admin/components/ClinicFormModal.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 96.55% / 93.54% / 88.88% / 96.29%.

- Uncovered lines: 87.
- Uncovered functions: `(anonymous_6)@87`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 87:55 b7.0 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>` |
| 87:66 b7.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 87 (anonymous_6) | `<Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}> <Dialog.Portal> <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />` |

## 101. src/features/admin/containers/AdminUsersPageContainer.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 96.42% / 91.66% / 95.45% / 96.29%.

- Uncovered lines: 384.
- Uncovered functions: `(anonymous_19)@384`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 277:30 b5.1 if (condition) | B: exercise the uncovered conditional/data alternative; remains open. | `if (event.key === 'Enter' \|\| event.key === ' ') {` |
| 277:59 b6.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (event.key === 'Enter' \|\| event.key === ' ') {` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 384 (anonymous_19) | `onClose={() => setEditTarget(null)} onSuccess={handleEditSuccess} />` |

## 102. src/features/admin/components/ClinicHealthSection.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 96.77% / 93.10% / 100.00% / 96.77%.

- Uncovered lines: 90.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 89:2 b9.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!subscription \|\| !subscription.status) {` |
| 105:59 b13.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia restante' : 'dias restantes'} de` |

## 104. src/components/common/DatePickerInput.tsx

Classification: **B**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 96.96% / 96.36% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 74:4 b10.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (isBeforeMinDate(nextValue, minDateValue)) return` |
| 75:4 b11.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (disabledDate?.(nextValue)) return` |

## 105. src/components/layout/SiteFooter.tsx

Classification: **B**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 100.00% / 66.66% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 47:22 b0.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}` |
| 49:15 b1.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{icon ?? <FooterChevron />}` |

## 106. src/features/auth/pages/ResetPasswordPage.tsx

Classification: **B**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 96.00% / 88.88% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 24:4 b0.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!token) return` |
| 33:45 b1.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `err instanceof Error ? err.message : 'Não foi possível redefinir a senha. Tente novamente.'` |

## 109. src/features/compliance/components/CookieConsentLogsTab.tsx

Classification: **B**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 100.00% / 95.23% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 102:70 b5.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `onValueChange={(v) => setFilter('source', v === '__ALL__' ? '' : v)}` |
| 146:65 b10.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `isEmpty={!isLoading && !error && (result?.data.length ?? 0) === 0}` |

## 110. src/features/finance/components/ColorPicker.tsx

Classification: **E**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 100.00% / 66.66% / 100.00% / 100.00%.

- 18:48 b0.1 — E: every color rendered from the private CATEGORY_COLORS tuple has a CATEGORY_COLOR_NAMES entry; an unknown color cannot be selected by this control.
- 19:72 b1.1 — E: the accessible label uses the same complete static color-name mapping as the title.

## 117. src/features/marketing/components/FeatureMockups.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 100.00% / 96.55% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 96:30 b12.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `dot === 'blue' && 'bg-blue-400',` |
| 97:31 b13.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `dot === 'slate' && 'bg-slate-500',` |

## 118. src/features/marketing/pages/FeaturesPage.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 100.00% / 90.90% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 160:58 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',` |
| 487:57 b10.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `ctaVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',` |

## 119. src/features/reports/components/ReportCard.tsx

Classification: **B**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 96.15% / 96.42% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 57:4 b2.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!onPreview) return` |
| 79:59 b4.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `const message = err instanceof Error ? err.message : 'Não foi possível gerar o relatório.'` |

## 120. src/features/scheduling/components/availability/ExceptionForm.tsx

Classification: **E**. The reason input is always rendered with name=reason. Native submission is disabled during saving/deleting; otherwise FormData contains the field even when empty. The nullish data.get fallback requires removing/disabling that field outside the supported form workflow. Empty-string reasons are already tested.

Measured after this domain batch: S/B/F/L 100.00% / 97.77% / 100.00% / 100.00%.

Uncovered lines: none. Functions: none.

- 53:43 b4.1 (binary-expr): E, invariant above.

## 121. src/lib/date-time-formatters.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 97.64% / 95.23% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 52:2 b9.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!value) return ''` |
| 54:2 b10.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!match) return ''` |

## 122. src/features/billing/components/BillingIntervalToggle.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 66.66% / 95.65% / 66.66% / 66.66%.

- Uncovered lines: 36.
- Uncovered functions: `(anonymous_1)@36`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 72:22 b7.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'bg-emerald-500 text-white'` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 36 (anonymous_1) | `onClick={() => onChange('MONTHLY')} className={cn( 'h-10 gap-1.5 px-5 text-sm font-medium',` |

## 123. src/features/team/containers/TeamPageContainer.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 81.81% / 91.66% / 77.77% / 81.81%.

- Uncovered lines: 175, 181.
- Uncovered functions: `(anonymous_3)@175`; `(anonymous_4)@181`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 79:29 b1.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{usage.planName ?? usage.planSlug}.{' '}` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 175 (anonymous_3) | `setPasswordTarget({ id: member.id, name: '${member.firstName} ${member.lastName}',` |
| 181 (anonymous_4) | `setDeleteTarget({ id: member.id, name: '${member.firstName} ${member.lastName}',` |

## 124. src/features/notifications/components/AppointmentNotificationActions.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 90.90% / 90.00% / 80.00% / 89.47%.

- Uncovered lines: 107, 123.
- Uncovered functions: `(anonymous_8)@107`; `(anonymous_9)@123`.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 70:50 b2.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{TEMPLATE_LABELS[tpl.slug] ?? tpl.slug}` |

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 107 (anonymous_8) | `onClose={() => setSendOpen(false)} template={selectedTemplate} appointmentId={appointmentId}` |
| 123 (anonymous_9) | `onClose={() => setHistoryOpen(false)} /> </>` |

## 127. src/components/common/ConfirmDialog.tsx

Classification: **B**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 100.00% / 96.55% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 43:18 b6.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}` |

## 128. src/components/common/GlobalAlerts.tsx

Classification: **B**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 57:12 b2.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `: '${Date.now()}-${Math.random()}'` |

## 129. src/components/common/SectionHeading.tsx

Classification: **B**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 42:52 b6.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `<p className={cn('mt-5 leading-7', isDark ? 'text-slate-300' : 'text-slate-600')}>` |

## 130. src/features/admin/containers/AdminFinancePageContainer.tsx

Classification: **B**. Chart hover/leave, light/dark rendering, axis formatting, filters, pagination, inactive plans, nullable clinic identity and period-date fallback are covered. Remaining tooltip fallback is B: a payload item without a value falls back to zero; it remains conservatively testable at the chart-library boundary, rather than being waived.

S/B/F/L: 100.00% / 98.80% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 282:54 b8.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{valueFormatter(Number(payload[0]?.value ?? 0))}` |

## 131. src/features/admin/hooks/useAdminClinicsPage.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 96:81 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setAllClinics((prev) => prev.map((item) => (item.id === clinic.id ? clinic : item)))` |

## 132. src/features/admin/hooks/useAdminUsersPage.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 100.00% / 90.00% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 96:69 b2.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setAllUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))` |

## 133. src/features/clinical-records/components/odontogram/OdontogramLegend.tsx

Classification: **D/E/F**. All testable branches identified in this batch are covered; no exclusion or ignore directive. Browser media, rendering and printing limits remain in the [manual QA checklist](frontend-manual-qa-2026-09-11.md).

S/B/F/L: 100.00% / 85.71% / 100.00% / 100.00%.

- 23: b2.1 — E: the static options and legend-class map cover the same complete condition set; there is no runtime input or missing option.

## 138. src/features/clinical-records/utils/parse-dictation-odontogram.ts

Classification: **D/E/F**. All testable branches identified in this batch are covered; no exclusion or ignore directive. Browser media, rendering and printing limits remain in the [manual QA checklist](frontend-manual-qa-2026-09-11.md).

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%.

- 120: b5.1 — E: detectCondition returns only the fixed CONDITION_KEYWORDS values, all present in the label map derived from ODONTOGRAM_CONDITION_OPTIONS.

## 139. src/features/compliance/services/compliance.service.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 100.00% / 85.71% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 21:25 b2.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `return qs ? '?${qs}' : ''` |

## 140. src/features/dashboard/hooks/useDashboardPage.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 100.00% / 92.85% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 58:73 b4.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))` |

## 147. src/features/fiscal/utils/invoice-format.ts

Classification: **E**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 100.00% / 75.00% / 100.00% / 100.00%.

- 5:42 b0.1 — E: cents / 100 always produces a number; formatCurrencyBR returns null only for a nullish argument, so this fallback cannot be reached through formatCents.

## 149. src/features/inventory/hooks/useAiAssistantInventory.ts

Classification: **E**. Exact residual explanations follow; no coverage exclusion or ignore directive was added.

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%.

- 34:8 b2.1 — E: the remaining branch suppresses local reset writes on rejection after unmount. There is no observable external effect; mounted rejection, generation, and initial state behavior are tested. A frozen renderHook result would not prove this guard.

## 150. src/features/marketing/components/PublicHeader.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 100.00% / 97.50% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 157:24 b5.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? 'bg-white/15 text-white'` |

## 151. src/features/marketing/components/PublicLayout.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 100.00% / 80.00% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 35:12 b2.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `? '${bgClassName} overflow-x-hidden'` |

## 152. src/features/marketing/components/RoleModulesPanel.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 83.33% / 88.88% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 38:16 b1.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!ModuleIcon) return null` |

## 153. src/features/marketing/components/RoleSwitcher.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 94.11% / 87.50% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 47:2 b3.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (cards.length === 0) return null` |

## 154. src/features/marketing/config/features.ts

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 97.05% / 90.00% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 365:6 b2.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!feature) return null` |

## 155. src/features/marketing/pages/FaqPage.tsx

Classification: **B**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 117:22 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `) : null` |

## 156. src/features/notifications/components/MessageHistoryDrawer.tsx

Classification: **B**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 100.00% / 95.00% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 20:36 b0.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `return time ? '${date} ${time}' : date` |

## 157. src/features/notifications/components/NotificationSendDrawer.tsx

Classification: **B**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 100.00% / 98.33% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 152:65 b15.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `{template ? (TEMPLATE_LABELS[template.slug] ?? template.slug) : 'Enviar mensagem'}` |

## 158. src/features/notifications/hooks/useNotificationConsent.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 100.00% / 87.50% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 53:93 b3.1 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `setConsent((c) => (c ? { ...c, granted: false, revokedAt: new Date().toISOString() } : null))` |

## 159. src/features/reports/containers/ReportsPageContainer.tsx

Classification: **E**. All report export callbacks, status/date filter round trips, plan transitions and nullable dentist/amount presentation are covered. The zero-total completion-rate arm is E: every map entry is inserted only after entry.total is incremented, so a mapped dentist always has at least one appointment.

S/B/F/L: 100.00% / 98.87% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 102:65 b9.1 cond-expr (arm) | E: each map entry has total >= 1 before insertion. | `completionRate: v.total > 0 ? completedCount / v.total : 0,` |

## 160. src/features/scheduling/components/appointments/AppointmentServiceValueSection.tsx

Classification: **E**. The restore button requires restoredPrice != null. Every non-null restoredPrice is a nonempty formatted string, including zero as 0,00. Its handler cannot see a falsy price through the current UI.

Measured after this domain batch: S/B/F/L 93.33% / 97.22% / 100.00% / 100.00%.

Uncovered lines: none. Functions: none.

- 80:4 b9.0 (if): E, invariant above.

## 161. src/features/scheduling/components/availability/ExceptionEditModal.tsx

Classification: **E**. While saving/deleting, both Escape and outside interaction call preventDefault before Radix can emit onOpenChange(false). The duplicate busy guard in handleEscapeOrOutside is retained as a safeguard. Cancel/delete/save buttons are also disabled.

Measured after this domain batch: S/B/F/L 94.11% / 95.00% / 100.00% / 100.00%.

Uncovered lines: none. Functions: none.

- 39:4 b1.0 (if): E, invariant above.

## 166. src/features/team/hooks/useTeamPage.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 100.00% / 91.66% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 42:25 b0.0 cond-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `value === 'active' ? member.isActive : !member.isActive,` |

## 167. src/lib/date-time-input.ts

Classification: **B**. remaining public behavior or defensive/fallback branches need targeted cases and source-level reachability review. They are not automatically waived.

S/B/F/L: 97.50% / 96.15% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 72:2 b12.0 if (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `if (!Number.isFinite(value)) return min` |

## 168. src/services/http.ts

Classification: **B**. remaining nullish fallback in error translation needs reachability review against the translator contract. HTTP refresh/retry/concurrency and error outcomes are tested; no exclusion added.

S/B/F/L: 100.00% / 98.11% / 100.00% / 100.00%.

- Uncovered lines: none.
- Uncovered functions: none.

| Location / branch arm | Class / technical requirement | Source condition or branch |
| --- | --- | --- |
| 80:72 b5.1 binary-expr (arm) | B: exercise the uncovered conditional/data alternative; remains open. | `translateApiErrorMessage(getErrorMessage(body), response.status) ??` |

## 169. src/App.tsx

Classification: **F**. RouterProvider connects the real router; built-app navigation and chunk loading are browser integration checks.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6.
- Uncovered functions: `App@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 App | `function App() { return <RouterProvider router={router} /> }` |

## 170. src/main.tsx

Classification: **F**. React DOM root creation, StrictMode and production configuration initialization require an actual built-app bootstrap smoke test.

S/B/F/L: 0.00% / 100.00% / 100.00% / 0.00%.

- Uncovered lines: 7, 9.
- Uncovered functions: none.

## 171. src/app/RootRoute.tsx

Classification: **F**. Provider composition, Suspense and error-boundary integration require app-level navigation/loading/failure QA. Individual providers have unit tests; that does not certify the assembled application.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 13.
- Uncovered functions: `RootRoute@12`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 12 RootRoute | `export function RootRoute() { return ( <ErrorBoundary FallbackComponent={CrashScreen}>` |

## 172. src/features/admin/pages/AdminClinicsPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `AdminClinicsPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 AdminClinicsPage | `export function AdminClinicsPage() { return <AdminClinicsPageContainer /> }` |

## 173. src/features/admin/pages/AdminDashboardPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `AdminDashboardPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 AdminDashboardPage | `export function AdminDashboardPage() { return <AdminDashboardPageContainer /> }` |

## 174. src/features/admin/pages/AdminFinancePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `AdminFinancePage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 AdminFinancePage | `export function AdminFinancePage() { return <AdminFinancePageContainer /> }` |

## 175. src/features/admin/pages/AdminUsersPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `AdminUsersPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 AdminUsersPage | `export function AdminUsersPage() { return <AdminUsersPageContainer /> }` |

## 176. src/features/billing/pages/SubscriptionPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `SubscriptionPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 SubscriptionPage | `export function SubscriptionPage() { return <SubscriptionPageContainer /> }` |

## 177. src/features/clinical-records/pages/ClinicalRecordEditorPage.tsx

Classification: **D/F**. Thin route composition/parameter wiring. Route navigation, browser history and lazy chunk delivery require browser QA. No exclusion. Domain-only S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

## 178. src/features/clinical-records/pages/ClinicalRecordPrintPage.tsx

Classification: **D/F**. Thin route composition/parameter wiring. Route navigation, browser history and lazy chunk delivery require browser QA. No exclusion. Domain-only S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

## 179. src/features/clinical-records/pages/ClinicalRecordsPage.tsx

Classification: **D/F**. Thin route composition/parameter wiring. Route navigation, browser history and lazy chunk delivery require browser QA. No exclusion. Domain-only S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

## 180. src/features/compliance/pages/CompliancePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `CompliancePage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 CompliancePage | `export function CompliancePage() { return <CompliancePageContainer /> }` |

## 181. src/features/dashboard/pages/DashboardPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `DashboardPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 DashboardPage | `export function DashboardPage() { return <DashboardPageContainer /> }` |

## 182. src/features/dashboard/pages/DentistHomePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `DentistHomePage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 DentistHomePage | `export function DentistHomePage() { return <DentistHomePageContainer /> }` |

## 183. src/features/finance/pages/FinancePage.tsx

Classification: **D/F**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Lines 4; FinancePage@3 — D/F: thin route composition delegates behavior to the tested container; real lazy chunk loading and browser navigation remain manual QA.

## 184. src/features/fiscal/pages/FiscalInvoicesPage.tsx

Classification: **D/F**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Lines 4; FiscalInvoicesPage@3 — D/F: thin route composition delegates behavior to the tested container; real lazy chunk loading and browser navigation remain manual QA.

## 185. src/features/fiscal/pages/FiscalProfilePage.tsx

Classification: **D/F**. Remaining locations have the exact invariants below; no ignore directive or coverage exclusion was added.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Lines 8; FiscalProfilePage@7 — D/F: thin route composition delegates behavior to the tested container; real lazy chunk loading and browser navigation remain manual QA.

## 186. src/features/inventory/pages/InventoryPage.tsx

Classification: **D/F**. Exact residual explanations follow; no coverage exclusion or ignore directive was added.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Lines 4; InventoryPage@3 — D/F: thin route composition; tested container behavior is separate from browser lazy-chunk/navigation QA.

## 187. src/features/inventory/types/inventory.types.ts

Classification: **D**. Exact residual explanations follow; no coverage exclusion or ignore directive was added.

S/B/F/L: 0.00% / 100.00% / 100.00% / 0.00%.

- Lines 1, 12 — D: const tuples derive TypeScript string unions; consumers import their types, not runtime behavior. No coverage exclusion applied.

## 188. src/features/marketing/components/SectionDivider.tsx

Classification: **D**. aria-hidden decorative divider renders static color/gradient configuration and CSS animation. No interactive control or product state transition; appearance belongs to browser visual QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 21, 87, 89.
- Uncovered functions: `SectionDivider@86`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 86 SectionDivider | `}) { const cfg = CONFIGS[variant]` |

## 189. src/features/marketing/components/TrialCtaSection.tsx

Classification: **A**. marketing presentation/browser interaction alternatives remain unexecuted. Browser/visual validation is more useful than fabricated canvas or animation call counts; no exclusion.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 9, 12, 57.
- Uncovered functions: `TrialCtaSection@11`; `(anonymous_1)@57`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 11 TrialCtaSection | `export function TrialCtaSection() { return ( <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#0f3b73_0%,#082f5f_100%)] py-24">` |
| 57 (anonymous_1) | `<span key={signal} className="flex items-center gap-1.5 text-sm font-medium text-blue-100"` |

## 190. src/features/marketing/pages/AgendaFeaturePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `AgendaFeaturePage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 AgendaFeaturePage | `export function AgendaFeaturePage() { usePageMeta( 'DentalFlow \| Agenda para clínicas odontológicas',` |

## 191. src/features/marketing/pages/AiFeaturePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `AiFeaturePage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 AiFeaturePage | `export function AiFeaturePage() { usePageMeta( 'DentalFlow \| IA de gestão para clínicas odontológicas',` |

## 192. src/features/marketing/pages/ClinicalRecordsFeaturePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `ClinicalRecordsFeaturePage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 ClinicalRecordsFeaturePage | `export function ClinicalRecordsFeaturePage() { usePageMeta( 'DentalFlow \| Prontuários digitais para clínicas odontológicas',` |

## 193. src/features/marketing/pages/FinanceFeaturePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `FinanceFeaturePage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 FinanceFeaturePage | `export function FinanceFeaturePage() { usePageMeta( 'DentalFlow \| Gestão financeira para clínicas odontológicas',` |

## 194. src/features/marketing/pages/FiscalFeaturePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `FiscalFeaturePage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 FiscalFeaturePage | `export function FiscalFeaturePage() { usePageMeta( 'DentalFlow \| Controle fiscal para clínicas odontológicas',` |

## 195. src/features/marketing/pages/ForDentistPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `ForDentistPage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 ForDentistPage | `export function ForDentistPage() { usePageMeta( 'DentalFlow \| Para dentistas',` |

## 196. src/features/marketing/pages/ForManagerPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `ForManagerPage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 ForManagerPage | `export function ForManagerPage() { usePageMeta( 'DentalFlow \| Para gestores e administradores de clínicas',` |

## 197. src/features/marketing/pages/ForNewClinicPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `ForNewClinicPage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 ForNewClinicPage | `export function ForNewClinicPage() { usePageMeta( 'DentalFlow \| Para clínicas odontológicas em abertura',` |

## 198. src/features/marketing/pages/ForSecretaryPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `ForSecretaryPage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 ForSecretaryPage | `export function ForSecretaryPage() { usePageMeta( 'DentalFlow \| Para secretárias e recepcionistas de clínicas',` |

## 199. src/features/marketing/pages/InventoryFeaturePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `InventoryFeaturePage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 InventoryFeaturePage | `export function InventoryFeaturePage() { usePageMeta( 'DentalFlow \| Controle de estoque para clínicas odontológicas',` |

## 200. src/features/marketing/pages/PatientsFeaturePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `PatientsFeaturePage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 PatientsFeaturePage | `export function PatientsFeaturePage() { usePageMeta( 'DentalFlow \| Gestão de pacientes para clínicas odontológicas',` |

## 201. src/features/marketing/pages/ReportsFeaturePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `ReportsFeaturePage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 ReportsFeaturePage | `export function ReportsFeaturePage() { usePageMeta( 'DentalFlow \| Relatórios e indicadores para clínicas odontológicas',` |

## 202. src/features/marketing/pages/WhatsappFeaturePage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 6, 10.
- Uncovered functions: `WhatsappFeaturePage@5`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 5 WhatsappFeaturePage | `export function WhatsappFeaturePage() { usePageMeta( 'DentalFlow \| WhatsApp e notificações para clínicas odontológicas',` |

## 203. src/features/patients/pages/PatientsAttentionPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `PatientsAttentionPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 PatientsAttentionPage | `export function PatientsAttentionPage() { return <PatientsAttentionContainer /> }` |

## 204. src/features/patients/pages/PatientsPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `PatientsPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 PatientsPage | `export function PatientsPage() { return <PatientsPageContainer /> }` |

## 205. src/features/reports/pages/ReportsPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `ReportsPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 ReportsPage | `export function ReportsPage() { return <ReportsPageContainer /> }` |

## 206. src/features/scheduling/pages/AppointmentsPage.tsx

Classification: **D**. Thin route renderer with no state, validation or branching; provider/lazy-route loading remains browser QA.

Measured after this domain batch: S/B/F/L 0.00% / 100.00% / 0.00% / 0.00%.

Uncovered lines: 4. Functions: AppointmentsPage@3.



## 207. src/features/scheduling/pages/SchedulePage.tsx

Classification: **D**. Thin route renderer with no state, validation or branching; provider/lazy-route loading remains browser QA.

Measured after this domain batch: S/B/F/L 0.00% / 100.00% / 0.00% / 0.00%.

Uncovered lines: 4. Functions: SchedulePage@3.



## 208. src/features/settings/pages/SettingsPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `SettingsPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 SettingsPage | `export function SettingsPage() { return <SettingsPageContainer /> }` |

## 209. src/features/team/pages/TeamPage.tsx

Classification: **D**. Thin route renderer delegates to its feature container or static role/feature configuration. Container behavior is tested separately. An assertion that only repeats this JSX composition would add no independent product behavior; route/chunk integration remains browser QA.

S/B/F/L: 0.00% / 100.00% / 0.00% / 0.00%.

- Uncovered lines: 4.
- Uncovered functions: `TeamPage@3`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 3 TeamPage | `export function TeamPage() { return <TeamPageContainer /> }` |

## 210. src/app/route-components.tsx

Classification: **F**. Dynamic import callbacks need actual lazy-route navigation and chunk-load failure QA. Route registration tests do not execute every production chunk.

S/B/F/L: 33.33% / 100.00% / 0.00% / 33.33%.

- Uncovered lines: 4-5, 10-11, 16-17, 22-23, 28-29, 34-35, 40-41, 46-47, 52-53, 58-59, 64-65, 70-71, 76-77, 82-83, 88-89, 94-95, 100-101, 106-107, 112-113, 118-119, 124-125, 130-131, 136-137, 142-143, 148-149, 154-155, 160-161, 167-168, 173-174, 179-180, 185-186, 191-192, 197-198, 203-204, 209-210, 215-216, 221-222, 227-228, 233-234, 239-240, 246-247, 252-253, 258-259, 264-265, 270-271, 276-277, 282-283, 288-289, 294-295, 300-301, 306-307, 312-313, 318-319, 324-325, 330-331, 336-337.
- Uncovered functions: `(anonymous_0)@4`; `(anonymous_1)@5`; `(anonymous_2)@10`; `(anonymous_3)@11`; `(anonymous_4)@16`; `(anonymous_5)@17`; `(anonymous_6)@22`; `(anonymous_7)@23`; `(anonymous_8)@28`; `(anonymous_9)@29`; `(anonymous_10)@34`; `(anonymous_11)@35`; `(anonymous_12)@40`; `(anonymous_13)@41`; `(anonymous_14)@46`; `(anonymous_15)@47`; `(anonymous_16)@52`; `(anonymous_17)@53`; `(anonymous_18)@58`; `(anonymous_19)@59`; `(anonymous_20)@64`; `(anonymous_21)@65`; `(anonymous_22)@70`; `(anonymous_23)@71`; `(anonymous_24)@76`; `(anonymous_25)@77`; `(anonymous_26)@82`; `(anonymous_27)@83`; `(anonymous_28)@88`; `(anonymous_29)@89`; `(anonymous_30)@94`; `(anonymous_31)@95`; `(anonymous_32)@100`; `(anonymous_33)@101`; `(anonymous_34)@106`; `(anonymous_35)@107`; `(anonymous_36)@112`; `(anonymous_37)@113`; `(anonymous_38)@118`; `(anonymous_39)@119`; `(anonymous_40)@124`; `(anonymous_41)@125`; `(anonymous_42)@130`; `(anonymous_43)@131`; `(anonymous_44)@136`; `(anonymous_45)@137`; `(anonymous_46)@142`; `(anonymous_47)@143`; `(anonymous_48)@148`; `(anonymous_49)@149`; `(anonymous_50)@154`; `(anonymous_51)@155`; `(anonymous_52)@160`; `(anonymous_53)@161`; `(anonymous_54)@167`; `(anonymous_55)@168`; `(anonymous_56)@173`; `(anonymous_57)@174`; `(anonymous_58)@179`; `(anonymous_59)@180`; `(anonymous_60)@185`; `(anonymous_61)@186`; `(anonymous_62)@191`; `(anonymous_63)@192`; `(anonymous_64)@197`; `(anonymous_65)@198`; `(anonymous_66)@203`; `(anonymous_67)@204`; `(anonymous_68)@209`; `(anonymous_69)@210`; `(anonymous_70)@215`; `(anonymous_71)@216`; `(anonymous_72)@221`; `(anonymous_73)@222`; `(anonymous_74)@227`; `(anonymous_75)@228`; `(anonymous_76)@233`; `(anonymous_77)@234`; `(anonymous_78)@239`; `(anonymous_79)@240`; `(anonymous_80)@246`; `(anonymous_81)@247`; `(anonymous_82)@252`; `(anonymous_83)@253`; `(anonymous_84)@258`; `(anonymous_85)@259`; `(anonymous_86)@264`; `(anonymous_87)@265`; `(anonymous_88)@270`; `(anonymous_89)@271`; `(anonymous_90)@276`; `(anonymous_91)@277`; `(anonymous_92)@282`; `(anonymous_93)@283`; `(anonymous_94)@288`; `(anonymous_95)@289`; `(anonymous_96)@294`; `(anonymous_97)@295`; `(anonymous_98)@300`; `(anonymous_99)@301`; `(anonymous_100)@306`; `(anonymous_101)@307`; `(anonymous_102)@312`; `(anonymous_103)@313`; `(anonymous_104)@318`; `(anonymous_105)@319`; `(anonymous_106)@324`; `(anonymous_107)@325`; `(anonymous_108)@330`; `(anonymous_109)@331`; `(anonymous_110)@336`; `(anonymous_111)@337`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 4 (anonymous_0) | `import('@/features/marketing/pages/LandingPage').then((m) => ({ default: m.LandingPage, })),` |
| 5 (anonymous_1) | `default: m.LandingPage, })), )` |
| 10 (anonymous_2) | `import('@/features/marketing/pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage, })),` |
| 11 (anonymous_3) | `default: m.FeaturesPage, })), )` |
| 16 (anonymous_4) | `import('@/features/auth/pages/AuthRoutePage').then((m) => ({ default: m.AuthRoutePage, })),` |
| 17 (anonymous_5) | `default: m.AuthRoutePage, })), )` |
| 22 (anonymous_6) | `import('@/features/auth/pages/OAuthSuccessPage').then((m) => ({ default: m.OAuthSuccessPage, })),` |
| 23 (anonymous_7) | `default: m.OAuthSuccessPage, })), )` |
| 28 (anonymous_8) | `import('@/features/auth/pages/CompleteProfilePage').then((m) => ({ default: m.CompleteProfilePage, })),` |
| 29 (anonymous_9) | `default: m.CompleteProfilePage, })), )` |
| 34 (anonymous_10) | `import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage, })),` |
| 35 (anonymous_11) | `default: m.ForgotPasswordPage, })), )` |
| 40 (anonymous_12) | `import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage, })),` |
| 41 (anonymous_13) | `default: m.ResetPasswordPage, })), )` |
| 46 (anonymous_14) | `import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage, })),` |
| 47 (anonymous_15) | `default: m.DashboardPage, })), )` |
| 52 (anonymous_16) | `import('@/features/dashboard/pages/DentistHomePage').then((m) => ({ default: m.DentistHomePage, })),` |
| 53 (anonymous_17) | `default: m.DentistHomePage, })), )` |
| 58 (anonymous_18) | `import('@/features/scheduling/pages/AppointmentsPage').then((m) => ({ default: m.AppointmentsPage, })),` |
| 59 (anonymous_19) | `default: m.AppointmentsPage, })), )` |
| 64 (anonymous_20) | `import('@/features/scheduling/pages/SchedulePage').then((m) => ({ default: m.SchedulePage, })),` |
| 65 (anonymous_21) | `default: m.SchedulePage, })), )` |
| 70 (anonymous_22) | `import('@/features/team/pages/TeamPage').then((m) => ({ default: m.TeamPage, })),` |
| 71 (anonymous_23) | `default: m.TeamPage, })), )` |
| 76 (anonymous_24) | `import('@/features/finance/pages/FinancePage').then((m) => ({ default: m.FinancePage, })),` |
| 77 (anonymous_25) | `default: m.FinancePage, })), )` |
| 82 (anonymous_26) | `import('@/features/fiscal/pages/FiscalInvoicesPage').then((m) => ({ default: m.FiscalInvoicesPage, })),` |
| 83 (anonymous_27) | `default: m.FiscalInvoicesPage, })), )` |
| 88 (anonymous_28) | `import('@/features/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage, })),` |
| 89 (anonymous_29) | `default: m.AdminDashboardPage, })), )` |
| 94 (anonymous_30) | `import('@/features/admin/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage, })),` |
| 95 (anonymous_31) | `default: m.AdminUsersPage, })), )` |
| 100 (anonymous_32) | `import('@/features/admin/pages/AdminClinicsPage').then((m) => ({ default: m.AdminClinicsPage, })),` |
| 101 (anonymous_33) | `default: m.AdminClinicsPage, })), )` |
| 106 (anonymous_34) | `import('@/features/admin/pages/AdminFinancePage').then((m) => ({ default: m.AdminFinancePage, })),` |
| 107 (anonymous_35) | `default: m.AdminFinancePage, })), )` |
| 112 (anonymous_36) | `import('@/features/compliance/pages/CompliancePage').then((m) => ({ default: m.CompliancePage, })),` |
| 113 (anonymous_37) | `default: m.CompliancePage, })), )` |
| 118 (anonymous_38) | `import('@/features/patients/pages/PatientsPage').then((m) => ({ default: m.PatientsPage, })),` |
| 119 (anonymous_39) | `default: m.PatientsPage, })), )` |
| 124 (anonymous_40) | `import('@/features/billing/pages/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage, })),` |
| 125 (anonymous_41) | `default: m.SubscriptionPage, })), )` |
| 130 (anonymous_42) | `import('@/features/billing/pages/SubscriptionSuccessPage').then((m) => ({ default: m.SubscriptionSuccessPage, })),` |
| 131 (anonymous_43) | `default: m.SubscriptionSuccessPage, })), )` |
| 136 (anonymous_44) | `import('@/features/billing/pages/SubscriptionCancelPage').then((m) => ({ default: m.SubscriptionCancelPage, })),` |
| 137 (anonymous_45) | `default: m.SubscriptionCancelPage, })), )` |
| 142 (anonymous_46) | `import('@/features/clinical-records/pages/ClinicalRecordsPage').then((m) => ({ default: m.ClinicalRecordsPage, })),` |
| 143 (anonymous_47) | `default: m.ClinicalRecordsPage, })), )` |
| 148 (anonymous_48) | `import('@/features/clinical-records/pages/ClinicalRecordEditorPage').then((m) => ({ default: m.ClinicalRecordEditorPage, })),` |
| 149 (anonymous_49) | `default: m.ClinicalRecordEditorPage, })), )` |
| 154 (anonymous_50) | `import('@/features/clinical-records/pages/ClinicalRecordPrintPage').then((m) => ({ default: m.ClinicalRecordPrintPage, })),` |
| 155 (anonymous_51) | `default: m.ClinicalRecordPrintPage, })), )` |
| 160 (anonymous_52) | `import('@/features/inventory/pages/InventoryPage').then((m) => ({ default: m.InventoryPage, })),` |
| 161 (anonymous_53) | `default: m.InventoryPage, })), )` |
| 167 (anonymous_54) | `import('@/features/legal/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage, })),` |
| 168 (anonymous_55) | `default: m.PrivacyPolicyPage, })), )` |
| 173 (anonymous_56) | `import('@/features/legal/pages/TermsOfUsePage').then((m) => ({ default: m.TermsOfUsePage, })),` |
| 174 (anonymous_57) | `default: m.TermsOfUsePage, })), )` |
| 179 (anonymous_58) | `import('@/features/legal/pages/CookiePolicyPage').then((m) => ({ default: m.CookiePolicyPage, })),` |
| 180 (anonymous_59) | `default: m.CookiePolicyPage, })), )` |
| 185 (anonymous_60) | `import('@/features/legal/pages/DataProcessingPage').then((m) => ({ default: m.DataProcessingPage, })),` |
| 186 (anonymous_61) | `default: m.DataProcessingPage, })), )` |
| 191 (anonymous_62) | `import('@/features/legal/pages/SecurityPage').then((m) => ({ default: m.SecurityPage, })),` |
| 192 (anonymous_63) | `default: m.SecurityPage, })), )` |
| 197 (anonymous_64) | `import('@/features/legal/pages/DataRightsPage').then((m) => ({ default: m.DataRightsPage, })),` |
| 198 (anonymous_65) | `default: m.DataRightsPage, })), )` |
| 203 (anonymous_66) | `import('@/features/legal/pages/DpoContactPage').then((m) => ({ default: m.DpoContactPage, })),` |
| 204 (anonymous_67) | `default: m.DpoContactPage, })), )` |
| 209 (anonymous_68) | `import('@/features/privacy/pages/PrivacyRequestFormPage').then((m) => ({ default: m.PrivacyRequestFormPage, })),` |
| 210 (anonymous_69) | `default: m.PrivacyRequestFormPage, })), )` |
| 215 (anonymous_70) | `import('@/features/notifications/pages/NotificationSettingsPage').then((m) => ({ default: m.NotificationSettingsPage, })),` |
| 216 (anonymous_71) | `default: m.NotificationSettingsPage, })), )` |
| 221 (anonymous_72) | `import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage, })),` |
| 222 (anonymous_73) | `default: m.SettingsPage, })), )` |
| 227 (anonymous_74) | `import('@/features/fiscal/pages/FiscalProfilePage').then((m) => ({ default: m.FiscalProfilePage, })),` |
| 228 (anonymous_75) | `default: m.FiscalProfilePage, })), )` |
| 233 (anonymous_76) | `import('@/features/patients/pages/PatientsAttentionPage').then((m) => ({ default: m.PatientsAttentionPage, })),` |
| 234 (anonymous_77) | `default: m.PatientsAttentionPage, })), )` |
| 239 (anonymous_78) | `import('@/features/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage, })),` |
| 240 (anonymous_79) | `default: m.ReportsPage, })), )` |
| 246 (anonymous_80) | `import('@/features/marketing/pages/PlansPage').then((m) => ({ default: m.PlansPage, })),` |
| 247 (anonymous_81) | `default: m.PlansPage, })), )` |
| 252 (anonymous_82) | `import('@/features/marketing/pages/IntegrationsPage').then((m) => ({ default: m.IntegrationsPage, })),` |
| 253 (anonymous_83) | `default: m.IntegrationsPage, })), )` |
| 258 (anonymous_84) | `import('@/features/marketing/pages/FaqPage').then((m) => ({ default: m.FaqPage, })),` |
| 259 (anonymous_85) | `default: m.FaqPage, })), )` |
| 264 (anonymous_86) | `import('@/features/marketing/pages/ForSecretaryPage').then((m) => ({ default: m.ForSecretaryPage, })),` |
| 265 (anonymous_87) | `default: m.ForSecretaryPage, })), )` |
| 270 (anonymous_88) | `import('@/features/marketing/pages/ForDentistPage').then((m) => ({ default: m.ForDentistPage, })),` |
| 271 (anonymous_89) | `default: m.ForDentistPage, })), )` |
| 276 (anonymous_90) | `import('@/features/marketing/pages/ForManagerPage').then((m) => ({ default: m.ForManagerPage, })),` |
| 277 (anonymous_91) | `default: m.ForManagerPage, })), )` |
| 282 (anonymous_92) | `import('@/features/marketing/pages/ForNewClinicPage').then((m) => ({ default: m.ForNewClinicPage, })),` |
| 283 (anonymous_93) | `default: m.ForNewClinicPage, })), )` |
| 288 (anonymous_94) | `import('@/features/marketing/pages/AgendaFeaturePage').then((m) => ({ default: m.AgendaFeaturePage, })),` |
| 289 (anonymous_95) | `default: m.AgendaFeaturePage, })), )` |
| 294 (anonymous_96) | `import('@/features/marketing/pages/FinanceFeaturePage').then((m) => ({ default: m.FinanceFeaturePage, })),` |
| 295 (anonymous_97) | `default: m.FinanceFeaturePage, })), )` |
| 300 (anonymous_98) | `import('@/features/marketing/pages/AiFeaturePage').then((m) => ({ default: m.AiFeaturePage, })),` |
| 301 (anonymous_99) | `default: m.AiFeaturePage, })), )` |
| 306 (anonymous_100) | `import('@/features/marketing/pages/WhatsappFeaturePage').then((m) => ({ default: m.WhatsappFeaturePage, })),` |
| 307 (anonymous_101) | `default: m.WhatsappFeaturePage, })), )` |
| 312 (anonymous_102) | `import('@/features/marketing/pages/PatientsFeaturePage').then((m) => ({ default: m.PatientsFeaturePage, })),` |
| 313 (anonymous_103) | `default: m.PatientsFeaturePage, })), )` |
| 318 (anonymous_104) | `import('@/features/marketing/pages/ClinicalRecordsFeaturePage').then((m) => ({ default: m.ClinicalRecordsFeaturePage, })),` |
| 319 (anonymous_105) | `default: m.ClinicalRecordsFeaturePage, })), )` |
| 324 (anonymous_106) | `import('@/features/marketing/pages/InventoryFeaturePage').then((m) => ({ default: m.InventoryFeaturePage, })),` |
| 325 (anonymous_107) | `default: m.InventoryFeaturePage, })), )` |
| 330 (anonymous_108) | `import('@/features/marketing/pages/ReportsFeaturePage').then((m) => ({ default: m.ReportsFeaturePage, })),` |
| 331 (anonymous_109) | `default: m.ReportsFeaturePage, })), )` |
| 336 (anonymous_110) | `import('@/features/marketing/pages/FiscalFeaturePage').then((m) => ({ default: m.FiscalFeaturePage, })),` |
| 337 (anonymous_111) | `default: m.FiscalFeaturePage, })), )` |

## 212. src/features/reports/components/ReportPreviewPanel.tsx

Classification: **A**. remaining feature callbacks, optional data and conditional UI are not all exercised. Keep as open scenario coverage; do not exclude the whole file.

S/B/F/L: 80.00% / 100.00% / 100.00% / 80.00%.

- Uncovered lines: 22.
- Uncovered functions: none.

## 216. src/components/common/ListToolbar.tsx

Classification: **A**. remaining shared UI callbacks/conditional rendering need meaningful interaction or fallback tests; no exclusion.

S/B/F/L: 95.65% / 100.00% / 92.30% / 95.00%.

- Uncovered lines: 169.
- Uncovered functions: `(anonymous_10)@169`.

| Function location | Source entry / behavior still to execute |
| --- | --- |
| 169 (anonymous_10) | `onClick={() => setFilterOpen(false)} > Aplicar` |

## 217. src/features/clinical-records/hooks/useUnsavedChangesGuard.ts

Classification: **D/F**. S93.75% / B100% / F83.33% / L100%. The remaining function at line 62 is the constant `shouldBlockFn = () => true` router configuration; activation through `disabled: !isDirty`, confirmation resolution and beforeunload registration/cleanup are tested. Real navigation/history and the native unload confirmation require browser QA (F). No exclusion.
