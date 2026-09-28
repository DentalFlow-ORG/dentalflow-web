import { CheckCircle, Lock, Printer, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'

import type { ClinicalRecord } from '../types/clinical-record.types'
import { isClinicalRecordEditable } from '../utils/clinical-record-status-rules'

type Props = {
  record: ClinicalRecord
  isSaving: boolean
  onSaveDraft: () => void
  onComplete: () => void
  // Status transitions resolve when the request settles; the confirmation
  // dialog stays open (showing its pending state) until then.
  onLock: () => Promise<void>
  onCancel: () => Promise<void>
  onRestore: () => Promise<void>
  onPrint: () => void
}

export function ClinicalRecordActions({
  record,
  isSaving,
  onSaveDraft,
  onComplete,
  onLock,
  onCancel,
  onRestore,
  onPrint,
}: Props) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmLock, setConfirmLock] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)

  const isCanceled = record.status === 'CANCELED'
  const isCompleted = record.status === 'COMPLETED'
  const isDraft = isClinicalRecordEditable(record.status)

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Print — always available */}
        <Button variant="outline" size="sm" onClick={onPrint} className="w-full sm:w-auto">
          <Printer className="h-4 w-4" />
          Imprimir prontuário
        </Button>

        {/* Restore — CANCELED only */}
        {isCanceled && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirmRestore(true)}
            disabled={isSaving}
            className="w-full text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300 sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar prontuário
          </Button>
        )}

        {/* Save draft — DRAFT only */}
        {isDraft && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Salvando...' : 'Salvar agora'}
          </Button>
        )}

        {/* Complete — DRAFT only */}
        {isDraft && (
          <Button size="sm" onClick={onComplete} disabled={isSaving} className="w-full sm:w-auto">
            <CheckCircle className="h-4 w-4" />
            Concluir atendimento
          </Button>
        )}

        {/* Lock — COMPLETED only.
            Triggers a confirmation dialog because LOCKED is permanent with no restore path. */}
        {isCompleted && (
          <Button
            size="sm"
            onClick={() => setConfirmLock(true)}
            disabled={isSaving}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Lock className="h-4 w-4" />
            Bloquear prontuário
          </Button>
        )}

        {/* Cancel — DRAFT or COMPLETED */}
        {(isDraft || isCompleted) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmCancel(true)}
            disabled={isSaving}
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300 sm:w-auto"
          >
            <XCircle className="h-4 w-4" />
            Cancelar prontuário
          </Button>
        )}
      </div>

      {/* ── Lock confirmation ────────────────────────────────────────────────── */}
      {/* Lock is the only status with no restore path — permanently blocks editing. */}
      <ConfirmDialog
        open={confirmLock}
        title="Bloquear prontuário"
        description="Após bloqueado, este prontuário não poderá ser editado ou reativado. Esta ação é permanente e não pode ser desfeita."
        subject={record.patientName}
        confirmLabel="Bloquear definitivamente"
        cancelLabel="Cancelar"
        tone="warning"
        isConfirming={isSaving}
        onConfirm={async () => {
          await onLock()
          setConfirmLock(false)
        }}
        onCancel={() => setConfirmLock(false)}
      />

      {/* ── Cancel confirmation ──────────────────────────────────────────────── */}
      {/* "Confirmar cancelamento" avoids the Portuguese collision between "cancelar"
          (to cancel this dialog) and canceling the medical record. */}
      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar prontuário"
        description="O prontuário será marcado como cancelado e ficará somente leitura. É possível restaurá-lo para rascunho posteriormente se necessário."
        subject={record.patientName}
        confirmLabel="Confirmar cancelamento"
        cancelLabel="Manter prontuário"
        tone="destructive"
        isConfirming={isSaving}
        onConfirm={async () => {
          await onCancel()
          setConfirmCancel(false)
        }}
        onCancel={() => setConfirmCancel(false)}
      />

      {/* ── Restore confirmation ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmRestore}
        title="Restaurar prontuário"
        description="O prontuário será restaurado como rascunho e poderá ser editado novamente. Deseja continuar?"
        subject={record.patientName}
        confirmLabel="Restaurar prontuário"
        cancelLabel="Fechar"
        tone="warning"
        isConfirming={isSaving}
        onConfirm={async () => {
          await onRestore()
          setConfirmRestore(false)
        }}
        onCancel={() => setConfirmRestore(false)}
      />
    </>
  )
}
