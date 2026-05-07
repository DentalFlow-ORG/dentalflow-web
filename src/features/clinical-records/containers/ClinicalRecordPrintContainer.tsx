import { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LoadingCard } from '@/components/common/LoadingCard'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { formatDateBR } from '@/lib/date-time-formatters'
import { formatPhoneBR } from '@/lib/field-formatters'

import { getClinicalRecordPrintData } from '../services/clinical-records.service'
import { CLINICAL_RECORD_STATUS_LABEL } from '../utils/clinical-record-labels'
import type { PrintData } from '../types/clinical-record.types'

type Props = {
  recordId: string
}

export function ClinicalRecordPrintContainer({ recordId }: Props) {
  const [data, setData] = useState<PrintData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true
    getClinicalRecordPrintData(recordId)
      .then((d) => { if (isCurrent) setData(d) })
      .catch(() => { if (isCurrent) setError('Não foi possível carregar os dados para impressão.') })
      .finally(() => { if (isCurrent) setIsLoading(false) })
    return () => { isCurrent = false }
  }, [recordId])

  if (isLoading) return <LoadingCard message="Preparando prontuário para impressão..." />
  if (error) return <InlineFeedback tone="error">{error}</InlineFeedback>
  if (!data) return null

  const { clinic, record } = data

  return (
    <div>
      {/* Print controls — hidden when printing */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-slate-500">
          Prontuário pronto para impressão.
        </p>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Print area */}
      <div className="mx-auto max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-none print:shadow-none print:p-0">
        {/* Clinic header */}
        <header className="border-b border-slate-200 pb-5">
          <h1 className="text-xl font-bold text-slate-900">{clinic?.name ?? 'Clínica'}</h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {clinic?.phone && <span>{formatPhoneBR(clinic.phone)}</span>}
            {clinic?.email && <span>{clinic.email}</span>}
            {clinic?.city && <span>{clinic.city}{clinic.state ? ` / ${clinic.state}` : ''}</span>}
          </div>
        </header>

        {/* Patient & appointment info */}
        <section className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Paciente</p>
            <p className="mt-1 font-semibold text-slate-900">{record.patientName}</p>
            {record.patientEmail && <p className="text-slate-600">{record.patientEmail}</p>}
            {record.patientPhone && <p className="text-slate-600">{formatPhoneBR(record.patientPhone)}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Profissional</p>
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

        {/* Clinical sections */}
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

        {/* Attachments */}
        {record.attachments && record.attachments.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Imagens clínicas</p>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {record.attachments.map((a) => {
                const src = a.dataBase64
                  ? `data:${a.mimeType ?? 'image/jpeg'};base64,${a.dataBase64}`
                  : null
                return (
                  <div key={a.id} className="overflow-hidden rounded-lg border border-slate-200">
                    {src ? (
                      <img
                        src={src}
                        alt={a.fileName}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-[10px] text-slate-400">
                        {a.fileName}
                      </div>
                    )}
                    {a.description && (
                      <p className="px-1.5 py-1 text-[10px] text-slate-600">{a.description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Signature area */}
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

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          Documento gerado pelo DentalFlow em {new Date().toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}. Este documento é de uso interno e caráter informativo.
        </footer>
      </div>
    </div>
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
