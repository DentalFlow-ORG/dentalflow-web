import { Sparkles } from 'lucide-react'

export function ClinicalAiAssistantCard() {
  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-700">
          Assistente clínico em breve
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-indigo-600/80">
        No futuro, este recurso poderá ajudar a resumir a consulta, organizar a
        evolução clínica e sugerir rascunhos com base nas informações do
        atendimento.
      </p>
    </div>
  )
}
