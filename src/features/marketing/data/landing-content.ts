import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  Globe2,
  Headset,
  LayoutDashboard,
  LineChart,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Target,
  UsersRound,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Método', href: '#metodo' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'Contato', href: '#contato' },
] as const

export const heroMetrics = [
  { value: '360', label: 'visão integrada sobre presença, campanhas e conversão' },
  { value: 'Premium', label: 'experiência digital alinhada a clínicas de alto padrão' },
  { value: 'Mensurável', label: 'indicadores claros para evoluir decisões comerciais' },
] as const

export const trialHighlights = [
  'Sem cartão de crédito',
  'Ambiente de teste guiado',
  'Cancelamento sem burocracia',
] as const

export const quickActions = [
  {
    icon: LayoutDashboard,
    title: 'Gestão centralizada',
    description: 'Organize campanhas, prioridades comerciais e indicadores em um único lugar.',
  },
  {
    icon: BarChart3,
    title: 'Crescimento mensurável',
    description: 'Acompanhe evolução de demanda, canais e oportunidades com clareza.',
  },
  {
    icon: ShieldCheck,
    title: 'Posicionamento premium',
    description: 'Transmita autoridade com uma experiência confiável, moderna e consistente.',
  },
] as const

export const painPoints = [
  'Marketing sem leitura clara de retorno',
  'Agenda dependente de indicações e campanhas pontuais',
  'Presença digital abaixo do padrão da clínica',
  'Falta de processo entre atração, atendimento e conversão',
] as const

export const solutions = [
  {
    icon: Globe2,
    title: 'Presença digital estruturada',
    description: 'Sites, páginas e jornadas com linguagem profissional para fortalecer autoridade.',
  },
  {
    icon: Megaphone,
    title: 'Aquisição de pacientes',
    description: 'Campanhas orientadas por dados para atrair pacientes com maior potencial.',
  },
  {
    icon: MessageCircle,
    title: 'Relacionamento e conversão',
    description: 'Fluxos comerciais mais claros para reduzir perdas entre interesse e agendamento.',
  },
  {
    icon: LineChart,
    title: 'Indicadores de crescimento',
    description: 'Dashboards executivos para visualizar canais, desempenho e oportunidades.',
  },
] as const

export const processSteps = [
  {
    step: '01',
    title: 'Diagnóstico comercial',
    description: 'Mapeamos posicionamento, canais, oferta, diferenciais e gargalos de conversão.',
  },
  {
    step: '02',
    title: 'Arquitetura da presença',
    description: 'Organizamos mensagens, páginas, rotas de contato e padrão visual da experiência.',
  },
  {
    step: '03',
    title: 'Operação de aquisição',
    description: 'Conectamos campanhas, rotina de acompanhamento e leitura de performance.',
  },
  {
    step: '04',
    title: 'Evolução contínua',
    description: 'Ajustes recorrentes ajudam a manter consistência, previsibilidade e escala.',
  },
] as const

export const features = [
  {
    icon: Target,
    title: 'Segmentação por especialidade',
    description: 'Implantes, ortodontia, estética, harmonização e outros serviços com narrativa própria.',
  },
  {
    icon: CalendarDays,
    title: 'Prioridades de agenda',
    description: 'Campanhas e comunicação alinhadas a procedimentos de maior valor estratégico.',
  },
  {
    icon: ClipboardCheck,
    title: 'Rotina comercial clara',
    description: 'Melhor acompanhamento de oportunidades para a equipe agir com menos improviso.',
  },
  {
    icon: UsersRound,
    title: 'Experiência do paciente',
    description: 'Contato inicial mais profissional, coerente e orientado à próxima ação.',
  },
  {
    icon: Clock3,
    title: 'Previsibilidade operacional',
    description: 'Leitura objetiva do que está funcionando e do que precisa ser ajustado.',
  },
  {
    icon: Headset,
    title: 'Acompanhamento consultivo',
    description: 'Suporte próximo para transformar dados em decisões práticas de crescimento.',
  },
] as const

export const results = [
  { value: '+ autoridade', label: 'percepção de marca mais forte em canais digitais' },
  { value: '+ demanda', label: 'jornadas pensadas para capturar oportunidades qualificadas' },
  { value: '+ clareza', label: 'decisões guiadas por indicadores e contexto comercial' },
] as const

export const testimonials = [
  {
    quote:
      'A apresentação da clínica ficou mais profissional e o time passou a entender melhor de onde vinha cada oportunidade.',
    author: 'Clínica odontológica premium',
    detail: 'Implantodontia e estética dental',
  },
  {
    quote:
      'O principal ganho foi organização: campanhas, contatos e indicadores passaram a conversar entre si.',
    author: 'Rede regional de clínicas',
    detail: 'Crescimento e operação comercial',
  },
] as const
