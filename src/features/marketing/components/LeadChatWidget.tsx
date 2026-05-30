import { AlertCircle, ArrowLeft, CheckCircle2, MessageCircle, RotateCcw, Send, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPhoneBR } from '@/lib/field-formatters'
import { cn } from '@/lib/utils'
import {
  GOAL_OPTIONS,
  PROCESS_OPTIONS,
  TIME_OPTIONS,
} from '../data/lead-chat-content'
import { useLeadChatWidget } from '../hooks/useLeadChatWidget'

export function LeadChatWidget() {
  const {
    isOpen,
    setIsOpen,
    step,
    history,
    form,
    setForm,
    lgpdConsent,
    setLgpdConsent,
    errors,
    loading,
    submitError,
    bottomRef,
    resetChat,
    handleOpen,
    handleSelectSituation,
    handleSelectProcess,
    backToSituation,
    backToProcess,
    handleSubmit,
  } = useLeadChatWidget()
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
          className="fixed bottom-24 right-5 z-50 flex w-[30rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 max-sm:bottom-20 max-sm:left-3 max-sm:right-3 max-sm:w-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-white">DentalFlow</p>
              <p className="flex items-center gap-1.5 text-sm text-blue-200">
                <span
                  className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"
                  aria-hidden="true"
                />
                Online agora
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {step !== 'success' && (
                <button
                  type="button"
                  title="Reiniciar conversa"
                  aria-label="Reiniciar conversa"
                  onClick={resetChat}
                  className="rounded p-1.5 text-white/70 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                aria-label="Fechar chat"
                onClick={() => setIsOpen(false)}
                className="rounded p-1.5 text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Conversation */}
          <div
            className="flex flex-col gap-3 overflow-y-auto px-4 py-4"
            style={{ maxHeight: '36rem' }}
          >
            {/* History bubbles */}
            {history.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    msg.role === 'bot'
                      ? 'rounded-tl-sm bg-slate-100 text-slate-700'
                      : 'rounded-tr-sm bg-primary text-white',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Step: situation */}
            {step === 'situation' && (
              <div className="flex flex-col gap-2">
                {GOAL_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectSituation(option)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Step: process */}
            {step === 'process' && (
              <div className="flex flex-col gap-2">
                {PROCESS_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectProcess(option)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={backToSituation}
                  className="flex items-center gap-1 self-start text-xs text-slate-400 hover:text-slate-600"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Voltar
                </button>
              </div>
            )}

            {/* Step: form */}
            {step === 'form' && (
              <div className="flex flex-col gap-3.5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                {/* Name */}
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
                      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20',
                      errors.name ? 'border-red-400' : 'border-slate-200',
                    )}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
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
                      setForm((f) => ({ ...f, whatsapp: formatPhoneBR(e.target.value) }))
                    }
                    placeholder="(11) 99999-9999"
                    className={cn(
                      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20',
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Time */}
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
                      className="rounded-xl border-slate-200 bg-white px-4"
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

                {/* LGPD */}
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={lgpdConsent}
                      onChange={(e) => setLgpdConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary"
                      aria-describedby="lgpd-description"
                    />
                    <span id="lgpd-description" className="text-xs leading-5 text-slate-600">
                      Aceito ser contatado pelo DentalFlow e concordo com a{' '}
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
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-5 text-red-600">{submitError}</p>
                  </div>
                )}

                <Button onClick={handleSubmit} disabled={loading} className="w-full">
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
                  onClick={backToProcess}
                  className="flex items-center gap-1 self-start text-xs text-slate-400 hover:text-slate-600"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Voltar
                </button>
              </div>
            )}

            {/* Step: success */}
            {step === 'success' && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
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

            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </>
  )
}
