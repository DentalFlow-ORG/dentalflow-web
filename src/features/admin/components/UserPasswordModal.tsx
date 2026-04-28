import { KeyRound, Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState, useEffect } from 'react'

import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'

import { updateAdminUserPassword } from '../services/admin-users.service'

type Props = {
  open: boolean
  userId: string
  userName: string
  onClose: () => void
  onSuccess: () => void
}

type FormState = {
  password: string
  confirm: string
}

const EMPTY_FORM: FormState = { password: '', confirm: '' }

export function UserPasswordModal({
  open,
  userId,
  userName,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM)
      setError(null)
    }
  }, [open])

  function set<K extends keyof FormState>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (form.password.length > 72) {
      setError('A senha deve ter no máximo 72 caracteres.')
      return
    }
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setIsSubmitting(true)
    try {
      await updateAdminUserPassword(userId, { password: form.password })
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
          aria-labelledby="password-dialog-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          {/* Header */}
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <Dialog.Title
                  id="password-dialog-title"
                  className="text-base font-semibold text-slate-950"
                >
                  Redefinir senha
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500">
                  {userName}
                </Dialog.Description>
              </div>
            </div>
          </div>

          {/* Body */}
          <form id="password-form" onSubmit={handleSubmit}>
            <div className="space-y-4 px-6 py-5">
              {error && <InlineFeedback>{error}</InlineFeedback>}

              <FormField
                label="Nova senha"
                htmlFor="new-password"
                hint="Mínimo 8 caracteres, máximo 72."
              >
                <TextInput
                  id="new-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                />
              </FormField>

              <FormField label="Confirmar senha" htmlFor="confirm-password">
                <TextInput
                  id="confirm-password"
                  type="password"
                  value={form.confirm}
                  onChange={(e) => set('confirm', e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                />
              </FormField>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="password-form"
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
