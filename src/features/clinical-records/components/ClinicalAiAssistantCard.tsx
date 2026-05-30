import { Sparkles } from 'lucide-react'

export function ClinicalAiAssistantCard() {
  return (
    <div className="rounded-xl border border-blue-200/60 bg-linear-to-br from-blue-50 to-indigo-50 p-5 dark:border-blue-800/30 dark:from-blue-950/30 dark:to-indigo-950/30">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          Assistente clínico em breve
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-indigo-600/80 dark:text-indigo-400/80">
        No futuro, este recurso poderá ajudar a resumir a consulta, organizar a
        evolução clínica e sugerir rascunhos com base nas informações do
        atendimento.
      </p>
    </div>
  )
}
