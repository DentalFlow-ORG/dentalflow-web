import { AlertCircle, CheckCircle2, MessageCircle, Send, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { submitPublicLead } from '@/services/public-leads.service'

type ChatStep = 'options' | 'form' | 'success'

type QuickOption = {
  id: string
  label: string
  context: string
}

const QUICK_OPTIONS: QuickOption[] = [
  { id: 'trial', label: 'Quero testar grátis', context: 'Interesse em teste gratuito' },
  { id: 'specialist', label: 'Quero falar com especialista', context: 'Demonstração com especialista' },
  { id: 'opening', label: 'Estou abrindo uma clínica', context: 'Clínica em abertura' },
  { id: 'migrate', label: 'Uso outro software', context: 'Interesse em migração' },
  { id: 'plans', label: 'Quero saber os planos', context: 'Informações sobre planos' },
  { id: 'whatsapp', label: 'Quero WhatsApp e lembretes', context: 'Notificações e WhatsApp' },
]

const TIME_OPTIONS = ['Manhã (8h–12h)', 'Tarde (12h–17h)', 'Noite (17h–20h)', 'Qualquer horário']

type FormData = {
  name: string
  whatsapp: string
  clinic: string
  time: string
  context: string
}

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function isValidWhatsApp(value: string): boolean {
  return value.replace(/\D/g, '').length === 11
}

export function LeadChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<ChatStep>('options')
  const [selectedOption, setSelectedOption] = useState<QuickOption | null>(null)
  const [form, setForm] = useState<Omit<FormData, 'context'>>({
    name: '',
    whatsapp: '',
    clinic: '',
    time: '',
  })
  const [lgpdConsent, setLgpdConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleOpen = () => {
    setIsOpen(true)
    setStep('options')
    setSelectedOption(null)
    setForm({ name: '', whatsapp: '', clinic: '', time: '' })
    setLgpdConsent(false)
    setErrors({})
    setLoading(false)
    setSubmitError(null)
  }

  const handleSelectOption = (option: QuickOption) => {
    setSelectedOption(option)
    setStep('form')
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Informe seu nome.'
    if (!form.whatsapp.trim()) {
      next.whatsapp = 'Informe seu WhatsApp.'
    } else if (!isValidWhatsApp(form.whatsapp)) {
      next.whatsapp = 'Número inválido. Ex: (11) 99999-9999'
    }
    if (!lgpdConsent) next.lgpd = 'Você precisa aceitar para continuar.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setSubmitError(null)
    try {
      await submitPublicLead({
        name: form.name.trim(),
        phone: form.whatsapp,
        clinicName: form.clinic.trim() || undefined,
        preferredTime: form.time || undefined,
        context: selectedOption?.context ?? 'Contato pelo chat',
        acceptedPrivacyPolicy: lgpdConsent,
      })
      setStep('success')
    } catch {
      setSubmitError('Não foi possível enviar. Tente novamente ou entre em contato pelo WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        aria-label={isOpen ? 'Fechar chat de contato' : 'Abrir chat de contato'}
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl shadow-primary/30 transition-all duration-200',
          isOpen ? 'bg-slate-700 hover:bg-slate-800' : 'bg-primary hover:bg-primary/90',
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
        {!isOpen && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat de contato DentalFlow"
          className="fixed bottom-24 right-5 z-50 flex w-[22rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 max-sm:inset-x-3 max-sm:right-3 max-sm:w-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
              <MessageCircle className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">DentalFlow</p>
              <p className="text-xs text-blue-200">Resposta rápida</p>
            </div>
            <button
              type="button"
              aria-label="Fechar chat"
              onClick={() => setIsOpen(false)}
              className="ml-auto rounded p-1 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '28rem' }}>
            {step === 'options' && (
              <div className="flex flex-col gap-3">
                <div className="rounded-xl bg-slate-100 px-3.5 py-3 text-sm text-slate-700">
                  Olá! Posso te ajudar a entender se o DentalFlow faz sentido para sua clínica?
                </div>
                <p className="text-xs font-medium text-slate-400">Selecione uma opção:</p>
                <div className="flex flex-col gap-2">
                  {QUICK_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'form' && (
              <div className="flex flex-col gap-3">
                <div className="rounded-xl bg-slate-100 px-3.5 py-3 text-sm text-slate-700">
                  Ótimo! Para conectar você com o nosso time, precisamos de algumas informações:
                </div>

                <div className="flex flex-col gap-3">
                  {/* Nome */}
                  <div>
                    <label
                      htmlFor="chat-name"
                      className="mb-1 block text-xs font-medium text-slate-600"
                    >
                      Seu nome *
                    </label>
                    <input
                      id="chat-name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Como podemos te chamar?"
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20',
                        errors.name ? 'border-red-400' : 'border-slate-200',
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label
                      htmlFor="chat-whatsapp"
                      className="mb-1 block text-xs font-medium text-slate-600"
                    >
                      WhatsApp *
                    </label>
                    <input
                      id="chat-whatsapp"
                      type="tel"
                      autoComplete="tel"
                      value={form.whatsapp}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, whatsapp: formatWhatsApp(e.target.value) }))
                      }
                      placeholder="(11) 99999-9999"
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20',
                        errors.whatsapp ? 'border-red-400' : 'border-slate-200',
                      )}
                    />
                    {errors.whatsapp && (
                      <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>
                    )}
                  </div>

                  {/* Clinic */}
                  <div>
                    <label
                      htmlFor="chat-clinic"
                      className="mb-1 block text-xs font-medium text-slate-600"
                    >
                      Nome da clínica
                    </label>
                    <input
                      id="chat-clinic"
                      type="text"
                      value={form.clinic}
                      onChange={(e) => setForm((f) => ({ ...f, clinic: e.target.value }))}
                      placeholder="Como se chama sua clínica?"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  {/* Time preference */}
                  <div>
                    <label
                      htmlFor="chat-time"
                      className="mb-1 block text-xs font-medium text-slate-600"
                    >
                      Melhor horário para contato
                    </label>
                    <select
                      id="chat-time"
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="">Selecione...</option>
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* LGPD consent */}
                  <div className="rounded-lg bg-slate-50 p-3">
                    <label className="flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={lgpdConsent}
                        onChange={(e) => setLgpdConsent(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-primary"
                        aria-describedby="lgpd-description"
                      />
                      <span id="lgpd-description" className="text-xs leading-5 text-slate-600">
                        Aceito ser contatado pelo DentalFlow sobre o produto e concordo com a{' '}
                        <a
                          href="/politica-de-privacidade"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Política de Privacidade
                        </a>
                        .
                      </span>
                    </label>
                    {errors.lgpd && (
                      <p className="mt-1.5 text-xs text-red-500">{errors.lgpd}</p>
                    )}
                  </div>

                  {submitError && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden="true" />
                      <p className="text-xs leading-5 text-red-600">{submitError}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full"
                    size="sm"
                  >
                    {loading ? (
                      'Enviando...'
                    ) : (
                      <>
                        Enviar
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep('options')}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    ← Voltar
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Recebemos seu contato!</p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Em breve um especialista falará com você.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
