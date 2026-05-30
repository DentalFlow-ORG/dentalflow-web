import { useCallback, useEffect, useRef, useState } from 'react'

import {
  isValidWhatsappPhoneBR,
  WHATSAPP_PHONE_REQUIRED_MESSAGE,
} from '@/lib/field-formatters'
import { submitPublicLead } from '@/services/public-leads.service'

import {
  INITIAL_FORM,
  MSG_FORM,
  MSG_INIT,
  MSG_PROCESS,
  type ChatMessage,
  type FormData,
  type ProcessOption,
  type QuickOption,
} from '../data/lead-chat-content'

export type ChatStep = 'situation' | 'process' | 'form' | 'success'

let _uid = 0
const uid = () => `m${++_uid}`

export function useLeadChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<ChatStep>('situation')
  const [history, setHistory] = useState<ChatMessage[]>([MSG_INIT])
  const [situationAnswer, setSituationAnswer] = useState<QuickOption | null>(null)
  const [processAnswer, setProcessAnswer] = useState<ProcessOption | null>(null)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [lgpdConsent, setLgpdConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, step])

  const resetChat = useCallback(() => {
    setStep('situation')
    setHistory([MSG_INIT])
    setSituationAnswer(null)
    setProcessAnswer(null)
    setForm(INITIAL_FORM)
    setLgpdConsent(false)
    setErrors({})
    setLoading(false)
    setSubmitError(null)
  }, [])

  useEffect(() => {
    const onOpen = () => {
      resetChat()
      setIsOpen(true)
    }
    const onClose = () => setIsOpen(false)
    window.addEventListener('dentalflow:chat:open', onOpen)
    window.addEventListener('dentalflow:chat:close', onClose)
    return () => {
      window.removeEventListener('dentalflow:chat:open', onOpen)
      window.removeEventListener('dentalflow:chat:close', onClose)
    }
  }, [resetChat])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('dentalflow:chat:state', { detail: { isOpen } }))
  }, [isOpen])

  const handleOpen = () => {
    resetChat()
    setIsOpen(true)
  }

  const handleSelectSituation = (option: QuickOption) => {
    setHistory((current) => [
      ...current,
      { id: uid(), role: 'user', content: option.label },
      MSG_PROCESS,
    ])
    setSituationAnswer(option)
    setStep('process')
  }

  const handleSelectProcess = (option: ProcessOption) => {
    setHistory((current) => [
      ...current,
      { id: uid(), role: 'user', content: option.label },
      MSG_FORM,
    ])
    setProcessAnswer(option)
    setStep('form')
  }

  const backToSituation = () => {
    setSituationAnswer(null)
    setHistory((current) => current.slice(0, -2))
    setStep('situation')
  }

  const backToProcess = () => {
    setProcessAnswer(null)
    setErrors({})
    setSubmitError(null)
    setHistory((current) => current.slice(0, -2))
    setStep('process')
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Informe seu nome.'
    if (!form.whatsapp.trim()) {
      next.whatsapp = 'Informe seu WhatsApp.'
    } else if (!isValidWhatsappPhoneBR(form.whatsapp)) {
      next.whatsapp = WHATSAPP_PHONE_REQUIRED_MESSAGE
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
      situationAnswer?.contextGoal ?? 'Contato pelo chat',
      processAnswer ? `· ${processAnswer.contextProcess}` : '',
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
      setHistory((current) => [
        ...current,
        {
          id: uid(),
          role: 'bot',
          content:
            '🎉 Recebemos seu contato! Em breve um especialista do DentalFlow falará com você pelo WhatsApp.',
        },
      ])
      setStep('success')
    } catch {
      setSubmitError(
        'Não foi possível enviar. Tente novamente ou entre em contato pelo WhatsApp.',
      )
    } finally {
      setLoading(false)
    }
  }

  return {
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
  }
}
