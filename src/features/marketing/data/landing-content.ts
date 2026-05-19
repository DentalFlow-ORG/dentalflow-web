import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  UsersRound,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Funcionalidades', href: '/funcionalidades' },
  { label: 'Planos', href: '#planos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Segurança', href: '#seguranca' },
] as const

export const heroMetrics = [
  { value: '7 dias', label: 'de teste grátis, sem cartão de crédito' },
  { value: '3 perfis', label: 'de acesso distintos por função na clínica' },
  { value: '100% web', label: 'sem instalação. Acesse de qualquer dispositivo' },
] as const

export const trialHighlights = [
  '7 dias grátis',
  'Sem cartão de crédito',
  'Cancelamento fácil',
] as const

export const heroAppointments = [
  {
    time: '09:00',
    patient: 'Ana Rodrigues',
    procedure: 'Limpeza e avaliação',
    dentist: 'Dr. Carlos Lima',
    status: 'confirmed' as const,
  },
  {
    time: '10:30',
    patient: 'Marcos Pereira',
    procedure: 'Extração de siso',
    dentist: 'Dr. Carlos Lima',
    status: 'waiting' as const,
  },
  {
    time: '11:00',
    patient: 'Juliana Castro',
    procedure: 'Clareamento dental',
    dentist: 'Dra. Paula Souza',
    status: 'confirmed' as const,
  },
] as const

export const painPoints = [
  {
    icon: CalendarDays,
    title: 'Agenda desorganizada',
    description: 'Conflitos de horário e faltas sem aviso geram retrabalho e prejuízo direto para a clínica.',
  },
  {
    icon: Users,
    title: 'Informações espalhadas',
    description: 'Histórico clínico em papel, e-mail ou planilha torna o atendimento mais lento e impreciso.',
  },
  {
    icon: ShieldCheck,
    title: 'Sem controle de acesso',
    description: 'Qualquer membro da equipe vê dados que não deveria, sem restrição por função ou perfil.',
  },
  {
    icon: LayoutDashboard,
    title: 'Falta de visibilidade',
    description: 'Sem indicadores, é difícil saber o que está funcionando na operação e onde agir.',
  },
  {
    icon: UserCheck,
    title: 'Follow-ups esquecidos',
    description: 'Retornos e acompanhamentos de pacientes se perdem por falta de um processo claro.',
  },
  {
    icon: ClipboardList,
    title: 'Rotina confusa para a equipe',
    description: 'Dentistas e assistentes precisam de fluxos diferentes, mas usam ferramentas genéricas.',
  },
] as const

export const solutions = [
  {
    icon: CalendarDays,
    title: 'Agenda centralizada',
    description: 'Consultas organizadas por dentista, status e horário. Menos conflitos, mais controle da rotina.',
  },
  {
    icon: Users,
    title: 'Dados de pacientes organizados',
    description: 'Cadastro completo, histórico de atendimentos e prontuários digitais em um único lugar.',
  },
  {
    icon: ShieldCheck,
    title: 'Acesso controlado por função',
    description: 'Cada membro acessa apenas o que precisa. Proprietário, dentista e assistente com visões distintas.',
  },
  {
    icon: LayoutDashboard,
    title: 'Visão clara da operação',
    description: 'Indicadores para que o proprietário acompanhe a rotina e tome decisões com mais segurança.',
  },
] as const

export const processSteps = [
  {
    step: '01',
    title: 'Crie sua conta grátis',
    description: 'Cadastre a clínica em minutos, sem cartão de crédito. O período de teste dura 7 dias completos.',
  },
  {
    step: '02',
    title: 'Configure sua equipe',
    description: 'Adicione dentistas e assistentes com o perfil de acesso correto para cada função na clínica.',
  },
  {
    step: '03',
    title: 'Cadastre pacientes e consultas',
    description: 'Organize a agenda, registre pacientes e comece a usar o prontuário digital.',
  },
  {
    step: '04',
    title: 'Gerencie com clareza',
    description: 'Acompanhe a operação com indicadores e tome decisões com base em dados reais da clínica.',
  },
] as const

