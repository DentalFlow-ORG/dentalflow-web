import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ClipboardList } from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { useIsMobile } from '@/hooks/useIsMobile'

import { ClinicalAiAssistantCard } from '../components/ClinicalAiAssistantCard'
import { ClinicalRecordActions } from '../components/ClinicalRecordActions'
import { ClinicalRecordHeader } from '../components/ClinicalRecordHeader'
import { ClinicalSectionField } from '../components/ClinicalSectionField'
import { ClinicalTemplateSelectorPanel } from '../components/ClinicalTemplateSelectorPanel'
import { ImageAttachmentPanel } from '../components/ImageAttachmentPanel'
import { OdontogramSection } from '../components/OdontogramSection'
import { useClinicalRecord } from '../hooks/useClinicalRecord'
import { useClinicalTemplates } from '../hooks/useClinicalTemplates'
import { getOdontogram, upsertOdontogram } from '../services/clinical-records.service'
import type { ClinicalTemplate, OdontogramData, UpdateClinicalRecordDto } from '../types/clinical-record.types'

type Props = {
  recordId: string
}

type Tab = 'anamnese' | 'evolucao' | 'diagnostico' | 'procedimentos' | 'plano' | 'prescricao' | 'recomendacoes' | 'odontograma' | 'imagens'

const TABS: { id: Tab; label: string }[] = [
  { id: 'anamnese', label: 'Anamnese' },
  { id: 'evolucao', label: 'Evolução clínica' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'procedimentos', label: 'Procedimentos' },
  { id: 'plano', label: 'Plano de tratamento' },
  { id: 'prescricao', label: 'Prescrição' },
  { id: 'recomendacoes', label: 'Recomendações' },
  { id: 'odontograma', label: 'Odontograma' },
  { id: 'imagens', label: 'Imagens e anexos' },
]

