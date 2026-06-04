import { Clock, Plus } from 'lucide-react'
import { useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'

import {
  createAvailability,
  deleteAvailability,
  updateAvailability,
} from '../../services/scheduling.service'
import type { Availability, CreateAvailabilityDto } from '../../types/scheduling.types'
import { AvailabilitySlotForm } from './AvailabilitySlotForm'
import { AvailabilitySlotRow } from './AvailabilitySlotRow'

type AvailabilityManagerProps = {
  profileId: string
  slots: Availability[]
  onSlotsChange: (slots: Availability[]) => void
}

export function AvailabilityManager({
  profileId,
  slots,
  onSlotsChange,
}: AvailabilityManagerProps) {
  const { showAlert } = useGlobalAlerts()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(dto: CreateAvailabilityDto) {
    setLoadingId('new')
    setError(null)
    try {
      const slot = await createAvailability(profileId, dto)
      onSlotsChange([...slots, slot])
      setIsAdding(false)
      showAlert({ title: 'Disponibilidade adicionada', tone: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar.'
      setError(msg)
      showAlert({ title: 'Erro ao salvar disponibilidade', description: msg, tone: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  async function handleUpdate(slot: Availability, dto: CreateAvailabilityDto) {
    setLoadingId(slot.id)
    setError(null)
    try {
      const updated = await updateAvailability(profileId, slot.id, dto)
      onSlotsChange(slots.map((s) => (s.id === slot.id ? updated : s)))
      setEditingId(null)
      showAlert({ title: 'Disponibilidade atualizada', tone: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar.'
      setError(msg)
      showAlert({ title: 'Erro ao atualizar disponibilidade', description: msg, tone: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(slot: Availability) {
    setLoadingId(slot.id)
    setError(null)
    try {
      await deleteAvailability(profileId, slot.id)
      onSlotsChange(slots.filter((s) => s.id !== slot.id))
      showAlert({ title: 'Disponibilidade removida', tone: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao remover.'
      setError(msg)
      showAlert({ title: 'Erro ao remover disponibilidade', description: msg, tone: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  const sortedSlots = [...slots].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
    return a.startTime.localeCompare(b.startTime)
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">Horários de atendimento</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Configure os dias e horários em que você atende.
          </p>
        </div>
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
        <AvailabilitySlotForm
          isLoading={loadingId === 'new'}
          onSubmit={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {sortedSlots.length === 0 && !isAdding ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-10 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Nenhum horário cadastrado. Adicione sua disponibilidade semanal.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSlots.map((slot) => (
            <AvailabilitySlotRow
              key={slot.id}
              slot={slot}
              isEditing={editingId === slot.id}
              isLoading={loadingId === slot.id}
              onEditStart={() => setEditingId(slot.id)}
              onEditCancel={() => setEditingId(null)}
              onUpdate={(dto) => handleUpdate(slot, dto)}
              onDelete={() => handleDelete(slot)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