export const features = [
  {
    icon: CalendarDays,
    title: 'Agendamento inteligente',
    description: 'Consultas organizadas com status, horário e dentista responsável. Menos conflitos, mais controle da rotina.',
  },
  {
    icon: Users,
    title: 'Gestão de pacientes',
    description: 'Cadastro centralizado com histórico de atendimentos e prontuários digitais acessíveis na hora certa.',
  },
  {
    icon: UsersRound,
    title: 'Gestão da equipe',
    description: 'Cadastre dentistas, assistentes e proprietários com perfis de acesso distintos e organizados.',
  },
  {
    icon: ShieldCheck,
    title: 'Permissões por função',
    description: 'Controle quem pode ver e editar o quê. Acesso restrito conforme o papel e o plano ativo.',
  },
  {
    icon: CreditCard,
    title: 'Planos e assinatura',
    description: 'Escolha o plano ideal para o volume da clínica. 7 dias grátis sem compromisso ou cartão de crédito.',
  },
  {
    icon: BarChart3,
    title: 'Indicadores da operação',
    description: 'Visão geral da rotina clínica para que o proprietário acompanhe o desempenho com clareza.',
  },
] as const

export const userProfiles = [
  {
    icon: LayoutDashboard,
    role: 'Proprietário',
    headline: 'Mais controle sobre a clínica.',
    description: 'Acesse a agenda completa, gerencie a equipe, controle permissões e acompanhe indicadores da operação. Visão de gestão clara para o dia a dia.',
    highlights: [
      'Agenda completa da clínica',
      'Gestão da equipe e permissões',
      'Indicadores da operação',
      'Controle do plano e assinatura',
    ],
  },
  {
    icon: Stethoscope,
    role: 'Dentista',
    headline: 'Consultas organizadas, rotina mais leve.',
    description: 'Veja sua agenda do dia, acesse os dados dos seus pacientes e mantenha os prontuários digitais atualizados sem depender de papel.',
    highlights: [
      'Minha agenda do dia',
      'Prontuários digitais',
      'Histórico de atendimentos por paciente',
    ],
  },
  {
    icon: ClipboardList,
    role: 'Assistente',
    headline: 'Agendamentos e pacientes mais ágeis.',
    description: 'Agende, atualize e gerencie pacientes com agilidade. Interface pensada para quem atua na operação diária da clínica.',
    highlights: [
      'Gestão de consultas',
      'Cadastro de pacientes',
      'Controle de status e agenda',
    ],
  },
] as const

export const landingPlans = [
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Ideal para clínicas em fase inicial',
    priceMonthly: 'R$ 99,90',
    compareAtMonthly: 'R$ 129,90',
    isRecommended: false,
    features: [
      'Agenda da clínica',
      'Minha agenda para dentistas',
      'Cadastro de pacientes',
      'Prontuários digitais',
      'Equipe essencial',
      'Permissões básicas de acesso',
      '7 dias grátis incluídos',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    tagline: 'Para clínicas em crescimento',
    priceMonthly: 'R$ 189,90',
    compareAtMonthly: 'R$ 249,90',
    isRecommended: true,
    features: [
      'Tudo do Starter',
      'Mais recursos para a equipe',
      'Permissões por função',
      'Indicadores da operação',
      'Gestão da assinatura',
      'Melhor para clínicas em crescimento',
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    tagline: 'Para clínicas com maior volume',
    priceMonthly: 'R$ 279,90',
    compareAtMonthly: 'R$ 349,90',
    isRecommended: false,
    features: [
      'Tudo do Professional',
      'Mais capacidade operacional',
      'Recursos avançados do sistema',
      'Suporte prioritário',
      'Preparado para expansão da clínica',
    ],
  },
] as const

export const trustPoints = [
  {
    icon: Lock,
    title: 'Controle de acesso por função',
    description: 'Cada usuário acessa apenas o que é relevante para seu papel. Proprietários, dentistas e assistentes têm visões distintas e separadas.',
  },
  {
    icon: ShieldCheck,
    title: 'Dados organizados com responsabilidade',
    description: 'Informações de pacientes e da clínica armazenadas com boas práticas de segurança e organização de dados.',
  },
  {
    icon: UserCheck,
    title: 'Autenticação e acesso controlado',
    description: 'Acesso ao sistema protegido por autenticação. Sem compartilhamento de sessão ou exposição de dados entre clínicas.',
  },
] as const

export const results = [
  { value: '7 dias', label: 'de teste gratuito sem cartão de crédito ou compromisso' },
  { value: '3 perfis', label: 'de acesso distintos: proprietário, dentista e assistente' },
  { value: '100% web', label: 'sem instalação. Acesse de qualquer dispositivo, onde estiver' },
] as const
