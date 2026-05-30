import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, CheckCircle2, ClipboardList, Loader2 } from 'lucide-react'

import { AppPage } from '@/components/layout/AppPage'
import { EmptyState } from '@/components/common/EmptyState'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { ClinicalAiAssistantCard } from '../components/ClinicalAiAssistantCard'
import { ClinicalRecordActions } from '../components/ClinicalRecordActions'
import { ClinicalRecordHeader } from '../components/ClinicalRecordHeader'
import { ClinicalSectionField } from '../components/ClinicalSectionField'
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
import {
  isClinicalRecordEditable,
  isClinicalRecordReadOnly,
} from '../utils/clinical-record-status-rules'

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  recordId: string
}

// Six logical groups replace the previous nine flat tabs:
//   evolucao   — Evolução clínica (primary consultation narrative)
//   anamnese   — Anamnese (patient history)
//   diagnostico — Diagnóstico
//   plano      — Plano clínico (procedures + treatment plan + prescription + recommendations)
//   odontograma — Odontogram
//   imagens    — Images and attachments
type Tab = 'evolucao' | 'anamnese' | 'diagnostico' | 'plano' | 'odontograma' | 'imagens'

const TABS: { id: Tab; label: string }[] = [
  { id: 'evolucao', label: 'Evolução clínica' },
  { id: 'anamnese', label: 'Anamnese' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'plano', label: 'Plano clínico' },
  { id: 'odontograma', label: 'Odontograma' },
  { id: 'imagens', label: 'Imagens' },
]

// ── Container ──────────────────────────────────────────────────────────────────

