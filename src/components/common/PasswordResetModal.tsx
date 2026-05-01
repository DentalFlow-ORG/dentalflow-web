import { KeyRound, Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

import { FormField } from './FormField'
import { InlineFeedback } from './InlineFeedback'
import { PasswordInput } from './PasswordInput'

type PasswordResetModalProps = {
  open: boolean
  title?: string
  subjectName: string
  formId: string
  newPasswordId: string
  confirmPasswordId: string
  onClose: () => void
  onSubmit: (password: string) => Promise<void>
  onSuccess: () => void
}

type FormState = {
  password: string
  confirm: string
}

const EMPTY_FORM: FormState = { password: '', confirm: '' }
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 72

export function PasswordResetModal({
  open,
  title = 'Redefinir senha',
  subjectName,
  formId,
  newPasswordId,
  confirmPasswordId,
  onClose,
  onSubmit,
  onSuccess,
}: PasswordResetModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    setForm(EMPTY_FORM)
    setError(null)
  }, [open])

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (form.password.length < PASSWORD_MIN_LENGTH) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (form.password.length > PASSWORD_MAX_LENGTH) {
      setError('A senha deve ter no maximo 72 caracteres.')
      return
    }
    if (form.password !== form.confirm) {
      setError('As senhas nao coincidem.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(form.password)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar senha.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby={`${formId}-title`}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <Dialog.Title
                  id={`${formId}-title`}
                  className="text-base font-semibold text-slate-950"
                >
                  {title}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500">
                  {subjectName}
                </Dialog.Description>
              </div>
            </div>
          </div>

          <form id={formId} onSubmit={handleSubmit}>
            <div className="space-y-4 px-6 py-5">
              {error && <InlineFeedback>{error}</InlineFeedback>}

              <FormField
                label="Nova senha"
                htmlFor={newPasswordId}
                hint="Minimo 8 caracteres, maximo 72."
              >
                <PasswordInput
                  id={newPasswordId}
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={PASSWORD_MAX_LENGTH}
                  value={form.password}
                  placeholder="Digite a nova senha"
                  autoComplete="new-password"
                  onChange={(event) => set('password', event.target.value)}
                />
              </FormField>

              <FormField label="Confirmar senha" htmlFor={confirmPasswordId}>
                <PasswordInput
                  id={confirmPasswordId}
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={PASSWORD_MAX_LENGTH}
                  value={form.confirm}
                  placeholder="Confirme a nova senha"
                  autoComplete="new-password"
                  onChange={(event) => set('confirm', event.target.value)}
                />
              </FormField>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" form={formId} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Salvando...' : title}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
