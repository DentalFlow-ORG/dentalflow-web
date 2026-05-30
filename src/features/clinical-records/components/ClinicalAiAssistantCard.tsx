import { Sparkles } from 'lucide-react'

export function ClinicalAiAssistantCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <Sparkles
          className="h-4 w-4 shrink-0 text-primary/70"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-foreground">
          Assistente clínico
        </span>
        <span className="ml-auto inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Em breve
        </span>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
        No futuro, este recurso poderá ajudar a resumir a consulta, organizar a
        evolução clínica e sugerir rascunhos com base nas informações do
        atendimento.
      </p>
    </div>
  )
}
