import { CalendarOff, Plus } from 'lucide-react'
import { useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'

import {
  createAvailabilityException,
  deleteAvailabilityException,
  updateAvailabilityException,
} from '../../services/scheduling.service'
import type {
  AvailabilityException,
  CreateAvailabilityExceptionDto,
  UpdateAvailabilityExceptionDto,
} from '../../types/scheduling.types'
import { ExceptionForm } from './ExceptionForm'
import { ExceptionRow } from './ExceptionRow'

type ExceptionManagerProps = {
  profileId: string
  exceptions: AvailabilityException[]
  onExceptionsChange: (exceptions: AvailabilityException[]) => void
  title?: string
  hideTitle?: boolean
}

export function ExceptionManager({
  profileId,
  exceptions,
  onExceptionsChange,
  title = 'Exceções de agenda',
  hideTitle = false,
}: ExceptionManagerProps) {
  const { showAlert } = useGlobalAlerts()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(dto: CreateAvailabilityExceptionDto) {
    setLoadingId('new')
    setError(null)
    try {
      const exc = await createAvailabilityException(profileId, dto)
      onExceptionsChange([...exceptions, exc])
      setIsAdding(false)
      showAlert({ title: 'Exceção adicionada', tone: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar.'
      setError(msg)
      showAlert({ title: 'Erro ao salvar exceção', description: msg, tone: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  async function handleUpdate(exc: AvailabilityException, dto: CreateAvailabilityExceptionDto) {
    const updateDto: UpdateAvailabilityExceptionDto = {
      isDayOff: dto.isDayOff,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    }
    setLoadingId(exc.id)
    setError(null)
    try {
      const updated = await updateAvailabilityException(profileId, exc.id, updateDto)
      onExceptionsChange(exceptions.map((e) => (e.id === exc.id ? updated : e)))
      setEditingId(null)
      showAlert({ title: 'Exceção atualizada', tone: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar.'
      setError(msg)
      showAlert({ title: 'Erro ao atualizar exceção', description: msg, tone: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(exc: AvailabilityException) {
    setLoadingId(exc.id)
    setError(null)
    try {
      await deleteAvailabilityException(profileId, exc.id)
      onExceptionsChange(exceptions.filter((e) => e.id !== exc.id))
      showAlert({ title: 'Exceção removida', tone: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao remover.'
      setError(msg)
      showAlert({ title: 'Erro ao remover exceção', description: msg, tone: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  const sortedExceptions = [...exceptions].sort((a, b) =>
    a.exceptionDate.localeCompare(b.exceptionDate),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!hideTitle && (
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Registre folgas ou horários especiais em datas específicas.
            </p>
          </div>
        )}
        {!isAdding && (
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setIsAdding(true)}
            disabled={loadingId !== null}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Adicionar
          </Button>
        )}
      </div>

      {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

      {isAdding && (
        <ExceptionForm
          isLoading={loadingId === 'new'}
          onSubmit={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {sortedExceptions.length === 0 && !isAdding ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-10 text-center">
          <CalendarOff className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Nenhuma exceção cadastrada. Adicione folgas e horários especiais.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedExceptions.map((exc) => (
            <ExceptionRow
              key={exc.id}
              exception={exc}
              isEditing={editingId === exc.id}
              isLoading={loadingId === exc.id}
              onEditStart={() => setEditingId(exc.id)}
              onEditCancel={() => setEditingId(null)}
              onEdit={(dto) => handleUpdate(exc, dto)}
              onDelete={() => handleDelete(exc)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
