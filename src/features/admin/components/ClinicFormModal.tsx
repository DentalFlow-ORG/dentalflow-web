import { Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  createAdminClinic,
  updateAdminClinic,
} from '../services/admin-clinics.service'
import type { AdminClinic } from '../types/admin.types'

type ClinicFormModalProps = {
  open: boolean
  initialData?: AdminClinic
  onClose: () => void
  onSuccess: (clinic: AdminClinic) => void
}

type FormState = {
  name: string
  isActive: string
}

const EMPTY_FORM: FormState = {
  name: '',
  isActive: 'true',
}

function buildInitialForm(clinic: AdminClinic): FormState {
  return {
    name: clinic.name,
    isActive: clinic.isActive === false ? 'false' : 'true',
  }
}

export function ClinicFormModal({
  open,
  initialData,
  onClose,
  onSuccess,
}: ClinicFormModalProps) {
  const isEditMode = Boolean(initialData)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(initialData ? buildInitialForm(initialData) : EMPTY_FORM)
    setError(null)
  }, [initialData, open])

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const name = form.name.trim()
    if (name.length < 2) {
      setError('Informe um nome de clínica com pelo menos 2 caracteres.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = isEditMode
        ? await updateAdminClinic(initialData!.id, {
            name,
            ...(initialData!.isActive !== undefined
              ? { isActive: form.isActive === 'true' }
              : {}),
          })
        : await createAdminClinic({ name })

      onSuccess(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar clínica.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="clinic-form-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="border-b border-border px-6 py-5">
            <Dialog.Title
              id="clinic-form-title"
              className="text-base font-semibold text-foreground"
            >
              {isEditMode ? 'Editar clínica' : 'Nova clínica'}
            </Dialog.Title>
            <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
              {isEditMode
                ? `Alterando dados de ${initialData!.name}`
                : 'Cadastre uma nova clínica para vincular usuários e operações.'}
            </Dialog.Description>
          </div>

          <form id="clinic-form" onSubmit={handleSubmit}>
            <div className="space-y-4 px-6 py-5">
              {error && <InlineFeedback>{error}</InlineFeedback>}

              <FormField label="Nome da clínica" htmlFor="clinicName">
                <TextInput
                  id="clinicName"
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) => set('name', event.target.value)}
                  placeholder="Ex: Clínica DentalFlow"
                />
              </FormField>

              {isEditMode && initialData?.isActive !== undefined && (
                <FormField label="Status" htmlFor="clinicIsActive">
                  <Select
                    value={form.isActive}
                    onValueChange={(value) => set('isActive', value)}
                  >
                    <SelectTrigger id="clinicIsActive">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativa</SelectItem>
                      <SelectItem value="false">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" form="clinic-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting
                  ? 'Salvando...'
                  : isEditMode
                    ? 'Salvar alterações'
                    : 'Criar clínica'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