export function ClinicalRecordEditorContainer({ recordId }: Props) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { record, isLoading, isSaving, error, save, saveAndComplete, lock, cancel, restore } =
    useClinicalRecord(recordId)
  const { templates } = useClinicalTemplates()

  const [activeTab, setActiveTab] = useState<Tab>('evolucao')
  const [draft, setDraft] = useState<UpdateClinicalRecordDto>({})
  const [odontogramData, setOdontogramData] = useState<OdontogramData>({ teeth: {} })
  const [odontogramLoaded, setOdontogramLoaded] = useState(false)

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

  if (isLoading) return <LoadingCard message="Carregando prontuário..." />
  if (error) return <InlineFeedback tone="error">{error}</InlineFeedback>
  if (!record) return null

  const isReadOnly = record.status === 'LOCKED' || record.status === 'CANCELED'
  const identifier = record.patientEmail ?? record.patientName

  const field = (key: keyof UpdateClinicalRecordDto) =>
    (draft[key] as string | undefined) ?? (record[key as keyof typeof record] as string | null) ?? ''

  const setField = (key: keyof UpdateClinicalRecordDto) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const handleApplyTemplate = (template: ClinicalTemplate) => {
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
    setActiveTab(
      template.category === 'ANAMNESIS' ? 'anamnese' :
      template.category === 'EVOLUTION' ? 'evolucao' :
      template.category === 'PRESCRIPTION' ? 'prescricao' :
      template.category === 'RECOMMENDATION' ? 'recomendacoes' :
      template.category === 'PROCEDURE' ? 'procedimentos' : activeTab,
    )
  }

  const handleSaveDraft = async () => {
    await save(draft)
    if (Object.keys(odontogramData.teeth).length > 0) {
      upsertOdontogram(identifier, record.patientName, odontogramData).catch(() => {})
    }
  }

  const handleOdontogramChange = (data: OdontogramData) => {
    setOdontogramData(data)
    if (!isReadOnly) {
      upsertOdontogram(identifier, record.patientName, data).catch(() => {})
    }
  }

  const handleComplete = () => saveAndComplete(draft)
  const handleLock = () => lock()
  const handleCancel = () => cancel()
  const handleRestore = () => restore()

  const handlePrint = () => {
    void navigate({ to: '/app/prontuario/$clinicalRecordId/imprimir', params: { clinicalRecordId: recordId } })
  }

  return (
    <div className="space-y-5">
      <ClinicalRecordHeader record={record} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">
            Criado por {record.createdByUser.firstName} {record.createdByUser.lastName}
          </span>
        </div>
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
      </div>

      {isMobile ? (
        /* ── Mobile: all sections stacked vertically ── */
        <div className="space-y-4">
          {/* Templates at top on mobile — visible shortcut before filling in fields */}
          <ClinicalTemplateSelectorPanel
            templates={templates}
            onApply={handleApplyTemplate}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ClinicalSectionField
              label="Queixa principal"
              value={field('chiefComplaint')}
              onChange={setField('chiefComplaint')}
              placeholder="Descreva a queixa principal do paciente..."
              readOnly={isReadOnly}
              rows={2}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ClinicalSectionField
              label="Anamnese"
              value={field('anamnesis')}
              onChange={setField('anamnesis')}
              placeholder="Histórico médico, alergias, medicamentos em uso, antecedentes familiares..."
              readOnly={isReadOnly}
              rows={4}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ClinicalSectionField
              label="Evolução clínica"
              value={field('clinicalEvolution')}
              onChange={setField('clinicalEvolution')}
              placeholder="Descreva a evolução clínica do atendimento..."
              readOnly={isReadOnly}
              rows={4}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ClinicalSectionField
              label="Diagnóstico / Hipótese diagnóstica"
              value={field('diagnosis')}
              onChange={setField('diagnosis')}
              placeholder="CID, hipótese diagnóstica ou diagnóstico diferencial..."
              readOnly={isReadOnly}
              rows={4}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ClinicalSectionField
              label="Procedimentos realizados"
              value={field('proceduresPerformed')}
              onChange={setField('proceduresPerformed')}
              placeholder="Descreva os procedimentos realizados durante o atendimento..."
              readOnly={isReadOnly}
              rows={4}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ClinicalSectionField
              label="Plano de tratamento"
              value={field('treatmentPlan')}
              onChange={setField('treatmentPlan')}
              placeholder="Descreva o plano de tratamento proposto..."
              readOnly={isReadOnly}
              rows={4}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ClinicalSectionField
              label="Prescrição / Medicamentos"
              value={field('prescription')}
              onChange={setField('prescription')}
              placeholder="Medicamentos prescritos, posologia, orientações de uso..."
              readOnly={isReadOnly}
              rows={4}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ClinicalSectionField
              label="Recomendações ao paciente"
              value={field('recommendations')}
              onChange={setField('recommendations')}
              placeholder="Orientações de cuidados pós-atendimento, restrições, retorno..."
              readOnly={isReadOnly}
              rows={4}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <OdontogramSection
              data={odontogramData}
              onChange={handleOdontogramChange}
              readOnly={isReadOnly}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ImageAttachmentPanel
              recordId={recordId}
              readOnly={isReadOnly}
            />
          </div>

          {!isReadOnly && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <ClinicalSectionField
                label="Notas privadas (não imprimíveis)"
                value={field('privateNotes')}
                onChange={setField('privateNotes')}
                placeholder="Anotações internas, observações do profissional..."
                rows={3}
              />
            </div>
          )}
        </div>
      ) : (
        /* ── Desktop: tabs + sidebar ── */
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
          {/* Main editor */}
          <div className="space-y-4 xl:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <ClinicalSectionField
                label="Queixa principal"
                value={field('chiefComplaint')}
                onChange={setField('chiefComplaint')}
                placeholder="Descreva a queixa principal do paciente..."
                readOnly={isReadOnly}
                rows={2}
              />
            </div>

            {/* Tab navigation */}
            <div className="overflow-x-auto rounded-t-xl border border-slate-200 bg-white">
              <nav role="tablist" aria-label="Seções do prontuário" className="flex min-w-max border-b border-slate-200">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                className="p-5"
              >
                {activeTab === 'anamnese' && (
                  <ClinicalSectionField
                    label="Anamnese"
                    value={field('anamnesis')}
                    onChange={setField('anamnesis')}
                    placeholder="Histórico médico, alergias, medicamentos em uso, antecedentes familiares..."
                    readOnly={isReadOnly}
                    rows={8}
                  />
                )}
                {activeTab === 'evolucao' && (
                  <ClinicalSectionField
                    label="Evolução clínica"
                    value={field('clinicalEvolution')}
                    onChange={setField('clinicalEvolution')}
                    placeholder="Descreva a evolução clínica do atendimento..."
                    readOnly={isReadOnly}
                    rows={8}
                  />
                )}
                {activeTab === 'diagnostico' && (
                  <ClinicalSectionField
                    label="Diagnóstico / Hipótese diagnóstica"
                    value={field('diagnosis')}
                    onChange={setField('diagnosis')}
                    placeholder="CID, hipótese diagnóstica ou diagnóstico diferencial..."
                    readOnly={isReadOnly}
                    rows={6}
                  />
                )}
                {activeTab === 'procedimentos' && (
                  <ClinicalSectionField
                    label="Procedimentos realizados"
                    value={field('proceduresPerformed')}
                    onChange={setField('proceduresPerformed')}
                    placeholder="Descreva os procedimentos realizados durante o atendimento..."
                    readOnly={isReadOnly}
                    rows={6}
                  />
                )}
                {activeTab === 'plano' && (
                  <ClinicalSectionField
                    label="Plano de tratamento"
                    value={field('treatmentPlan')}
                    onChange={setField('treatmentPlan')}
                    placeholder="Descreva o plano de tratamento proposto..."
                    readOnly={isReadOnly}
                    rows={6}
                  />
                )}
                {activeTab === 'prescricao' && (
                  <ClinicalSectionField
                    label="Prescrição / Medicamentos"
                    value={field('prescription')}
                    onChange={setField('prescription')}
                    placeholder="Medicamentos prescritos, posologia, orientações de uso..."
                    readOnly={isReadOnly}
                    rows={6}
                  />
                )}
                {activeTab === 'recomendacoes' && (
                  <ClinicalSectionField
                    label="Recomendações ao paciente"
                    value={field('recommendations')}
                    onChange={setField('recommendations')}
                    placeholder="Orientações de cuidados pós-atendimento, restrições, retorno..."
                    readOnly={isReadOnly}
                    rows={6}
                  />
                )}
                {activeTab === 'odontograma' && (
                  <OdontogramSection
                    data={odontogramData}
                    onChange={handleOdontogramChange}
                    readOnly={isReadOnly}
                  />
                )}
                {activeTab === 'imagens' && (
                  <ImageAttachmentPanel
                    recordId={recordId}
                    readOnly={isReadOnly}
                  />
                )}
              </div>
            </div>

            {/* Private notes */}
            {!isReadOnly && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
                <ClinicalSectionField
                  label="Notas privadas (não imprimíveis)"
                  value={field('privateNotes')}
                  onChange={setField('privateNotes')}
                  placeholder="Anotações internas, observações do profissional..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <ClinicalTemplateSelectorPanel
              templates={templates}
              onApply={handleApplyTemplate}
            />
            <ClinicalAiAssistantCard />
          </div>
        </div>
      )}
    </div>
  )
}
