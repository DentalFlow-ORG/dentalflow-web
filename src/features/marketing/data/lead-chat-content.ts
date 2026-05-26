export type QuickOption = { id: string; label: string; contextGoal: string }
export type ProcessOption = { id: string; label: string; contextProcess: string }

export type ChatMessage = {
  id: string
  role: 'bot' | 'user'
  content: string
}

export type FormData = {
  name: string
  whatsapp: string
  clinic: string
  time: string
}

export const GOAL_OPTIONS: QuickOption[] = [
  { id: 'agenda', label: 'Quero organizar minha agenda', contextGoal: 'Organizar agenda' },
  { id: 'finance', label: 'Quero melhorar o financeiro', contextGoal: 'Melhorar controle financeiro' },
  { id: 'patients', label: 'Quero captar mais pacientes', contextGoal: 'Captação de pacientes' },
  { id: 'plans', label: 'Quero entender os planos', contextGoal: 'Informações sobre planos' },
  { id: 'specialist', label: 'Quero falar com um especialista', contextGoal: 'Demonstração com especialista' },
  { id: 'opening', label: 'Estou abrindo uma clínica', contextGoal: 'Clínica em abertura' },
]

export const PROCESS_OPTIONS: ProcessOption[] = [
  { id: 'paper', label: 'Uso papel hoje', contextProcess: 'Usa papel' },
  { id: 'sheet', label: 'Uso planilha', contextProcess: 'Usa planilha' },
  { id: 'software', label: 'Já uso outro software', contextProcess: 'Usa outro software' },
  { id: 'none', label: 'Ainda não tenho sistema', contextProcess: 'Sem sistema' },
]

export const TIME_OPTIONS = ['Manhã (8h–12h)', 'Tarde (12h–17h)', 'Noite (17h–20h)', 'Qualquer horário']

export const MSG_INIT: ChatMessage = {
  id: 'init',
  role: 'bot',
  content: 'Olá! 👋 O que você quer melhorar na sua clínica?',
}

export const MSG_PROCESS: ChatMessage = {
  id: 'proc',
  role: 'bot',
  content: 'Entendido! Como você gerencia sua clínica hoje?',
}

export const MSG_FORM: ChatMessage = {
  id: 'form',
  role: 'bot',
  content: 'Ótimo! Para conectar você com nosso time, precisamos de algumas informações:',
}

export const INITIAL_FORM: FormData = { name: '', whatsapp: '', clinic: '', time: '' }
