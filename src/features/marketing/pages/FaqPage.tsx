import { ArrowRight, ChevronDown, HelpCircle, Mail, MessageCircle } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { companyInfo } from '@/config/company'
import { cn } from '@/lib/utils'

import { PublicLayout } from '../components/PublicLayout'
import { usePageMeta } from '../hooks/usePageMeta'
import { faqItems } from '../data/public-content'

// ── Group definitions (index-based — avoids coupling to question text) ─────────

const FAQ_GROUPS = [
  { label: 'Planos e assinatura', indices: [0, 1, 8, 12] },
  { label: 'Funcionalidades', indices: [2, 3, 4, 5, 11] },
  { label: 'Dados, segurança e acesso', indices: [6, 7, 9, 10] },
] as const

// ── FaqItem ───────────────────────────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const uid = useId()
  const buttonId = `faq-btn-${uid}`
  const panelId = `faq-panel-${uid}`

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'group flex w-full items-start justify-between gap-4 py-5 text-left',
          'rounded-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1',
        )}
      >
        <span
          className={cn(
            'text-sm font-semibold transition-colors',
            open ? 'text-primary' : 'text-slate-800 group-hover:text-slate-900',
          )}
        >
          {question}
        </span>
        <ChevronDown
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 transition-all duration-200',
            open
              ? 'rotate-180 text-primary'
              : 'text-slate-400 group-hover:text-slate-500',
          )}
          aria-hidden="true"
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-8 text-sm leading-7 text-slate-600">{answer}</p>
        </div>
      </div>
    </div>
  )
}

// ── Chat widget state ─────────────────────────────────────────────────────────

function useChatWidgetState() {
  const [chatOpen, setChatOpen] = useState(false)
  useEffect(() => {
    const handler = (e: Event) => {
      setChatOpen((e as CustomEvent<{ isOpen: boolean }>).detail.isOpen)
    }
    window.addEventListener('dentalflow:chat:state', handler)
    return () => window.removeEventListener('dentalflow:chat:state', handler)
  }, [])
  const toggleChat = () => {
    window.dispatchEvent(
      new CustomEvent(chatOpen ? 'dentalflow:chat:close' : 'dentalflow:chat:open'),
    )
  }
  return { chatOpen, toggleChat }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function FaqPage() {
  const { chatOpen, toggleChat } = useChatWidgetState()
  usePageMeta(
    'DentalFlow | Perguntas frequentes',
    'Respostas sobre planos, funcionalidades, segurança, LGPD, WhatsApp e muito mais. Tire suas dúvidas sobre o DentalFlow.',
  )
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pb-12 pt-28 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
            aria-hidden="true"
          >
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Tire suas dúvidas
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-500">
            Respostas diretas sobre planos, funcionalidades, dados e segurança. Se não encontrar o que procura, nossa equipe está disponível.
          </p>
        </div>
      </section>

      {/* FAQ grouped sections */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-10 px-6 lg:px-8">
          {FAQ_GROUPS.map((group) => (
            <div key={group.label}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {group.label}
              </h2>
              <div className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm sm:px-8">
                {group.indices.map((i) => {
                  const item = faqItems[i]
                  return item ? (
                    <FaqItem key={item.question} question={item.question} answer={item.answer} />
                  ) : null
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contato" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900">Não encontrou sua dúvida?</h2>
            <p className="mt-3 text-slate-500">
              Nossa equipe está disponível para responder perguntas e fazer uma demonstração
              personalizada.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={`mailto:${companyInfo.supportEmail}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">E-mail de suporte</p>
                <p className="mt-0.5 text-sm text-primary">{companyInfo.supportEmail}</p>
              </div>
            </a>
            <button
              type="button"
              onClick={toggleChat}
              aria-pressed={chatOpen}
              className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
            >
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
                  chatOpen ? 'bg-primary' : 'bg-primary/10',
                )}
              >
                <MessageCircle
                  className={cn('h-5 w-5', chatOpen ? 'text-white' : 'text-primary')}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Chat de contato</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {chatOpen ? 'Clique para fechar o chat.' : 'Clique para abrir o chat de contato.'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-semibold text-white">Quer experimentar sem compromisso?</h2>
          <p className="mt-3 text-blue-100">7 dias gratuitos, sem cartão de crédito.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/acessar" search={{ mode: 'register' }}>
                Começar teste grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="inverse" asChild>
              <Link to="/planos">Ver planos e preços</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
