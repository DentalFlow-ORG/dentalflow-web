import { useEffect, useState } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'
import { formatPhoneBR } from '@/lib/field-formatters'

import { OdontogramChart } from '../components/odontogram/OdontogramChart'
import { OdontogramLegend } from '../components/odontogram/OdontogramLegend'
import { getClinicalRecordPrintData, getOdontogram } from '../services/clinical-records.service'
import type { OdontogramData, PrintData } from '../types/clinical-record.types'
import { CLINICAL_RECORD_STATUS_LABEL } from '../utils/clinical-record-labels'

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
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          to="/app/prontuario/$clinicalRecordId"
          params={{ clinicalRecordId: recordId }}
        >
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao prontuário
          </Button>
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-none print:p-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-5">
          <h1 className="text-xl font-bold text-slate-900">{clinic?.name ?? 'Clínica'}</h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {clinic?.phone && <span>{formatPhoneBR(clinic.phone)}</span>}
            {clinic?.email && <span>{clinic.email}</span>}
            {clinic?.city && <span>{clinic.city}{clinic.state ? ` / ${clinic.state}` : ''}</span>}
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Paciente
            </p>
            <p className="mt-1 font-semibold text-slate-900">{record.patientName}</p>
            {record.patientEmail && <p className="text-slate-600">{record.patientEmail}</p>}
            {record.patientPhone && <p className="text-slate-600">{formatPhoneBR(record.patientPhone)}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Profissional
            </p>
            <p className="mt-1 font-semibold text-slate-900">{record.profile.displayName}</p>
            {record.appointment && (
              <p className="text-slate-600">
                {formatDateBR(record.appointment.appointmentDate)}
              </p>
            )}
            <p className="mt-1 text-slate-500">
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
            <div className="border-t border-slate-400 pt-2">
              <p className="text-sm text-slate-600">{record.profile.displayName}</p>
              <p className="text-xs text-slate-400">Assinatura do profissional</p>
            </div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2">
              <p className="text-sm text-slate-600">{record.patientName}</p>
              <p className="text-xs text-slate-400">Assinatura do paciente</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          Documento gerado pelo DentalFlow em {new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}. Este documento é de uso interno e caráter informativo.
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
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Odontograma
      </p>
      <div className="mt-3 space-y-3">
        <OdontogramChart getTooth={getTooth} selected={null} readOnly printMode />
        <OdontogramLegend printMode />
        {data.notes && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
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
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Imagens clínicas
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {attachments.map((attachment) => {
          const src = attachment.dataBase64
            ? `data:${attachment.mimeType ?? 'image/jpeg'};base64,${attachment.dataBase64}`
            : null

          return (
            <div key={attachment.id} className="overflow-hidden rounded-lg border border-slate-200">
              {src ? (
                <img
                  src={src}
                  alt={attachment.fileName}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-[10px] text-slate-400">
                  {attachment.fileName}
                </div>
              )}
              {attachment.description && (
                <p className="px-1.5 py-1 text-[10px] text-slate-600">
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
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{content}</p>
    </section>
  )
}
