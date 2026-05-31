import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Activity,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  EyeOff,
  FileText,
  Images,
  Loader2,
  Microscope,
  Smile,
} from 'lucide-react'

import { AppPage } from '@/components/layout/AppPage'
import { EmptyState } from '@/components/common/EmptyState'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'

import { VoiceDictationCard } from '../components/VoiceDictationCard'
import { ClinicalRecordActions } from '../components/ClinicalRecordActions'
import { ClinicalRecordHeader } from '../components/ClinicalRecordHeader'
import { ClinicalSection } from '../components/ClinicalSection'
import { ClinicalSectionField } from '../components/ClinicalSectionField'
import { ClinicalStickyBar } from '../components/ClinicalStickyBar'
import { ClinicalTemplateSelectorPanel } from '../components/ClinicalTemplateSelectorPanel'
import { ImageAttachmentPanel } from '../components/ImageAttachmentPanel'
import { OdontogramSection } from '../components/OdontogramSection'
import { PatientHistoryPanel } from '../components/PatientHistoryPanel'
import { useClinicalRecord } from '../hooks/useClinicalRecord'
import {
  useClinicalRecordAutosave,
  type AutosaveStatus,
} from '../hooks/useClinicalRecordAutosave'
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'
import { useClinicalTemplates } from '../hooks/useClinicalTemplates'
import { getOdontogram, upsertOdontogram } from '../services/clinical-records.service'
import type { ClinicalTemplate, OdontogramData, UpdateClinicalRecordDto } from '../types/clinical-record.types'
import type { ClinicalDictationFieldKey } from '../types/clinical-dictation.types'
import {
  isClinicalRecordEditable,
  isClinicalRecordReadOnly,
} from '../utils/clinical-record-status-rules'
import { applyDictationFields } from '../utils/apply-clinical-dictation-fields'

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  recordId: string
}

type SectionId =
  | 'evolucao'
  | 'anamnese'
  | 'diagnostico'
  | 'plano'
  | 'odontograma'
  | 'imagens'
  | 'notas-privadas'

type SectionExpanded = Record<SectionId, boolean>

// Default expansion for a DRAFT record: show the two most-used sections open.
const DRAFT_DEFAULTS: SectionExpanded = {
  evolucao:        true,
  anamnese:        false,
  diagnostico:     false,
  plano:           false,
  odontograma:     true,
  imagens:         false,
  'notas-privadas': false,
}

// Template category → section to open when template is applied.
const TEMPLATE_SECTION_MAP: Partial<Record<string, SectionId>> = {
  ANAMNESIS:      'anamnese',
  EVOLUTION:      'evolucao',
  PRESCRIPTION:   'plano',
  RECOMMENDATION: 'plano',
  PROCEDURE:      'plano',
}

// ── Container ──────────────────────────────────────────────────────────────────

