import { ArrowRight, HelpCircle, Mail, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { companyInfo } from '@/config/company'
import { cn } from '@/lib/utils'

import { PublicLayout } from '../components/PublicLayout'
import { usePageMeta } from '../hooks/usePageMeta'
import { faqItems } from '../data/public-content'

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-slate-800">{question}</span>
        <span
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-transform',
            open && 'rotate-45 border-primary text-primary',
          )}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      {open && (
        <div className="pb-5 pr-8">
          <p className="text-sm leading-7 text-slate-600">{answer}</p>
        </div>
      )}
    </div>
  )
}

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
    window.dispatchEvent(new CustomEvent(chatOpen ? 'dentalflow:chat:close' : 'dentalflow:chat:open'))
  }
  return { chatOpen, toggleChat }
}

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
          <HelpCircle className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
          <h1 className="mt-5 text-4xl font-semibold text-slate-900 sm:text-5xl">
            Perguntas frequentes
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-500">
            Encontre respostas rápidas sobre o DentalFlow. Se não encontrar o que procura, nosso time está disponível para ajudar.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="divide-y-0 rounded-2xl border border-slate-200 bg-white px-6 shadow-sm sm:px-8">
            {faqItems.map((item) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section id="contato" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Não encontrou sua dúvida?
            </h2>
            <p className="mt-3 text-slate-500">
              Nossa equipe está disponível para responder perguntas e fazer uma demonstração personalizada.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={`mailto:${companyInfo.supportEmail}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-primary/25 hover:shadow-md"
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
              className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-primary/25 hover:shadow-md"
            >
              <div className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
                chatOpen ? 'bg-primary' : 'bg-primary/10',
              )}>
                <MessageCircle className={cn('h-5 w-5', chatOpen ? 'text-white' : 'text-primary')} aria-hidden="true" />
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
          <h2 className="text-2xl font-semibold text-white">
            Quer experimentar sem compromisso?
          </h2>
          <p className="mt-3 text-blue-200">7 dias gratuitos, sem cartão de crédito.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="/acessar?mode=register">
                Começar teste grátis
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="inverse" asChild>
              <a href="/planos">Ver planos e preços</a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