export function ClinicalRecordEditorContainer({ recordId }: Props) {
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const { record, isLoading, isSaving, error, save, saveQuiet, saveAndComplete, lock, cancel, restore } =
    useClinicalRecord(recordId)
  const { templates } = useClinicalTemplates()
  // Anti-spam guard — prevents flooding the user with repeated odontogram save
  // warnings when conditions change rapidly (e.g. multi-select). Resets after
  // 10 seconds so persistent connectivity issues are still eventually surfaced.
  const odontogramAlertShownRef = useRef(false)

  const [activeTab, setActiveTab] = useState<Tab>('evolucao')
  const [draft, setDraft] = useState<UpdateClinicalRecordDto>({})
  const [odontogramData, setOdontogramData] = useState<OdontogramData>({ teeth: {} })
  const [odontogramLoaded, setOdontogramLoaded] = useState(false)

  // Autosave wiring — only fires for DRAFT records with pending changes.
  // canAutosave is derived from record?.status so the hook is called unconditionally.
  const { autosaveStatus, cancelPendingAutosave } = useClinicalRecordAutosave({
    draft,
    setDraft,
    record,
    canAutosave: record?.status === 'DRAFT',
    saveQuiet,
  })

  // Navigation guard — warns before leaving when there are unsaved draft changes.
  // Inactive when draft is empty, record is null/loading, or status is not DRAFT.
  useUnsavedChangesGuard({
    isDirty: record?.status === 'DRAFT' && Object.keys(draft).length > 0,
  })

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

  // Per-status contextual read-only notice — tone and text differ per state.
  // LOCKED: permanent, no restore path exists.
  // CANCELED: prompts the user to restore (restore returns to DRAFT).
  // COMPLETED: informs and describes the path back (cancel → restore).
  const readOnlyNotice: { tone: 'info' | 'warning'; text: string } | null =
    record.status === 'LOCKED'
      ? { tone: 'info', text: 'Prontuário bloqueado permanentemente — este registro não pode mais ser editado.' }
      : record.status === 'CANCELED'
      ? { tone: 'warning', text: 'Prontuário cancelado. Use "Restaurar prontuário" para reativar a edição.' }
      : record.status === 'COMPLETED'
      ? { tone: 'info', text: 'Prontuário concluído e em modo somente leitura. Para reabrir, cancele e restaure o registro.' }
      : null

  const field = (key: keyof UpdateClinicalRecordDto) =>
    (draft[key] as string | undefined) ?? (record[key as keyof typeof record] as string | null) ?? ''

  const setField = (key: keyof UpdateClinicalRecordDto) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  // Content-dot indicator helpers — pure checks over existing state, no API calls.
  const hasContent = (key: keyof UpdateClinicalRecordDto): boolean =>
    field(key).trim().length > 0

  const tabHasContent = (tabId: Tab): boolean => {
    switch (tabId) {
      case 'evolucao':    return hasContent('clinicalEvolution')
      case 'anamnese':    return hasContent('anamnesis')
      case 'diagnostico': return hasContent('diagnosis')
      case 'plano':       return (
        hasContent('proceduresPerformed') ||
        hasContent('treatmentPlan') ||
        hasContent('prescription') ||
        hasContent('recommendations')
      )
      case 'odontograma': return Object.keys(odontogramData.teeth).length > 0
      case 'imagens':     return false // requires an API call — not tracked locally
      default:            return false
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleApplyTemplate = (template: ClinicalTemplate) => {
    if (!canEditClinicalContent) return

    const fieldMap: Record<string, keyof UpdateClinicalRecordDto> = {
      ANAMNESIS: 'anamnesis',
      EVOLUTION: 'clinicalEvolution',
      PRESCRIPTION: 'prescription',
      RECOMMENDATION: 'recommendations',
      PROCEDURE: 'proceduresPerformed',
    }
    const targetField = fieldMap[template.category]
    if (!targetField) return
    const current = field(targetField)
    setField(targetField)(current ? `${current}\n\n${template.content}` : template.content)
    // Treatment-related categories all navigate to the unified 'plano' tab.
    setActiveTab(
      template.category === 'ANAMNESIS'   ? 'anamnese' :
      template.category === 'EVOLUTION'   ? 'evolucao' :
      template.category === 'PRESCRIPTION'  ? 'plano' :
      template.category === 'RECOMMENDATION' ? 'plano' :
      template.category === 'PROCEDURE'   ? 'plano' : activeTab,
    )
  }

  const handleSaveDraft = async () => {
    if (!canEditClinicalContent) return

    // Cancel any pending autosave before the manual save fires — prevents
    // a redundant API call immediately after the manual save completes.
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
      // Anti-spam: show the warning at most once per 10 seconds to avoid
      // flooding the user when teeth conditions change in rapid succession.
      if (!odontogramAlertShownRef.current) {
        odontogramAlertShownRef.current = true
        showAlert({
          title: 'Odontograma não salvo',
          description: 'Não foi possível salvar o odontograma. Verifique sua conexão.',
          tone: 'warning',
        })
        setTimeout(() => { odontogramAlertShownRef.current = false }, 10_000)
      }
    })
  }

  const handleComplete = () => saveAndComplete(draft)
  const handleLock = () => lock()
  const handleCancel = () => cancel()
  const handleRestore = () => restore()

  const handlePrint = () => {
    void navigate({
      to: '/app/prontuario/$clinicalRecordId/imprimir',
      params: { clinicalRecordId: recordId },
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AppPage>
      {/* ── Back navigation ───────────────────────────────────────────── */}
      <Link
        to="/app/prontuario"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Prontuários
      </Link>

      {/* ── Patient header ────────────────────────────────────────────── */}
      <ClinicalRecordHeader record={record} />

      {/* ── Read-only notice ──────────────────────────────────────────── */}
      {readOnlyNotice && (
        <InlineFeedback tone={readOnlyNotice.tone}>
          {readOnlyNotice.text}
        </InlineFeedback>
      )}

      {/* ── Action bar + autosave status ──────────────────────────────── */}
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

      {/* ── Main content grid ─────────────────────────────────────────── */}
      {/*
       * Single JSX tree for all screen sizes.
       * Mobile / tablet (< xl): single column — sidebar stacks below main content.
       * Desktop (xl+): 4-column grid — main spans 3 cols, sidebar 1 col.
       */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">

        {/* ── Main editor — 3 cols on xl ──────────────────────────────── */}
        <div className="space-y-4 xl:col-span-3">

          {/* Chief complaint — always visible above the tab panel */}
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

          {/* ── Tabbed clinical sections ─────────────────────────────── */}
          {/* 6 tabs (reduced from 9): Evolução · Anamnese · Diagnóstico · Plano clínico · Odontograma · Imagens */}
          <div className="rounded-xl border border-border bg-card">
            {/* Tab bar — scrollable on narrow viewports */}
            <div className="overflow-x-auto border-b border-border">
              <nav role="tablist" aria-label="Seções do prontuário" className="flex min-w-max">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab.label}
                    {tabHasContent(tab.id) && (
                      <span
                        className={cn(
                          'inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full',
                          activeTab === tab.id ? 'bg-primary' : 'bg-muted-foreground/40',
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Active tab panel */}
            <div
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="p-5"
            >
              {/* ── Evolução clínica ───── */}
              {activeTab === 'evolucao' && (
                <ClinicalSectionField
                  label="Evolução clínica"
                  value={field('clinicalEvolution')}
                  onChange={setField('clinicalEvolution')}
                  placeholder="Achados clínicos, evolução do caso, exame intraoral, condição periodontal, achados radiográficos relevantes, resposta do paciente..."
                  readOnly={isReadOnly}
                  rows={8}
                />
              )}

              {/* ── Anamnese ──────────── */}
              {activeTab === 'anamnese' && (
                <ClinicalSectionField
                  label="Anamnese"
                  value={field('anamnesis')}
                  onChange={setField('anamnesis')}
                  placeholder="Histórico médico geral, alergias medicamentosas e alimentares, medicamentos em uso (nome e dosagem), condições sistêmicas (diabetes, hipertensão, coagulopatia), hábitos (tabagismo, bruxismo), histórico odontológico relevante..."
                  readOnly={isReadOnly}
                  rows={8}
                />
              )}

              {/* ── Diagnóstico ───────── */}
              {activeTab === 'diagnostico' && (
                <ClinicalSectionField
                  label="Diagnóstico / Hipótese diagnóstica"
                  value={field('diagnosis')}
                  onChange={setField('diagnosis')}
                  placeholder="Diagnóstico clínico ou hipótese diagnóstica, CID correspondente se aplicável, dentes e regiões envolvidos, achados clínicos e radiográficos que embasam o diagnóstico..."
                  readOnly={isReadOnly}
                  rows={6}
                />
              )}

              {/* ── Plano clínico — 4 fields stacked ── */}
              {activeTab === 'plano' && (
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
              )}

              {/* ── Odontograma ───────── */}
              {activeTab === 'odontograma' && (
                <OdontogramSection
                  data={odontogramData}
                  onChange={handleOdontogramChange}
                  readOnly={isReadOnly}
                />
              )}

              {/* ── Imagens e anexos ─── */}
              {activeTab === 'imagens' && (
                <ImageAttachmentPanel
                  recordId={recordId}
                  readOnly={isReadOnly}
                />
              )}
            </div>
          </div>

          {/* Private notes — not printed.
              Editable in DRAFT; shown as read-only when data exists in any other status. */}
          {!isReadOnly ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 dark:border-amber-800/30 dark:bg-amber-950/20">
              <ClinicalSectionField
                label="Notas privadas (não imprimíveis)"
                value={field('privateNotes')}
                onChange={setField('privateNotes')}
                placeholder="Observações internas, contexto do caso, anotações do profissional — não aparecem no documento impresso..."
                rows={3}
              />
            </div>
          ) : record.privateNotes ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-5 dark:border-amber-800/30 dark:bg-amber-950/10">
              <ClinicalSectionField
                label="Notas privadas (não imprimíveis)"
                value={record.privateNotes}
                onChange={() => {}}
                readOnly
                rows={3}
              />
            </div>
          ) : null}
        </div>

        {/* ── Sidebar — 1 col on xl, stacks below main on mobile ──────── */}
        <div className="space-y-4">
          {canEditClinicalContent && (
            <>
              <ClinicalTemplateSelectorPanel
                templates={templates}
                onApply={handleApplyTemplate}
              />
              <ClinicalAiAssistantCard />
            </>
          )}
        </div>
      </div>

      {/* ── Patient history ───────────────────────────────────────────── */}
      {/* Placed below the main grid so current record editing stays      */}
      {/* unchanged. Always shown regardless of record status.            */}
      <PatientHistoryPanel
        currentRecordId={record.id}
        identifier={identifier}
      />
    </AppPage>
  )
}

// ── AutosaveIndicator ─────────────────────────────────────────────────────────

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
