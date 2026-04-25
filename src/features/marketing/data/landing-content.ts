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
  { label: 'Solucoes', href: '#solucoes' },
  { label: 'Metodo', href: '#metodo' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'Contato', href: '#contato' },
] as const

export const heroMetrics = [
  { value: '360', label: 'visao integrada sobre presenca, campanhas e conversao' },
  { value: 'Premium', label: 'experiencia digital alinhada a clinicas de alto padrao' },
  { value: 'Mensuravel', label: 'indicadores claros para evoluir decisoes comerciais' },
] as const

export const trialHighlights = [
  'Sem cartao de credito',
  'Ambiente de teste guiado',
  'Cancelamento sem burocracia',
] as const

export const quickActions = [
  {
    icon: LayoutDashboard,
    title: 'Gestao centralizada',
    description: 'Organize campanhas, prioridades comerciais e indicadores em um unico lugar.',
  },
  {
    icon: BarChart3,
    title: 'Crescimento mensuravel',
    description: 'Acompanhe evolucao de demanda, canais e oportunidades com clareza.',
  },
  {
    icon: ShieldCheck,
    title: 'Posicionamento premium',
    description: 'Transmita autoridade com uma experiencia confiavel, moderna e consistente.',
  },
] as const

export const painPoints = [
  'Marketing sem leitura clara de retorno',
  'Agenda dependente de indicacoes e campanhas pontuais',
  'Presenca digital abaixo do padrao da clinica',
  'Falta de processo entre atracao, atendimento e conversao',
] as const

export const solutions = [
  {
    icon: Globe2,
    title: 'Presenca digital estruturada',
    description: 'Sites, paginas e jornadas com linguagem profissional para fortalecer autoridade.',
  },
  {
    icon: Megaphone,
    title: 'Aquisicao de pacientes',
    description: 'Campanhas orientadas por dados para atrair pacientes com maior potencial.',
  },
  {
    icon: MessageCircle,
    title: 'Relacionamento e conversao',
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
    title: 'Diagnostico comercial',
    description: 'Mapeamos posicionamento, canais, oferta, diferenciais e gargalos de conversao.',
  },
  {
    step: '02',
    title: 'Arquitetura da presenca',
    description: 'Organizamos mensagens, paginas, rotas de contato e padrao visual da experiencia.',
  },
  {
    step: '03',
    title: 'Operacao de aquisicao',
    description: 'Conectamos campanhas, rotina de acompanhamento e leitura de performance.',
  },
  {
    step: '04',
    title: 'Evolucao continua',
    description: 'Ajustes recorrentes ajudam a manter consistencia, previsibilidade e escala.',
  },
] as const

export const features = [
  {
    icon: Target,
    title: 'Segmentacao por especialidade',
    description: 'Implantes, ortodontia, estetica, harmonizacao e outros servicos com narrativa propria.',
  },
  {
    icon: CalendarDays,
    title: 'Prioridades de agenda',
    description: 'Campanhas e comunicacao alinhadas a procedimentos de maior valor estrategico.',
  },
  {
    icon: ClipboardCheck,
    title: 'Rotina comercial clara',
    description: 'Melhor acompanhamento de oportunidades para a equipe agir com menos improviso.',
  },
  {
    icon: UsersRound,
    title: 'Experiencia do paciente',
    description: 'Contato inicial mais profissional, coerente e orientado a proxima acao.',
  },
  {
    icon: Clock3,
    title: 'Previsibilidade operacional',
    description: 'Leitura objetiva do que esta funcionando e do que precisa ser ajustado.',
  },
  {
    icon: Headset,
    title: 'Acompanhamento consultivo',
    description: 'Suporte proximo para transformar dados em decisoes praticas de crescimento.',
  },
] as const

export const results = [
  { value: '+ autoridade', label: 'percepcao de marca mais forte em canais digitais' },
  { value: '+ demanda', label: 'jornadas pensadas para capturar oportunidades qualificadas' },
  { value: '+ clareza', label: 'decisoes guiadas por indicadores e contexto comercial' },
] as const

export const testimonials = [
  {
    quote:
      'A apresentacao da clinica ficou mais profissional e o time passou a entender melhor de onde vinha cada oportunidade.',
    author: 'Clinica odontologica premium',
    detail: 'Implantodontia e estetica dental',
  },
  {
    quote:
      'O principal ganho foi organizacao: campanhas, contatos e indicadores passaram a conversar entre si.',
    author: 'Rede regional de clinicas',
    detail: 'Crescimento e operacao comercial',
  },
] as const