export function ClinicalRecordEditorContainer({ recordId }: Props) {
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const { record, isLoading, isSaving, error, save, saveQuiet, saveAndComplete, lock, cancel, restore } =
    useClinicalRecord(recordId)
  const { templates } = useClinicalTemplates()

  // Anti-spam guard — prevents flooding the user with repeated odontogram save
  // warnings when conditions change rapidly (e.g. multi-select). Resets after 10 s.
  const odontogramAlertShownRef = useRef(false)
  const odontogramAlertResetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [draft, setDraft] = useState<UpdateClinicalRecordDto>({})
  const [odontogramData, setOdontogramData] = useState<OdontogramData>({ teeth: {} })
  const [odontogramLoaded, setOdontogramLoaded] = useState(false)

  // Section expand/collapse — initialized with DRAFT defaults.
  // A one-shot effect below adjusts these once the record loads for non-DRAFT records
  // so that only sections with content are open.
  const [sectionExpanded, setSectionExpanded] = useState<SectionExpanded>(DRAFT_DEFAULTS)
  const sectionInitRef = useRef(false)

  // Autosave wiring — only fires for DRAFT records with pending changes.
  const { autosaveStatus, cancelPendingAutosave } = useClinicalRecordAutosave({
    draft,
    setDraft,
    record,
    canAutosave: record?.status === 'DRAFT',
    saveQuiet,
  })

  // Navigation guard — warns before leaving when there are unsaved draft changes.
  useUnsavedChangesGuard({
    isDirty: record?.status === 'DRAFT' && Object.keys(draft).length > 0,
  })

  // Load the patient-level odontogram once the record is available.
  useEffect(() => {
    if (!record || odontogramLoaded) return
    const identifier = record.patientEmail ?? record.patientName
    let isCurrent = true

    getOdontogram(identifier)
      .then((data) => {
        if (isCurrent && data) setOdontogramData(data.data)
      })
      .catch(() => { /* odontogram is optional — ignore load errors */ })
      .finally(() => {
        if (isCurrent) setOdontogramLoaded(true)
      })

    return () => { isCurrent = false }
  }, [record, odontogramLoaded])

  // For non-DRAFT records: auto-expand sections that have content so the
  // reviewer immediately sees what was documented without extra interaction.
  useEffect(() => {
    if (!record || sectionInitRef.current) return
    sectionInitRef.current = true

    if (record.status !== 'DRAFT') {
      setSectionExpanded({
        evolucao:        !!record.clinicalEvolution,
        anamnese:        !!record.anamnesis,
        diagnostico:     !!record.diagnosis,
        plano:           !!(record.proceduresPerformed || record.treatmentPlan || record.prescription || record.recommendations),
        odontograma:     true,
        imagens:         false, // unknown until attachments load
        'notas-privadas': !!record.privateNotes,
      })
    }
  }, [record])

  // Clear the odontogram alert reset timer on unmount.
  useEffect(() => {
    return () => {
      if (odontogramAlertResetRef.current) clearTimeout(odontogramAlertResetRef.current)
    }
  }, [])

  // ── Early returns ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <AppPage>
        <LoadingCard message="Carregando prontuário..." />
      </AppPage>
    )
  }

  if (error) {
    return (
      <AppPage>
        <InlineFeedback tone="error">{error}</InlineFeedback>
      </AppPage>
    )
  }

  if (!record) {
    return (
      <AppPage>
        <EmptyState
          icon={ClipboardList}
          title="Prontuário não encontrado"
          description="Este prontuário não existe ou você não tem permissão para acessá-lo."
          action={
            <Link to="/app/prontuario">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar aos prontuários
              </Button>
            </Link>
          }
        />
      </AppPage>
    )
  }

  // ── Derived state ────────────────────────────────────────────────────────────

  const canEditClinicalContent = isClinicalRecordEditable(record.status)
  const isReadOnly = isClinicalRecordReadOnly(record.status)
  const identifier = record.patientEmail ?? record.patientName

  const readOnlyNotice: { tone: 'info' | 'warning'; text: string } | null =
    record.status === 'LOCKED'
      ? { tone: 'info',    text: 'Prontuário bloqueado permanentemente — este registro não pode mais ser editado.' }
      : record.status === 'CANCELED'
      ? { tone: 'warning', text: 'Prontuário cancelado. Use "Restaurar prontuário" para reativar a edição.' }
      : record.status === 'COMPLETED'
      ? { tone: 'info',    text: 'Prontuário concluído e em modo somente leitura. Para reabrir, cancele e restaure o registro.' }
      : null

  // Draft-or-server field value reader.
  const field = (key: keyof UpdateClinicalRecordDto) =>
    (draft[key] as string | undefined) ?? (record[key as keyof typeof record] as string | null) ?? ''

  const setField = (key: keyof UpdateClinicalRecordDto) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const hasContent = (key: keyof UpdateClinicalRecordDto): boolean =>
    field(key).trim().length > 0

  // ── Section expand helpers ───────────────────────────────────────────────────

  const toggleSection = (id: SectionId) =>
    setSectionExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const openSection = (id: SectionId) =>
    setSectionExpanded((prev) => ({ ...prev, [id]: true }))

  // Whether a section has any filled content — drives the dot indicator.
  const sectionHasContent = (id: SectionId): boolean => {
    switch (id) {
      case 'evolucao':        return hasContent('clinicalEvolution')
      case 'anamnese':        return hasContent('anamnesis')
      case 'diagnostico':     return hasContent('diagnosis')
      case 'plano':           return hasContent('proceduresPerformed') || hasContent('treatmentPlan') || hasContent('prescription') || hasContent('recommendations')
      case 'odontograma':     return Object.keys(odontogramData.teeth).length > 0
      case 'imagens':         return false // not tracked locally; API-driven
      case 'notas-privadas':  return hasContent('privateNotes')
      default:                return false
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleApplyTemplate = (template: ClinicalTemplate) => {
    if (!canEditClinicalContent) return

    const fieldMap: Record<string, keyof UpdateClinicalRecordDto> = {
      ANAMNESIS:      'anamnesis',
      EVOLUTION:      'clinicalEvolution',
      PRESCRIPTION:   'prescription',
      RECOMMENDATION: 'recommendations',
      PROCEDURE:      'proceduresPerformed',
    }
    const targetField = fieldMap[template.category]
    if (!targetField) return

    const current = field(targetField)
    setField(targetField)(current ? `${current}\n\n${template.content}` : template.content)

    // Open the target section so the user sees the inserted text.
    const targetSection = TEMPLATE_SECTION_MAP[template.category]
    if (targetSection) openSection(targetSection)
  }

  const handleSaveDraft = async () => {
    if (!canEditClinicalContent) return
    cancelPendingAutosave()
    await save(draft)
    if (Object.keys(odontogramData.teeth).length > 0) {
      upsertOdontogram(identifier, record.patientName, odontogramData).catch(() => {
        showAlert({
          title: 'Odontograma não salvo',
          description: 'Não foi possível salvar o odontograma durante o salvamento do rascunho.',
          tone: 'warning',
        })
      })
    }
  }

  const handleOdontogramChange = (data: OdontogramData) => {
    if (!canEditClinicalContent) return
    setOdontogramData(data)
    upsertOdontogram(identifier, record.patientName, data).catch(() => {
      if (!odontogramAlertShownRef.current) {
        odontogramAlertShownRef.current = true
        showAlert({
          title: 'Odontograma não salvo',
          description: 'Não foi possível salvar o odontograma. Verifique sua conexão.',
          tone: 'warning',
        })
        if (odontogramAlertResetRef.current) clearTimeout(odontogramAlertResetRef.current)
        odontogramAlertResetRef.current = setTimeout(() => { odontogramAlertShownRef.current = false }, 10_000)
      }
    })
  }

  // Merges dictation suggestions into the draft fields.
  // Pure logic is delegated to applyDictationFields so it can be tested independently.
  // Calling setField() enters the normal draft/autosave pipeline — no bypass occurs.
  const handleApplyDictationFields = (fields: Partial<Record<ClinicalDictationFieldKey, string>>) => {
    if (!canEditClinicalContent) return

    // Snapshot current field values (draft overrides applied on top of record)
    const currentValues: Record<string, string> = {}
    for (const key of Object.keys(fields)) {
      currentValues[key] = field(key as keyof UpdateClinicalRecordDto)
    }

    const { draftPatch, targetSection } = applyDictationFields(fields, currentValues)

    for (const [key, value] of Object.entries(draftPatch)) {
      setField(key as keyof UpdateClinicalRecordDto)(value as string)
    }

    if (targetSection) openSection(targetSection)
  }

  const handleComplete = () => saveAndComplete(draft)
  const handleLock     = () => lock()
  const handleCancel   = () => cancel()
  const handleRestore  = () => restore()
  const handlePrint    = () =>
    navigate({
      to: '/app/prontuario/$clinicalRecordId/imprimir',
      params: { clinicalRecordId: recordId },
    })

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Sticky identity + quick actions bar ─────────────────────────────── */}
      {/* Renders outside AppPage so it can break out of the main's padding.    */}
      {/* Shows patient name, status badge, and Save/Complete for DRAFT records. */}
      <ClinicalStickyBar
        record={record}
        isSaving={isSaving}
        autosaveStatus={autosaveStatus}
        onSaveDraft={handleSaveDraft}
        onComplete={handleComplete}
      />

      <AppPage>
        {/* ── Back navigation ─────────────────────────────────────────────── */}
        <Link
          to="/app/prontuario"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Prontuários
        </Link>

        {/* ── Patient header ───────────────────────────────────────────────── */}
        <ClinicalRecordHeader record={record} />

        {/* ── Read-only notice ─────────────────────────────────────────────── */}
        {readOnlyNotice && (
          <InlineFeedback tone={readOnlyNotice.tone}>
            {readOnlyNotice.text}
          </InlineFeedback>
        )}

        {/* ── Full action bar ──────────────────────────────────────────────── */}
        {/* Contains all status transitions including the destructive ones     */}
        {/* (Lock, Cancel, Restore) with their confirmation dialogs.           */}
        {/* The sticky bar above handles Save/Complete for quick access.       */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <ClinicalRecordActions
            record={record}
            isSaving={isSaving}
            onSaveDraft={handleSaveDraft}
            onComplete={handleComplete}
            onLock={handleLock}
            onCancel={handleCancel}
            onRestore={handleRestore}
            onPrint={handlePrint}
          />
          {canEditClinicalContent && <AutosaveIndicator status={autosaveStatus} />}
        </div>

        {/* ── Main content grid ────────────────────────────────────────────── */}
        {/*
         * Single JSX tree for all screen sizes.
         * Mobile / tablet (< lg): single column — sidebar stacks below main.
         * Desktop (lg+): 4-column grid — main spans 3 cols, sidebar 1 col.
         * Changed from xl: (1280 px) to lg: (1024 px) so the sidebar is
         * visible on 13-inch laptops and common tablet/desktop breakpoints.
         */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">

          {/* ── Main editor — 3 cols on lg ────────────────────────────────── */}
          <div className="space-y-4 lg:col-span-3">

            {/* Chief complaint — always visible, intentionally not collapsible.
                It is the single most important field and must be prominent.  */}
            <div className="rounded-xl border border-border bg-card p-5">
              <ClinicalSectionField
                label="Queixa principal"
                value={field('chiefComplaint')}
                onChange={setField('chiefComplaint')}
                placeholder="Principal motivo da consulta, em palavras do paciente..."
                readOnly={isReadOnly}
                rows={2}
              />
            </div>

            {/* ── Evolução clínica ────────────────────────────────────────── */}
            <ClinicalSection
              id="evolucao"
              title="Evolução clínica"
              icon={Activity}
              hasContent={sectionHasContent('evolucao')}
              expanded={sectionExpanded.evolucao}
              onToggle={() => toggleSection('evolucao')}
            >
              {/* hideLabel: section title already communicates this field's purpose */}
              <ClinicalSectionField
                label="Evolução clínica"
                hideLabel
                value={field('clinicalEvolution')}
                onChange={setField('clinicalEvolution')}
                placeholder="Achados clínicos, evolução do caso, exame intraoral, condição periodontal, achados radiográficos relevantes, resposta do paciente..."
                readOnly={isReadOnly}
                rows={8}
              />
            </ClinicalSection>

            {/* ── Anamnese ────────────────────────────────────────────────── */}
            <ClinicalSection
              id="anamnese"
              title="Anamnese"
              icon={FileText}
              hasContent={sectionHasContent('anamnese')}
              expanded={sectionExpanded.anamnese}
              onToggle={() => toggleSection('anamnese')}
            >
              {/* hideLabel: section title already communicates this field's purpose */}
              <ClinicalSectionField
                label="Anamnese"
                hideLabel
                value={field('anamnesis')}
                onChange={setField('anamnesis')}
                placeholder="Histórico médico geral, alergias medicamentosas e alimentares, medicamentos em uso (nome e dosagem), condições sistêmicas (diabetes, hipertensão, coagulopatia), hábitos (tabagismo, bruxismo), histórico odontológico relevante..."
                readOnly={isReadOnly}
                rows={8}
              />
            </ClinicalSection>

            {/* ── Diagnóstico ─────────────────────────────────────────────── */}
            <ClinicalSection
              id="diagnostico"
              title="Diagnóstico"
              icon={Microscope}
              hasContent={sectionHasContent('diagnostico')}
              expanded={sectionExpanded.diagnostico}
              onToggle={() => toggleSection('diagnostico')}
            >
              {/* hideLabel: section title already communicates this field's purpose */}
              <ClinicalSectionField
                label="Diagnóstico / Hipótese diagnóstica"
                hideLabel
                value={field('diagnosis')}
                onChange={setField('diagnosis')}
                placeholder="Diagnóstico clínico ou hipótese diagnóstica, CID correspondente se aplicável, dentes e regiões envolvidos, achados clínicos e radiográficos que embasam o diagnóstico..."
                readOnly={isReadOnly}
                rows={6}
              />
            </ClinicalSection>

            {/* ── Plano clínico ────────────────────────────────────────────── */}
            {/* Four sub-fields stacked: procedures, treatment plan,
                prescription, recommendations. Kept as a single section
                to reduce cognitive overhead during the consultation.       */}
            <ClinicalSection
              id="plano"
              title="Plano clínico"
              icon={ClipboardList}
              hasContent={sectionHasContent('plano')}
              expanded={sectionExpanded.plano}
              onToggle={() => toggleSection('plano')}
            >
              <div className="space-y-6">
                <ClinicalSectionField
                  label="Procedimentos realizados"
                  hint="Nesta consulta"
                  value={field('proceduresPerformed')}
                  onChange={setField('proceduresPerformed')}
                  placeholder="Técnica anestésica utilizada, materiais e instrumentos, dentes tratados (numeração), etapas executadas e observações do procedimento..."
                  readOnly={isReadOnly}
                  rows={5}
                />
                <div className="border-t border-border" />
                <ClinicalSectionField
                  label="Plano de tratamento"
                  hint="Próximas etapas"
                  value={field('treatmentPlan')}
                  onChange={setField('treatmentPlan')}
                  placeholder="Sequência de tratamento proposta: prioridades, fases, estimativa de sessões, necessidade de encaminhamento especializado..."
                  readOnly={isReadOnly}
                  rows={5}
                />
                <div className="border-t border-border" />
                <ClinicalSectionField
                  label="Prescrição / Medicamentos"
                  value={field('prescription')}
                  onChange={setField('prescription')}
                  placeholder="Ex: Amoxicilina 500mg — 1 cápsula 8/8h por 7 dias com alimento. Dipirona 500mg — 1 comprimido se necessário (máx. 4x/dia, intervalo mínimo 6h)..."
                  readOnly={isReadOnly}
                  rows={4}
                />
                <div className="border-t border-border" />
                <ClinicalSectionField
                  label="Recomendações ao paciente"
                  value={field('recommendations')}
                  onChange={setField('recommendations')}
                  placeholder="Cuidados pós-consulta, higiene oral, restrições alimentares, sinais de alerta para retorno imediato, data do próximo atendimento programado..."
                  readOnly={isReadOnly}
                  rows={4}
                />
              </div>
            </ClinicalSection>

            {/* ── Odontograma ─────────────────────────────────────────────── */}
            <ClinicalSection
              id="odontograma"
              title="Odontograma"
              icon={Smile}
              hasContent={sectionHasContent('odontograma')}
              expanded={sectionExpanded.odontograma}
              onToggle={() => toggleSection('odontograma')}
            >
              {/* showTitle={false}: ClinicalSection header already says "Odontograma" */}
              <OdontogramSection
                data={odontogramData}
                onChange={handleOdontogramChange}
                readOnly={isReadOnly}
                showTitle={false}
              />
            </ClinicalSection>

            {/* ── Imagens e anexos ─────────────────────────────────────────── */}
            <ClinicalSection
              id="imagens"
              title="Imagens e anexos"
              icon={Images}
              hasContent={sectionHasContent('imagens')}
              expanded={sectionExpanded.imagens}
              onToggle={() => toggleSection('imagens')}
            >
              {/* showTitle={false}: ClinicalSection header already says "Imagens e anexos" */}
              <ImageAttachmentPanel
                recordId={recordId}
                readOnly={isReadOnly}
                showTitle={false}
              />
            </ClinicalSection>

            {/* ── Notas privadas ───────────────────────────────────────────── */}
            {/* Only rendered when editing (DRAFT) or when content exists     */}
            {/* to preserve in read-only view. Amber styling signals it is    */}
            {/* internal and will not appear in printed documents.            */}
            {(!isReadOnly || record.privateNotes) && (
              <ClinicalSection
                id="notas-privadas"
                title="Notas privadas (não imprimíveis)"
                icon={EyeOff}
                hasContent={sectionHasContent('notas-privadas')}
                expanded={sectionExpanded['notas-privadas']}
                onToggle={() => toggleSection('notas-privadas')}
                className="border-amber-100 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-950/20"
              >
                {/* hideLabel: section title already says "Notas privadas" */}
                <ClinicalSectionField
                  label="Notas privadas"
                  hideLabel
                  value={isReadOnly ? (record.privateNotes ?? '') : field('privateNotes')}
                  onChange={setField('privateNotes')}
                  placeholder="Observações internas, contexto do caso, anotações do profissional — não aparecem no documento impresso..."
                  readOnly={isReadOnly}
                  rows={3}
                />
              </ClinicalSection>
            )}
          </div>

          {/* ── Sidebar — 1 col on lg, stacks below main on mobile ─────────── */}
          <div className="space-y-4">
            {canEditClinicalContent && (
              <>
                <ClinicalTemplateSelectorPanel
                  templates={templates}
                  onApply={handleApplyTemplate}
                />
                <VoiceDictationCard
                  recordId={recordId}
                  readOnly={isReadOnly}
                  onApplyFields={handleApplyDictationFields}
                />
              </>
            )}
          </div>
        </div>

        {/* ── Patient history ──────────────────────────────────────────────── */}
        <PatientHistoryPanel
          currentRecordId={record.id}
          identifier={identifier}
        />
      </AppPage>
    </>
  )
}

// ── AutosaveIndicator ─────────────────────────────────────────────────────────
// Full-text version shown next to the main action bar.

function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === 'idle') return null

  return (
    <div
      className="flex items-center gap-1.5 text-xs"
      aria-live="polite"
      aria-atomic="true"
    >
      {status === 'pending' && (
        <span className="text-muted-foreground">Aguardando para salvar...</span>
      )}
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">Salvando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />
          <span className="text-emerald-600 dark:text-emerald-400">Salvo automaticamente</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-amber-500" aria-hidden="true" />
          <span className="text-amber-600 dark:text-amber-400">
            Falha ao salvar — use &ldquo;Salvar agora&rdquo;
          </span>
        </>
      )}
    </div>
  )
}
