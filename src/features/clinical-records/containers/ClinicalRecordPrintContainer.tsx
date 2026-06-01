import { useEffect, useState } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'
import { BRAZIL_TZ } from '@/lib/brazil-timezone'
import { formatPhoneBR } from '@/lib/field-formatters'

import { OdontogramChart } from '../components/odontogram/OdontogramChart'
import { OdontogramLegend } from '../components/odontogram/OdontogramLegend'
import { getClinicalRecordPrintData, getOdontogram } from '../services/clinical-records.service'
import type { OdontogramData, PrintData } from '../types/clinical-record.types'
import { CLINICAL_RECORD_STATUS_LABEL } from '../utils/clinical-record-labels'

/*
 * In @media print, CSS variables are reset to light-mode values so that
 * dark:* Tailwind classes (which use var(--*)) render correctly on white paper,
 * regardless of the active theme. No need to add print:! overrides per element.
 */
const PRINT_STYLE = `
  @media print {
    .prontuario-folha {
      --foreground: #0f172a;
      --card-foreground: #0f172a;
      --muted-foreground: #475569;
      --card: #ffffff;
      --background: #ffffff;
      --border: #e2e8f0;
      background: #ffffff !important;
    }
  }
`

type Props = {
  recordId: string
}

export function ClinicalRecordPrintContainer({ recordId }: Props) {
  const [data, setData] = useState<PrintData | null>(null)
  const [odontogramData, setOdontogramData] = useState<OdontogramData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadPrintData() {
      try {
        const printData = await getClinicalRecordPrintData(recordId)
        if (!isCurrent) return

        setData(printData)

        const identifier = printData.record.patientEmail ?? printData.record.patientName
        const odontogram = await getOdontogram(identifier).catch(() => null)
        if (isCurrent && odontogram) setOdontogramData(odontogram.data)
      } catch {
        if (isCurrent) setError('Não foi possível carregar os dados para impressão.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadPrintData()

    return () => { isCurrent = false }
  }, [recordId])

  if (isLoading) return <LoadingCard message="Preparando prontuário para impressão..." />
  if (error) return <InlineFeedback tone="error">{error}</InlineFeedback>
  if (!data) return null

  const { clinic, record } = data

  return (
    <div>
      {/* Resets CSS variables to light-mode values in print so dark:* classes render correctly */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLE }} />

      <div className="mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link
            to="/app/prontuario/$clinicalRecordId"
            params={{ clinicalRecordId: recordId }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar ao prontuário
          </Link>
        </Button>
        <Button
          onClick={() => {
            const prev = document.title
            document.title = `Prontuário — ${data.record.patientName}`
            window.print()
            document.title = prev
          }}
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* "prontuario-folha" class is targeted by PRINT_STYLE above */}
      <div className="prontuario-folha mx-auto max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-border dark:bg-card print:max-w-none print:rounded-none print:border-none print:p-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-5 dark:border-border">
          <h1 className="text-xl font-bold text-slate-900 dark:text-foreground">
            {clinic?.name ?? 'Clínica'}
          </h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-muted-foreground">
            {clinic?.phone && <span>{formatPhoneBR(clinic.phone)}</span>}
            {clinic?.email && <span>{clinic.email}</span>}
            {clinic?.city && <span>{clinic.city}{clinic.state ? ` / ${clinic.state}` : ''}</span>}
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
              Paciente
            </p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-foreground">
              {record.patientName}
            </p>
            {record.patientEmail && (
              <p className="text-slate-600 dark:text-muted-foreground">{record.patientEmail}</p>
            )}
            {record.patientPhone && (
              <p className="text-slate-600 dark:text-muted-foreground">
                {formatPhoneBR(record.patientPhone)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
              Profissional
            </p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-foreground">
              {record.profile.displayName}
            </p>
            {record.appointment && (
              <p className="text-slate-600 dark:text-muted-foreground">
                {formatDateBR(record.appointment.appointmentDate)}
              </p>
            )}
            <p className="mt-1 text-slate-500 dark:text-muted-foreground">
              Status: {CLINICAL_RECORD_STATUS_LABEL[record.status]}
            </p>
          </div>
        </section>

        {record.chiefComplaint && (
          <PrintSection title="Queixa principal" content={record.chiefComplaint} />
        )}
        {record.anamnesis && (
          <PrintSection title="Anamnese" content={record.anamnesis} />
        )}
        {record.clinicalEvolution && (
          <PrintSection title="Evolução clínica" content={record.clinicalEvolution} />
        )}
        {record.diagnosis && (
          <PrintSection title="Diagnóstico" content={record.diagnosis} />
        )}
        {record.proceduresPerformed && (
          <PrintSection title="Procedimentos realizados" content={record.proceduresPerformed} />
        )}
        {record.treatmentPlan && (
          <PrintSection title="Plano de tratamento" content={record.treatmentPlan} />
        )}
        {record.prescription && (
          <PrintSection title="Prescrição / Medicamentos" content={record.prescription} />
        )}
        {record.recommendations && (
          <PrintSection title="Recomendações ao paciente" content={record.recommendations} />
        )}

        {odontogramData && (
          <PrintOdontogramSection data={odontogramData} />
        )}

        {record.attachments && record.attachments.length > 0 && (
          <PrintAttachmentsSection attachments={record.attachments} />
        )}

        <section className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <div className="border-t border-slate-400 pt-2 dark:border-border">
              <p className="text-sm text-slate-600 dark:text-muted-foreground">
                {record.profile.displayName}
              </p>
              <p className="text-xs text-slate-400 dark:text-muted-foreground/70">
                Assinatura do profissional
              </p>
            </div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2 dark:border-border">
              <p className="text-sm text-slate-600 dark:text-muted-foreground">
                {record.patientName}
              </p>
              <p className="text-xs text-slate-400 dark:text-muted-foreground/70">
                Assinatura do paciente
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400 dark:border-border dark:text-muted-foreground/70">
          Documento gerado pelo DentalFlow em {new Intl.DateTimeFormat('pt-BR', {
            timeZone: BRAZIL_TZ,
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }).format(new Date())}. Este documento é de uso interno e caráter informativo.
        </footer>
      </div>
    </div>
  )
}

function PrintOdontogramSection({ data }: { data: OdontogramData }) {
  const hasData = Object.keys(data.teeth ?? {}).length > 0 || Boolean(data.notes)
  if (!hasData) return null

  const getTooth = (toothNumber: number) => data.teeth?.[String(toothNumber)] ?? {}

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
        Odontograma
      </p>
      <div className="mt-3 space-y-3">
        <OdontogramChart getTooth={getTooth} selected={null} readOnly printMode />
        <OdontogramLegend printMode />
        {data.notes && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-foreground">
            {data.notes}
          </p>
        )}
      </div>
    </section>
  )
}

function PrintAttachmentsSection({ attachments }: { attachments: PrintData['record']['attachments'] }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
        Imagens clínicas
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {attachments.map((attachment) => {
          const src = attachment.dataBase64
            ? `data:${attachment.mimeType ?? 'image/jpeg'};base64,${attachment.dataBase64}`
            : null

          return (
            <div key={attachment.id} className="overflow-hidden rounded-lg border border-slate-200 dark:border-border">
              {src ? (
                <img
                  src={src}
                  alt={attachment.fileName}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-[10px] text-slate-400 dark:bg-muted dark:text-muted-foreground">
                  {attachment.fileName}
                </div>
              )}
              {attachment.description && (
                <p className="px-1.5 py-1 text-[10px] text-slate-600 dark:text-muted-foreground">
                  {attachment.description}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function PrintSection({ title, content }: { title: string; content: string }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-foreground">
        {content}
      </p>
    </section>
  )
}
