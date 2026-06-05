import { CalendarOff, Plus } from 'lucide-react'
import { useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { cn } from '@/lib/utils'

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
import { ExceptionEditModal } from './ExceptionEditModal'
import { ExceptionForm } from './ExceptionForm'
import { ExceptionRow } from './ExceptionRow'

type ExceptionFilter = 'upcoming' | 'past' | 'all'

const FILTERS: Array<{ value: ExceptionFilter; label: string }> = [
  { value: 'upcoming', label: 'Próximas' },
  { value: 'past', label: 'Passadas' },
  { value: 'all', label: 'Todas' },
]

const FILTER_EMPTY_MESSAGES: Record<ExceptionFilter, string> = {
  upcoming: 'Nenhuma exceção futura cadastrada.',
  past: 'Nenhuma exceção passada no histórico.',
  all: 'Nenhuma exceção cadastrada.',
}

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
  const [editingException, setEditingException] = useState<AvailabilityException | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isModalSaving, setIsModalSaving] = useState(false)
  const [isModalDeleting, setIsModalDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ExceptionFilter>('upcoming')

  const today = brazilTodayIso()

  function classify(exc: AvailabilityException): ExceptionFilter {
    return exc.exceptionDate >= today ? 'upcoming' : 'past'
  }

  const filteredExceptions = exceptions
    .filter((exc) => filter === 'all' || classify(exc) === filter)
    .sort((a, b) => {
      const cmp = a.exceptionDate.localeCompare(b.exceptionDate)
      return filter === 'past' ? -cmp : cmp
    })

  async function handleAdd(dto: CreateAvailabilityExceptionDto) {
    setLoadingId('new')
    setError(null)
    try {
      const exc = await createAvailabilityException(profileId, dto)
      onExceptionsChange([...exceptions, exc])
      setIsAdding(false)
      showAlert({ title: 'Exceção adicionada', tone: 'success' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar exceção.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleModalSave(dto: CreateAvailabilityExceptionDto) {
    if (!editingException) return
    const updateDto: UpdateAvailabilityExceptionDto = {
      isDayOff: dto.isDayOff,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    }
    setIsModalSaving(true)
    try {
      const updated = await updateAvailabilityException(profileId, editingException.id, updateDto)
      onExceptionsChange(exceptions.map((e) => (e.id === editingException.id ? updated : e)))
      setEditingException(null)
      showAlert({ title: 'Exceção atualizada', tone: 'success' })
    } catch (err) {
      showAlert({
        title: err instanceof Error ? err.message : 'Erro ao atualizar exceção.',
        tone: 'error',
      })
    } finally {
      setIsModalSaving(false)
    }
  }

  async function handleModalDelete() {
    if (!editingException) return
    setIsModalDeleting(true)
    try {
      await deleteAvailabilityException(profileId, editingException.id)
      onExceptionsChange(exceptions.filter((e) => e.id !== editingException.id))
      setEditingException(null)
      showAlert({ title: 'Exceção removida', tone: 'success' })
    } catch (err) {
      showAlert({
        title: err instanceof Error ? err.message : 'Erro ao remover exceção.',
        tone: 'error',
      })
    } finally {
      setIsModalDeleting(false)
    }
  }

  async function handleRowDelete(exc: AvailabilityException) {
    setLoadingId(exc.id)
    setError(null)
    try {
      await deleteAvailabilityException(profileId, exc.id)
      onExceptionsChange(exceptions.filter((e) => e.id !== exc.id))
      showAlert({ title: 'Exceção removida', tone: 'success' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover exceção.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
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

        {/* Inline error (add flow only) */}
        {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

        {/* Add form */}
        {isAdding && (
          <ExceptionForm
            isLoading={loadingId === 'new'}
            onSubmit={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        )}

        {/* All-empty state */}
        {!isAdding && exceptions.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-10 text-center">
            <CalendarOff className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Nenhuma exceção cadastrada. Adicione folgas e horários especiais.
            </p>
          </div>
        )}

        {/* Filter tabs + filtered list */}
        {!isAdding && exceptions.length > 0 && (
          <div className="space-y-4">
            <div
              role="group"
              aria-label="Filtrar por período"
              className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  aria-pressed={filter === f.value}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    filter === f.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredExceptions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-10 text-center">
                <CalendarOff className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{FILTER_EMPTY_MESSAGES[filter]}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExceptions.map((exc) => (
                  <ExceptionRow
                    key={exc.id}
                    exception={exc}
                    isLoading={loadingId === exc.id}
                    isPast={exc.exceptionDate < today}
                    onEdit={() => setEditingException(exc)}
                    onDelete={() => handleRowDelete(exc)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ExceptionEditModal
        open={editingException !== null}
        exception={editingException}
        isSaving={isModalSaving}
        isDeleting={isModalDeleting}
        onClose={() => setEditingException(null)}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
      />
    </>
  )
}
