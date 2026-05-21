import { AlertCircle, CheckCircle2, MessageCircle, Send, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { submitPublicLead } from '@/services/public-leads.service'

type ChatStep = 'goal' | 'process' | 'form' | 'success'

type QuickOption = {
  id: string
  label: string
  contextGoal: string
}

type ProcessOption = {
  id: string
  label: string
  contextProcess: string
}

const GOAL_OPTIONS: QuickOption[] = [
  { id: 'agenda', label: 'Quero organizar minha agenda', contextGoal: 'Organizar agenda' },
  { id: 'finance', label: 'Quero melhorar o financeiro', contextGoal: 'Melhorar controle financeiro' },
  { id: 'patients', label: 'Quero captar mais pacientes', contextGoal: 'Captação de pacientes' },
  { id: 'plans', label: 'Quero entender os planos', contextGoal: 'Informações sobre planos' },
  { id: 'specialist', label: 'Quero falar com um especialista', contextGoal: 'Demonstração com especialista' },
  { id: 'opening', label: 'Estou abrindo uma clínica', contextGoal: 'Clínica em abertura' },
]

const PROCESS_OPTIONS: ProcessOption[] = [
  { id: 'paper', label: 'Uso papel hoje', contextProcess: 'Usa papel' },
  { id: 'sheet', label: 'Uso planilha', contextProcess: 'Usa planilha' },
  { id: 'software', label: 'Já uso outro software', contextProcess: 'Usa outro software' },
  { id: 'none', label: 'Ainda não tenho sistema', contextProcess: 'Sem sistema' },
]

const TIME_OPTIONS = ['Manhã (8h–12h)', 'Tarde (12h–17h)', 'Noite (17h–20h)', 'Qualquer horário']

type FormData = {
  name: string
  whatsapp: string
  clinic: string
  time: string
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
  const [step, setStep] = useState<ChatStep>('goal')
  const [selectedGoal, setSelectedGoal] = useState<QuickOption | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<ProcessOption | null>(null)
  const [form, setForm] = useState<FormData>({ name: '', whatsapp: '', clinic: '', time: '' })
  const [lgpdConsent, setLgpdConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleOpen = () => {
    setIsOpen(true)
    setStep('goal')
    setSelectedGoal(null)
    setSelectedProcess(null)
    setForm({ name: '', whatsapp: '', clinic: '', time: '' })
    setLgpdConsent(false)
    setErrors({})
    setLoading(false)
    setSubmitError(null)
  }

  const handleSelectGoal = (option: QuickOption) => {
    setSelectedGoal(option)
    setStep('process')
  }

  const handleSelectProcess = (option: ProcessOption) => {
    setSelectedProcess(option)
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
    const context = [
      selectedGoal?.contextGoal ?? 'Contato pelo chat',
      selectedProcess ? `· ${selectedProcess.contextProcess}` : '',
    ]
      .filter(Boolean)
      .join(' ')
    try {
      await submitPublicLead({
        name: form.name.trim(),
        phone: form.whatsapp,
        clinicName: form.clinic.trim() || undefined,
        preferredTime: form.time || undefined,
        context,
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
          className="fixed bottom-24 right-5 z-50 flex w-[28rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 max-sm:bottom-20 max-sm:left-3 max-sm:right-3 max-sm:w-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-white">DentalFlow</p>
              <p className="flex items-center gap-1.5 text-sm text-blue-200">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
                Online agora
              </p>
            </div>
            <button
              type="button"
              aria-label="Fechar chat"
              onClick={() => setIsOpen(false)}
              className="ml-auto rounded p-1.5 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5" style={{ maxHeight: '36rem' }}>

            {/* Step 1 — Goal selection */}
            {step === 'goal' && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl bg-slate-100 px-4 py-3.5 text-base text-slate-700 leading-relaxed">
                  Olá! 👋 O que você quer melhorar na sua clínica?
                </div>
                <div className="flex flex-col gap-2.5">
                  {GOAL_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectGoal(option)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Current process */}
            {step === 'process' && selectedGoal && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl bg-slate-100 px-4 py-3.5 text-base text-slate-700 leading-relaxed">
                  Entendido! Como você gerencia sua clínica hoje?
                </div>
                <div className="flex flex-col gap-2.5">
                  {PROCESS_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectProcess(option)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setStep('goal')}
                  className="text-sm text-slate-400 hover:text-slate-600"
                >
                  ← Voltar
                </button>
              </div>
            )}

            {/* Step 3 — Contact form */}
            {step === 'form' && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl bg-slate-100 px-4 py-3.5 text-base text-slate-700 leading-relaxed">
                  Ótimo! Para conectar você com nosso time, precisamos de algumas informações:
                </div>

                <div className="flex flex-col gap-3.5">
                  {/* Nome */}
                  <div>
                    <label
                      htmlFor="chat-name"
                      className="mb-1.5 block text-sm font-medium text-slate-600"
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
                        'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20',
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
                      className="mb-1.5 block text-sm font-medium text-slate-600"
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
                        'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20',
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
                      className="mb-1.5 block text-sm font-medium text-slate-600"
                    >
                      Nome da clínica
                    </label>
                    <input
                      id="chat-clinic"
                      type="text"
                      value={form.clinic}
                      onChange={(e) => setForm((f) => ({ ...f, clinic: e.target.value }))}
                      placeholder="Como se chama sua clínica?"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  {/* Time preference */}
                  <div>
                    <label
                      htmlFor="chat-time"
                      className="mb-1.5 block text-sm font-medium text-slate-600"
                    >
                      Melhor horário para contato
                    </label>
                    <Select
                      value={form.time || undefined}
                      onValueChange={(value) => setForm((f) => ({ ...f, time: value }))}
                    >
                      <SelectTrigger
                        id="chat-time"
                        className="rounded-xl border-slate-200 px-4"
                      >
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* LGPD consent */}
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={lgpdConsent}
                        onChange={(e) => setLgpdConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary"
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
                    <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                      <p className="text-sm leading-5 text-red-600">{submitError}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      'Enviando...'
                    ) : (
                      <>
                        Enviar mensagem
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep('process')}
                    className="text-sm text-slate-400 hover:text-slate-600"
                  >
                    ← Voltar
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Success */}
            {step === 'success' && (
              <div className="flex flex-col items-center gap-5 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800">Recebemos seu contato!</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Em breve um especialista do DentalFlow falará com você pelo WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-primary hover:underline"
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
