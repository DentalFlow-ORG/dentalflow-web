import { useState } from 'react'
import { CheckCircle, Lock, Printer, RotateCcw, XCircle } from 'lucide-react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'

import type { ClinicalRecord } from '../types/clinical-record.types'
import { isClinicalRecordEditable } from '../utils/clinical-record-status-rules'

type Props = {
  record: ClinicalRecord
  isSaving: boolean
  onSaveDraft: () => void
  onComplete: () => void
  onLock: () => void
  onCancel: () => void
  onRestore: () => void
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
  const [confirmRestore, setConfirmRestore] = useState(false)

  const isLocked = record.status === 'LOCKED'
  const isCanceled = record.status === 'CANCELED'
  const isCompleted = record.status === 'COMPLETED'
  const isDraft = isClinicalRecordEditable(record.status)

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="w-full sm:w-auto"
        >
          <Printer className="h-4 w-4" />
          Imprimir prontuário
        </Button>

        {isCanceled && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirmRestore(true)}
            disabled={isSaving}
            className="w-full text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar prontuário
          </Button>
        )}

        {isDraft && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Salvando...' : 'Salvar rascunho'}
          </Button>
        )}

        {isDraft && (
          <Button
            size="sm"
            onClick={onComplete}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            <CheckCircle className="h-4 w-4" />
            Concluir atendimento
          </Button>
        )}

        {isCompleted && (
          <Button
            size="sm"
            onClick={onLock}
            disabled={isSaving}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Lock className="h-4 w-4" />
            Bloquear prontuário
          </Button>
        )}

        {(isDraft || isCompleted) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmCancel(true)}
            disabled={isSaving}
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
          >
            <XCircle className="h-4 w-4" />
            Cancelar prontuário
          </Button>
        )}

        {isLocked && (
          <span className="text-sm text-muted-foreground">
            Este prontuário está bloqueado para edição.
          </span>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar prontuário"
        description="Esta ação irá cancelar o prontuário. O prontuário poderá ser restaurado posteriormente, mas não poderá ser editado enquanto estiver cancelado."
        subject={record.patientName}
        confirmLabel="Cancelar prontuário"
        cancelLabel="Manter prontuário"
        tone="destructive"
        isConfirming={isSaving}
        onConfirm={() => {
          setConfirmCancel(false)
          onCancel()
        }}
        onCancel={() => setConfirmCancel(false)}
      />

      <ConfirmDialog
        open={confirmRestore}
        title="Restaurar prontuário"
        description="O prontuário será reativado para o estado anterior ao cancelamento. Deseja continuar?"
        subject={record.patientName}
        confirmLabel="Restaurar prontuário"
        cancelLabel="Fechar"
        tone="warning"
        isConfirming={isSaving}
        onConfirm={() => {
          setConfirmRestore(false)
          onRestore()
        }}
        onCancel={() => setConfirmRestore(false)}
      />
    </>
  )
}
