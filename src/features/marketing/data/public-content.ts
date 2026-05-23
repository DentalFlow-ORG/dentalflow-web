import {
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Package,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
  Zap,
} from 'lucide-react'


export type IntegrationCard = {
  name: string
  category: string
  description: string
  where: string
  benefit: string
  logoSrc: string
  logoAlt: string
  sourceLabel: string
  status: 'available' | 'configuring' | 'soon' | 'simulated'
  statusLabel: string
  icon: typeof CalendarDays
}

export const integrationCards: IntegrationCard[] = [
  {
    name: 'Google Calendar',
    category: 'Agenda e disponibilidade',
    benefit: 'Dentistas acompanham seus horários em qualquer dispositivo, sem precisar abrir o sistema.',
    description: 'A agenda do DentalFlow sincroniza com o Google Calendar. Horários, confirmações e disponibilidade ficam acessíveis fora do sistema — sem retrabalho de atualização manual.',
    where: 'Módulo de agenda e configurações de notificações.',
    logoSrc: '/brands/integrations/google-calendar.svg',
    logoAlt: 'Logo do Google Calendar',
    sourceLabel: 'Simple Icons',
    status: 'available',
    statusLabel: 'Disponível',
    icon: CalendarDays,
  },
  {
    name: 'Stripe',
    category: 'Assinaturas e cobrança',
    benefit: 'Assinaturas da plataforma processadas de forma segura, sem exposição de tokens no frontend.',
    description: 'A cobrança da assinatura do DentalFlow passa pelo Stripe com integração server-side. Nenhum dado sensível de pagamento trafega pelo frontend da clínica.',
    where: 'Gestão da assinatura e cobrança da clínica.',
    logoSrc: '/brands/integrations/stripe.svg',
    logoAlt: 'Logo da Stripe',
    sourceLabel: 'Simple Icons',
    status: 'available',
    statusLabel: 'Disponível',
    icon: CreditCard,
  },
  {
    name: 'OpenAI',
    category: 'IA de gestão',
    benefit: 'O gestor recebe análises e alertas baseados nos dados reais da operação, sem precisar interpretar planilhas.',
    description: 'O assistente de IA do DentalFlow usa a API da OpenAI para analisar financeiro, estoque e agenda da clínica, gerando insights práticos e alertas contextualizados.',
    where: 'Módulo de IA de gestão.',
    logoSrc: '/brands/integrations/openai.svg',
    logoAlt: 'Logo da OpenAI',
    sourceLabel: 'Wikimedia Commons, fonte OpenAI',
    status: 'available',
    statusLabel: 'Disponível',
    icon: Bot,
  },
  {
    name: 'WhatsApp Cloud API',
    category: 'Comunicação com pacientes',
    benefit: 'Lembretes e confirmações enviados automaticamente — sem ligações manuais da recepção.',
    description: 'Notificações de consulta, lembretes e confirmações via WhatsApp. Requer conta Business aprovada pela Meta e configuração de templates. Nosso suporte orienta o processo.',
    where: 'Notificações e lembretes de consultas.',
    logoSrc: '/brands/integrations/whatsapp-business.svg',
    logoAlt: 'Logo do WhatsApp',
    sourceLabel: 'Simple Icons',
    status: 'configuring',
    statusLabel: 'Requer configuração externa',
    icon: MessageCircle,
  },
  {
    name: 'Supabase',
    category: 'Infraestrutura de dados',
    benefit: 'Dados de cada clínica isolados, seguros e acessíveis — sem depender de servidores próprios.',
    description: 'Banco de dados moderno usado para armazenar as informações da clínica com segurança, organização e escalabilidade. Cada clínica tem seus dados completamente separados das demais.',
    where: 'Infraestrutura de armazenamento de dados.',
    logoSrc: '/brands/integrations/supabase.svg',
    logoAlt: 'Logo do Supabase',
    sourceLabel: 'Asset interno DentalFlow',
    status: 'available',
    statusLabel: 'Disponível',
    icon: Database,
  },
  {
    name: 'Provedor NFS-e',
    category: 'Fiscal e conformidade',
    benefit: 'Dados fiscais organizados internamente hoje, prontos para emissão oficial quando o provedor estiver disponível.',
    description: 'O módulo fiscal centraliza rascunhos de notas e vincula serviços a consultas. A emissão de NFS-e oficial via provedor homologado está em desenvolvimento.',
    where: 'Módulo fiscal — emissão de notas.',
    logoSrc: '/brands/integrations/nfse.svg',
    logoAlt: 'Ícone vetorial de NFS-e',
    sourceLabel: 'Asset interno DentalFlow',
    status: 'soon',
    statusLabel: 'Em desenvolvimento',
    icon: FileText,
  },
]

export type FaqItem = {
  question: string
  answer: string
}

export const faqItems: FaqItem[] = [
  {
    question: 'O DentalFlow serve para clínica pequena?',
    answer: 'Sim. O plano Starter foi desenhado para clínicas em fase inicial, com os módulos essenciais de agenda, pacientes, prontuário e equipe a um custo acessível. Clínicas maiores podem migrar para planos com mais recursos conforme a operação crescer.',
  },
  {
    question: 'Preciso de cartão de crédito para testar?',
    answer: 'Não. O período de teste de 7 dias é gratuito e não exige cartão de crédito. Você pode explorar a plataforma e configurar a clínica sem nenhum compromisso financeiro.',
  },
  {
    question: 'Os pacientes acessam o sistema?',
    answer: 'Não. Os pacientes são cadastros internos da clínica. Eles não possuem login nem acesso à plataforma. O DentalFlow é uma ferramenta de gestão para a equipe da clínica.',
  },
  {
    question: 'O DentalFlow emite nota fiscal oficial?',
    answer: 'O módulo fiscal atual organiza dados, rascunhos e acompanhamento interno. A emissão de notas fiscais eletrônicas (NFS-e) requer integração com um provedor homologado, que está em desenvolvimento. Não prometemos emissão automática sem essa configuração.',
  },
  {
    question: 'Posso usar WhatsApp para lembrar os pacientes das consultas?',
    answer: 'O DentalFlow tem infraestrutura para notificações via WhatsApp. Para ativar, é necessário ter uma conta Business aprovada pela Meta e configurar os templates de mensagem. O suporte orienta a configuração.',
  },
  {
    question: 'A IA substitui o gestor?',
    answer: 'Não. O assistente de IA apoia decisões com base nos dados registrados no sistema. Ele fornece análises, alertas e sugestões, mas não toma decisões administrativas, contábeis ou clínicas. O gestor continua sendo o responsável pelas decisões.',
  },
  {
    question: 'O sistema é seguro?',
    answer: 'Sim. O DentalFlow utiliza autenticação segura, controle de acesso por perfil de função e dados isolados por clínica. A plataforma segue boas práticas de segurança da informação e está estruturada em conformidade com a LGPD.',
  },
  {
    question: 'Meus dados ficam separados de outras clínicas?',
    answer: 'Sim. Cada clínica tem seus dados completamente isolados das demais. Não há compartilhamento de informações entre clínicas distintas na plataforma.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sim. O DentalFlow não tem contrato de fidelidade. Você pode cancelar a assinatura a qualquer momento pelas configurações da conta, sem multa ou burocracia.',
  },
  {
    question: 'Funciona no celular?',
    answer: 'Sim. O DentalFlow é 100% web e responsivo. Você pode acessar de qualquer dispositivo com navegador — computador, tablet ou celular. Um aplicativo nativo está planejado para uma versão futura.',
  },
  {
    question: 'Consigo migrar de outro software?',
    answer: 'A migração de dados depende do formato e da origem dos dados do sistema atual. Nossa equipe de suporte pode orientar o processo de importação e adaptação da clínica ao DentalFlow.',
  },
  {
    question: 'Posso controlar pagamentos das consultas?',
    answer: 'Sim. O módulo financeiro permite registrar entradas, saídas e o status de pagamento de cada consulta. Você acompanha o que foi pago, o que está pendente e tem visão do fluxo de caixa.',
  },
  {
    question: 'O que cada plano inclui?',
    answer: 'O plano Starter cobre o essencial: agenda, pacientes, prontuários e equipe básica. O plano Professional adiciona mais recursos para equipes em crescimento e indicadores da operação. O plano Premium oferece capacidade máxima e suporte prioritário. Veja o comparativo completo na página de planos.',
  },
]

export type RoleWorkflowStep = {
  step: number
  icon: typeof CalendarDays
  title: string
  description: string
}

export type RoleFinalCta = {
  headline: string
  subtext: string
  secondaryCtaLabel: string
  secondaryCtaTo: string
}

export type RoleContent = {
  // ── Existing fields ─────────────────────────────────────
  role: string
  tagline: string
  description: string
  icon: typeof CalendarDays
  benefits: { icon: typeof CalendarDays; title: string; description: string }[]
  modules: string[]
  cta: string
  // ── New fields ──────────────────────────────────────────
  path: string
  accent: 'standard' | 'navy' | 'fresh'
  mockupType: 'dashboard' | 'checklist' | 'agenda' | 'schedule'
  highlightedBenefitIndex: number
  moduleIcons: (typeof CalendarDays)[]
  workflow: RoleWorkflowStep[]
  finalCta: RoleFinalCta
}

export const roleContents: Record<string, RoleContent> = {
  secretaria: {
    role: 'Secretária / Recepção',
    tagline: 'Menos retrabalho. Mais agilidade no atendimento.',
    description: 'A recepção é o centro operacional da clínica. O DentalFlow organiza a agenda, centraliza o cadastro de pacientes e automatiza confirmações para que sua equipe foque no atendimento.',
    icon: UsersRound,
    benefits: [
      {
        icon: CalendarDays,
        title: 'Agenda sempre atualizada',
        description: 'Visualize e gerencie todos os horários da clínica em um só lugar, com status de cada consulta em tempo real.',
      },
      {
        icon: MessageCircle,
        title: 'Confirmações automáticas via WhatsApp',
        description: 'Lembretes e confirmações de consultas enviados automaticamente, reduzindo faltas sem esforço manual.',
      },
      {
        icon: Users,
        title: 'Pacientes centralizados',
        description: 'Cadastre, busque e atualize pacientes rapidamente, com histórico de contatos e atendimentos acessível na hora.',
      },
      {
        icon: CheckCircle2,
        title: 'Menos retrabalho',
        description: 'Processos padronizados reduzem erros e duplicações. Menos tempo em tarefas repetitivas, mais foco no paciente.',
      },
    ],
    modules: ['Agenda', 'Pacientes', 'Notificações WhatsApp', 'Leads'],
    cta: 'Começar agora',
    path: '/para-secretarias',
    accent: 'standard',
    mockupType: 'schedule',
    highlightedBenefitIndex: 0,
    moduleIcons: [CalendarDays, Users, MessageCircle, TrendingUp],
    workflow: [
      {
        step: 1,
        icon: CalendarDays,
        title: 'Abre o sistema',
        description: 'Agenda do dia atualizada. Status de confirmação de cada consulta visível de imediato.',
      },
      {
        step: 2,
        icon: Users,
        title: 'Paciente liga para remarcar',
        description: 'Busca o nome, vê o histórico de agendamentos e remarca em segundos.',
      },
      {
        step: 3,
        icon: MessageCircle,
        title: 'Lembretes automáticos',
        description: 'Confirmações enviadas via WhatsApp sem ligação manual. Menos faltas sem esforço.',
      },
      {
        step: 4,
        icon: TrendingUp,
        title: 'Lead novo cadastrado',
        description: 'Contato interessado registrado com origem e status. Nenhuma oportunidade perdida.',
      },
    ],
    finalCta: {
      headline: 'Recepção mais ágil. Pacientes mais bem atendidos.',
      subtext: 'Configure em minutos. Sua agenda organizada desde o primeiro acesso.',
      secondaryCtaLabel: 'Ver planos',
      secondaryCtaTo: '/planos',
    },
  },
  dentistas: {
    role: 'Dentista',
    tagline: 'Sua agenda do dia. Histórico de cada paciente. Tudo no sistema.',
    description: 'O DentalFlow dá ao dentista visão clara da agenda e acesso rápido ao histórico clínico — sem depender de papel, de arquivo ou de outra pessoa.',
    icon: Stethoscope,
    benefits: [
      {
        icon: CalendarDays,
        title: 'Minha agenda do dia',
        description: 'Visualize seus horários, pacientes e procedimentos do dia de forma clara e organizada.',
      },
      {
        icon: ClipboardList,
        title: 'Prontuários digitais',
        description: 'Registre e consulte o histórico clínico de cada paciente diretamente no sistema, com organização por atendimento.',
      },
      {
        icon: Users,
        title: 'Histórico de atendimentos',
        description: 'Acesse todos os atendimentos anteriores de um paciente antes da consulta, com informações completas.',
      },
      {
        icon: Lock,
        title: 'Acesso restrito ao que importa',
        description: 'O dentista vê sua agenda e seus pacientes. Informações administrativas e financeiras ficam com o gestor.',
      },
    ],
    modules: ['Minha agenda', 'Prontuários digitais', 'Pacientes', 'Histórico clínico'],
    cta: 'Começar agora',
    path: '/para-dentistas',
    accent: 'standard',
    mockupType: 'agenda',
    highlightedBenefitIndex: 1,
    moduleIcons: [CalendarDays, ClipboardList, Users, FileText],
    workflow: [
      {
        step: 1,
        icon: CalendarDays,
        title: 'Chega na clínica',
        description: 'Agenda do dia carregada — horários, pacientes e procedimentos de um vistaço.',
      },
      {
        step: 2,
        icon: ClipboardList,
        title: 'Antes de entrar na sala',
        description: 'Clica no paciente e vê o histórico clínico completo. Último atendimento, observações, tratamentos.',
      },
      {
        step: 3,
        icon: FileText,
        title: 'Consulta realizada',
        description: 'Registra a evolução no prontuário digital. Sem papel, sem ficha física.',
      },
      {
        step: 4,
        icon: CheckCircle2,
        title: 'Próximo paciente',
        description: 'Histórico salvo e disponível para a próxima consulta a qualquer momento.',
      },
    ],
    finalCta: {
      headline: 'Seus prontuários no digital. Sua agenda no controle.',
      subtext: 'Sem papel. Sem depender de arquivo. Disponível em qualquer dispositivo.',
      secondaryCtaLabel: 'Ver funcionalidades',
      secondaryCtaTo: '/funcionalidades',
    },
  },
  gestores: {
    role: 'Administrador / Gestor',
    tagline: 'Visão completa da clínica. Decisões com base em dados.',
    description: 'O DentalFlow reúne financeiro, estoque, leads, relatórios e IA em um painel que qualquer gestor entende — sem precisar abrir planilha.',
    icon: LayoutDashboard,
    benefits: [
      {
        icon: CreditCard,
        title: 'Controle financeiro completo',
        description: 'Entradas, saídas, consultas pagas e pendentes, despesas fixas e fluxo de caixa em um único painel.',
      },
      {
        icon: TrendingUp,
        title: 'Relatórios e indicadores',
        description: 'Acompanhe ocupação da agenda, receita, estoque e leads com dados atualizados da operação.',
      },
      {
        icon: Bot,
        title: 'IA de gestão',
        description: 'O assistente de IA analisa os dados da clínica e apresenta insights, alertas e sugestões práticas para o gestor.',
      },
      {
        icon: UsersRound,
        title: 'Gestão de equipe e permissões',
        description: 'Cadastre membros, defina perfis de acesso e garanta que cada pessoa veja apenas o que precisa.',
      },
    ],
    modules: ['Financeiro', 'Estoque', 'Leads/CRM', 'Relatórios', 'IA de gestão', 'Equipe'],
    cta: 'Começar agora',
    path: '/para-gestores',
    accent: 'navy',
    mockupType: 'dashboard',
    highlightedBenefitIndex: 0,
    moduleIcons: [CreditCard, Package, TrendingUp, LayoutDashboard, Bot, UsersRound],
    workflow: [
      {
        step: 1,
        icon: LayoutDashboard,
        title: 'Abre o painel',
        description: 'Dados de agenda, financeiro e estoque atualizados. Visão completa da operação em segundos.',
      },
      {
        step: 2,
        icon: Bot,
        title: 'IA identifica pontos de atenção',
        description: 'Estoque crítico, pagamentos pendentes e variações na agenda identificados automaticamente.',
      },
      {
        step: 3,
        icon: TrendingUp,
        title: 'Relatório em segundos',
        description: 'Receita, despesas e saldo do mês por período. Sem consolidação manual de planilhas.',
      },
      {
        step: 4,
        icon: CheckCircle2,
        title: 'Decisão fundamentada',
        description: 'Planejar reposição, cobrar pendências, ajustar equipe — tudo com base em dados reais da clínica.',
      },
    ],
    finalCta: {
      headline: 'Painel completo da sua clínica. Sem planilha, sem suposição.',
      subtext: 'Configure em minutos. Resultados desde o primeiro acesso.',
      secondaryCtaLabel: 'Ver planos',
      secondaryCtaTo: '/planos',
    },
  },
  'clinicas-em-abertura': {
    role: 'Clínica em abertura',
    tagline: 'Comece organizado. Evite o caos desde o primeiro atendimento.',
    description: 'Abrir uma clínica do zero é complexo. Com o DentalFlow, você estrutura agenda, pacientes, financeiro e equipe desde o dia 1 — e escala sem precisar refazer tudo.',
    icon: Sparkles,
    benefits: [
      {
        icon: CalendarDays,
        title: 'Processo definido desde o início',
        description: 'Comece com agenda organizada, fluxo de atendimento padronizado e equipe com permissões corretas.',
      },
      {
        icon: Users,
        title: 'Cadastro de pacientes estruturado',
        description: 'Registre cada paciente desde a primeira consulta com histórico, contatos e dados completos.',
      },
      {
        icon: CreditCard,
        title: 'Financeiro desde o primeiro pagamento',
        description: 'Registre entradas e saídas desde o início. Saiba se a clínica está no caminho certo financeiramente.',
      },
      {
        icon: TrendingUp,
        title: 'Escale sem precisar refazer tudo',
        description: 'A estrutura do DentalFlow cresce com a clínica. Adicione módulos e plano conforme a operação expande.',
      },
    ],
    modules: ['Agenda', 'Pacientes', 'Financeiro', 'Estoque', 'Equipe'],
    cta: 'Começar agora',
    path: '/para-clinicas-em-abertura',
    accent: 'fresh',
    mockupType: 'checklist',
    highlightedBenefitIndex: 3,
    moduleIcons: [CalendarDays, Users, CreditCard, Package, UsersRound],
    workflow: [
      {
        step: 1,
        icon: Sparkles,
        title: 'Dia 1: Estrutura pronta',
        description: 'Agenda criada, equipe adicionada, permissões definidas. Operação pronta antes do primeiro paciente.',
      },
      {
        step: 2,
        icon: Users,
        title: 'Dia 3: Primeiros pacientes',
        description: 'Cadastro, agendamento e prontuário digital desde a primeira consulta.',
      },
      {
        step: 3,
        icon: CreditCard,
        title: 'Semana 2: Financeiro no controle',
        description: 'Entradas e saídas registradas. Você sabe se a clínica está no caminho certo financeiramente.',
      },
      {
        step: 4,
        icon: TrendingUp,
        title: 'Mês 1: Base para crescer',
        description: 'Dados organizados, estoque sob controle. Adicione módulos conforme a operação expande.',
      },
    ],
    finalCta: {
      headline: 'Sua clínica começa certa. Abra organizado.',
      subtext: '7 dias grátis para configurar tudo antes do primeiro atendimento.',
      secondaryCtaLabel: 'Ver planos',
      secondaryCtaTo: '/planos',
    },
  },
}

export type FeatureDetailContent = {
  id: string
  title: string
  eyebrow: string
  hero: string
  heroSub: string
  problemTitle: string
  problems: string[]
  solutionTitle: string
  solutionItems: { title: string; description: string; icon: typeof CalendarDays }[]
  benefits: string[]
  workflow: { step: number; title: string; description: string }[]
  roles: { role: string; value: string }[]
  planNote: string
  disclaimer?: string
}

export const featureDetailContents: Record<string, FeatureDetailContent> = {
  pacientes: {
    id: 'pacientes',
    title: 'Gestão de pacientes',
    eyebrow: 'Módulo de pacientes',
    hero: 'Todos os seus pacientes centralizados, organizados e acessíveis.',
    heroSub: 'Cadastre e gerencie pacientes com histórico de atendimentos, dados de contato e observações. Sem papel, sem planilha — tudo em um perfil por paciente.',
    problemTitle: 'O problema de gerenciar pacientes sem sistema',
    problems: [
      'Cadastros espalhados em fichas, cadernos ou planilhas sem padrão definido',
      'Difícil encontrar o histórico de atendimentos de um paciente rapidamente',
      'Dados de contato desatualizados dificultam a comunicação com os pacientes',
      'Pacientes antigos somem da clínica por falta de acompanhamento estruturado',
    ],
    solutionTitle: 'O que o DentalFlow organiza em pacientes',
    solutionItems: [
      {
        title: 'Cadastro completo por paciente',
        description: 'Nome, telefone, endereço, data de nascimento e observações em um perfil organizado e acessível pela equipe.',
        icon: Users,
      },
      {
        title: 'Histórico de atendimentos',
        description: 'Todos os agendamentos e consultas ficam vinculados ao perfil do paciente. O dentista consulta antes do atendimento.',
        icon: ClipboardList,
      },
      {
        title: 'WhatsApp para comunicação',
        description: 'O número cadastrado no perfil pode ser usado para notificações quando o módulo de WhatsApp estiver configurado na clínica.',
        icon: MessageCircle,
      },
      {
        title: 'Controle de atividade',
        description: 'Identifique pacientes que não retornam e organize estratégias de reativação com base em dados reais de frequência.',
        icon: UserCheck,
      },
    ],
    benefits: [
      'Cadastro centralizado em um só lugar, sem papel ou planilha',
      'Histórico de atendimentos acessível antes de cada consulta',
      'Melhor organização para acompanhamento e retorno de pacientes',
      'Base de dados estruturada para decisões da clínica',
    ],
    workflow: [
      { step: 1, title: 'Cadastro do paciente', description: 'Registre nome, contato, data de nascimento e informações relevantes no perfil.' },
      { step: 2, title: 'Primeira consulta agendada', description: 'A consulta fica vinculada ao perfil do paciente automaticamente ao ser agendada.' },
      { step: 3, title: 'Histórico atualizado', description: 'Cada consulta realizada é registrada. O dentista acessa o histórico antes do atendimento.' },
      { step: 4, title: 'Acompanhamento contínuo', description: 'A clínica acompanha pacientes ativos, inativos e retornos com mais organização.' },
    ],
    roles: [
      { role: 'Secretária / Recepção', value: 'Cadastra e atualiza dados dos pacientes, agenda consultas e acompanha o status' },
      { role: 'Dentista', value: 'Consulta o perfil e o histórico de atendimentos de cada paciente' },
      { role: 'Gestor', value: 'Acompanha a base de pacientes ativos e inativos para decisões estratégicas' },
    ],
    planNote: 'Disponível em todos os planos.',
    disclaimer: 'Os pacientes são cadastros internos da clínica e não possuem acesso à plataforma. O DentalFlow é uma ferramenta de gestão para a equipe da clínica.',
  },
  prontuarios: {
    id: 'prontuarios',
    title: 'Prontuários digitais',
    eyebrow: 'Módulo de prontuários',
    hero: 'Histórico clínico organizado e acessível para cada paciente.',
    heroSub: 'Registre evoluções clínicas e procedimentos por atendimento. Histórico completo por paciente, sem depender de papel ou arquivo físico.',
    problemTitle: 'O problema de manter prontuários em papel',
    problems: [
      'Prontuários físicos se perdem, se danificam ou ficam inacessíveis fora da clínica',
      'Difícil recuperar o histórico completo de um paciente antes da consulta',
      'Falta de padronização nos registros clínicos entre diferentes dentistas da equipe',
      'Impressão e organização de documentos clínicos consomem tempo da equipe',
    ],
    solutionTitle: 'O que o DentalFlow organiza em prontuários',
    solutionItems: [
      {
        title: 'Registro por atendimento',
        description: 'Cada consulta gera um registro no prontuário digital do paciente, com data, dentista responsável e descrição clínica.',
        icon: ClipboardList,
      },
      {
        title: 'Histórico completo por paciente',
        description: 'Todos os atendimentos ficam organizados no perfil do paciente. O dentista consulta o histórico em segundos.',
        icon: Users,
      },
      {
        title: 'Organização cronológica',
        description: 'Registros ordenados por data e filtráveis por dentista responsável, facilitando o acompanhamento clínico.',
        icon: CalendarDays,
      },
      {
        title: 'Impressão do prontuário',
        description: 'Gere a impressão do prontuário quando necessário para documentação clínica ou encaminhamentos.',
        icon: FileText,
      },
    ],
    benefits: [
      'Histórico clínico acessível antes de cada consulta',
      'Menos risco de perda de registros em relação ao papel',
      'Padronização dos registros clínicos na equipe',
      'Documentação organizada e consultável a qualquer momento',
    ],
    workflow: [
      { step: 1, title: 'Paciente no sistema', description: 'O paciente já está cadastrado com perfil e histórico acessíveis para a equipe.' },
      { step: 2, title: 'Consulta realizada', description: 'Após o atendimento, o dentista registra evoluções e procedimentos no prontuário digital.' },
      { step: 3, title: 'Histórico atualizado', description: 'O registro fica salvo e disponível para consultas futuras no perfil do paciente.' },
      { step: 4, title: 'Consulta ou impressão', description: 'A qualquer momento, o dentista ou gestor acessa ou imprime o prontuário do paciente.' },
    ],
    roles: [
      { role: 'Dentista', value: 'Registra evoluções clínicas e consulta o histórico de cada paciente' },
      { role: 'Gestor / Proprietário', value: 'Acessa prontuários com visibilidade geral sobre os registros da clínica' },
      { role: 'Secretária / Recepção', value: 'Sem acesso ao conteúdo clínico — permissão restrita a dentistas e gestores' },
    ],
    planNote: 'Disponível em todos os planos.',
    disclaimer: 'O DentalFlow organiza e armazena registros clínicos digitalmente. A responsabilidade pelo conteúdo clínico, diagnósticos e decisões terapêuticas é do profissional responsável pelo atendimento.',
  },
  estoque: {
    id: 'estoque',
    title: 'Controle de estoque',
    eyebrow: 'Módulo de estoque',
    hero: 'Materiais e insumos sempre sob controle.',
    heroSub: 'Acompanhe o estoque de materiais odontológicos com entradas, saídas e alertas de quantidade mínima. Visibilidade para o gestor planejar reposições com antecedência.',
    problemTitle: 'O problema de gerenciar estoque sem sistema',
    problems: [
      'Materiais acabam no meio do expediente por falta de acompanhamento sistemático',
      'Sem controle de saídas, é impossível saber quanto foi consumido por período',
      'Compras de emergência custam mais e prejudicam o planejamento financeiro',
      'Itens vencidos ou perto do vencimento não são identificados a tempo',
    ],
    solutionTitle: 'O que o DentalFlow organiza no estoque',
    solutionItems: [
      {
        title: 'Cadastro de produtos',
        description: 'Registre materiais e insumos com quantidade atual, unidade de medida e quantidade mínima desejada para alertas.',
        icon: Package,
      },
      {
        title: 'Movimentações de entrada e saída',
        description: 'Registre toda movimentação para manter um histórico preciso do consumo e das reposições realizadas.',
        icon: TrendingUp,
      },
      {
        title: 'Alertas de estoque baixo',
        description: 'O sistema sinaliza quando um item atinge a quantidade mínima definida, antecipando a necessidade de reposição.',
        icon: Zap,
      },
      {
        title: 'Visibilidade para o gestor',
        description: 'Painel com estoque atual, histórico de movimentações e itens críticos para apoiar o planejamento de compras.',
        icon: LayoutDashboard,
      },
    ],
    benefits: [
      'Menos risco de falta de materiais no meio do atendimento',
      'Planejamento de compras baseado em dados de consumo real',
      'Visibilidade do estoque sem depender de contagem manual',
      'Redução de compras emergenciais por antecipação de necessidades',
    ],
    workflow: [
      { step: 1, title: 'Produto cadastrado', description: 'Registre o material com quantidade inicial e defina o limite mínimo para alertas.' },
      { step: 2, title: 'Movimentação registrada', description: 'Ao usar ou receber materiais, registre a movimentação. O saldo é atualizado.' },
      { step: 3, title: 'Alerta gerado', description: 'Quando o estoque atinge o mínimo definido, o sistema sinaliza a necessidade de reposição.' },
      { step: 4, title: 'Reposição planejada', description: 'Com histórico de consumo, o gestor planeja as compras com mais previsibilidade.' },
    ],
    roles: [
      { role: 'Secretária / Assistente', value: 'Registra entradas e saídas de materiais no dia a dia da clínica' },
      { role: 'Gestor / Proprietário', value: 'Acompanha estoque atual, alertas de mínimo e histórico de movimentações' },
    ],
    planNote: 'Disponível em todos os planos.',
  },
  leads: {
    id: 'leads',
    title: 'Leads e CRM',
    eyebrow: 'Módulo de leads',
    hero: 'Potenciais pacientes organizados. Nenhuma oportunidade perdida.',
    heroSub: 'Centralize contatos interessados, acompanhe o status de cada lead, registre interações e defina follow-ups estruturados para a equipe de recepção.',
    problemTitle: 'O problema de perder leads sem processo',
    problems: [
      'Contatos interessados chegam por diferentes canais e são perdidos por falta de organização',
      'Sem pipeline definido, a equipe não sabe quem precisa de follow-up hoje',
      'Oportunidades de conversão se perdem por falta de acompanhamento sistemático',
      'Difícil saber quais origens geram mais pacientes na clínica',
    ],
    solutionTitle: 'O que o DentalFlow organiza em leads',
    solutionItems: [
      {
        title: 'Cadastro com origem',
        description: 'Registre o contato com a origem (site, WhatsApp, Instagram, indicação) como campo de classificação. Organização manual pela equipe.',
        icon: Users,
      },
      {
        title: 'Pipeline com status',
        description: 'Acompanhe cada lead em um fluxo: novo, em contato, agendado, convertido ou perdido. Visibilidade clara para toda a equipe.',
        icon: TrendingUp,
      },
      {
        title: 'Timeline de interações',
        description: 'Registre todas as interações com o lead: ligações, mensagens e reuniões. Histórico completo por contato.',
        icon: ClipboardList,
      },
      {
        title: 'Follow-up com data definida',
        description: 'Defina a data do próximo contato para cada lead. A equipe sabe com quem precisa falar hoje.',
        icon: CalendarDays,
      },
    ],
    benefits: [
      'Nenhum lead perdido por falta de acompanhamento',
      'Equipe alinhada sobre quem precisa de contato hoje',
      'Histórico completo de interações por contato',
      'Visibilidade sobre as origens mais eficientes de novos pacientes',
    ],
    workflow: [
      { step: 1, title: 'Lead cadastrado', description: 'A recepção registra nome, telefone, origem e contexto do contato interessado.' },
      { step: 2, title: 'Status atualizado', description: 'A equipe avança o lead no pipeline: em contato, agendado, convertido.' },
      { step: 3, title: 'Interação registrada', description: 'Cada conversa ou tentativa de contato é registrada na timeline do lead.' },
      { step: 4, title: 'Follow-up definido', description: 'Defina a data do próximo contato. O sistema mantém os leads ativos no radar da equipe.' },
    ],
    roles: [
      { role: 'Secretária / Recepção', value: 'Cadastra leads, atualiza status e registra interações do dia a dia' },
      { role: 'Gestor / Proprietário', value: 'Acompanha pipeline, conversões e distribuição por origem' },
    ],
    planNote: 'Disponível nos planos Professional e Premium.',
    disclaimer: 'Os campos de origem (Instagram, WhatsApp, Google) são informações inseridas manualmente pela equipe. O DentalFlow não integra automaticamente com redes sociais ou sistemas de anúncios.',
  },
  relatorios: {
    id: 'relatorios',
    title: 'Relatórios e indicadores',
    eyebrow: 'Módulo de relatórios',
    hero: 'Dados da clínica organizados para decisões melhores.',
    heroSub: 'Acompanhe a operação com relatórios de agenda, financeiro e leads filtrados por período. Base objetiva para o gestor avaliar a saúde da clínica sem planilhas manuais.',
    problemTitle: 'O problema de decidir sem dados organizados',
    problems: [
      'O gestor não sabe ao certo quantas consultas foram realizadas ou quantas faltaram no mês',
      'Sem consolidação de dados, é difícil comparar o desempenho entre períodos',
      'Decisões sobre equipe, materiais e investimentos são baseadas em percepção',
      'Tempo perdido consolidando informações de fontes diferentes manualmente',
    ],
    solutionTitle: 'O que o DentalFlow oferece em relatórios',
    solutionItems: [
      {
        title: 'Relatório de agenda',
        description: 'Consultas realizadas, faltas e taxa de ocupação por período e por dentista. Visão operacional da agenda.',
        icon: CalendarDays,
      },
      {
        title: 'Relatório financeiro',
        description: 'Receitas, despesas, pagamentos pendentes e saldo por período. Base objetiva para acompanhamento do resultado.',
        icon: TrendingUp,
      },
      {
        title: 'Relatório de leads',
        description: 'Volume de leads por período, status do pipeline e distribuição por origem para apoiar decisões comerciais.',
        icon: Users,
      },
      {
        title: 'Filtros por período',
        description: 'Selecione qualquer intervalo de datas para gerar relatórios. Compare semanas, meses ou trimestres.',
        icon: LayoutDashboard,
      },
    ],
    benefits: [
      'Visão objetiva da operação sem consolidação manual de dados',
      'Base para decisões de equipe, estoque e investimentos',
      'Comparação de desempenho entre períodos',
      'Agenda, financeiro e leads em um mesmo lugar',
    ],
    workflow: [
      { step: 1, title: 'Dados no sistema', description: 'Agenda, financeiro e leads registrados no DentalFlow alimentam os relatórios automaticamente.' },
      { step: 2, title: 'Período selecionado', description: 'O gestor define o intervalo de datas para análise.' },
      { step: 3, title: 'Relatório gerado', description: 'Os dados são consolidados e apresentados de forma clara e organizada.' },
      { step: 4, title: 'Decisão fundamentada', description: 'Com dados objetivos, o gestor decide sobre equipe, operação e investimentos com mais segurança.' },
    ],
    roles: [
      { role: 'Gestor / Proprietário', value: 'Acesso completo a todos os relatórios e indicadores da operação' },
      { role: 'Assistente Administrativo', value: 'Pode acessar relatórios com permissão definida pelo gestor' },
    ],
    planNote: 'Disponível nos planos Professional e Premium.',
    disclaimer: 'Os relatórios apresentam dados conforme registrado na plataforma. A qualidade das análises depende da completude dos dados inseridos pela equipe. O DentalFlow não é uma ferramenta de BI avançado.',
  },
  'controle-fiscal': {
    id: 'controle-fiscal',
    title: 'Controle fiscal',
    eyebrow: 'Módulo fiscal',
    hero: 'Organização fiscal da clínica em um só lugar.',
    heroSub: 'Centralize rascunhos de notas, vincule serviços a consultas e mantenha o controle interno fiscal organizado. A emissão de NFS-e oficial requer provedor homologado — atualmente em desenvolvimento.',
    problemTitle: 'O problema de gerenciar fiscal sem organização',
    problems: [
      'Dados de serviços prestados espalhados em planilhas ou anotações manuais',
      'Dificuldade de vincular consultas realizadas a registros fiscais correspondentes',
      'Sem organização fiscal interna, dados ficam dispersos e o retrabalho aumenta',
      'Falta de visibilidade sobre o que precisa de nota e o que já foi registrado',
    ],
    solutionTitle: 'O que o DentalFlow organiza no controle fiscal',
    solutionItems: [
      {
        title: 'Rascunhos de notas fiscais',
        description: 'Gere rascunhos vinculados a consultas com dados do paciente, serviço e valor. Organização interna antes da emissão oficial.',
        icon: FileText,
      },
      {
        title: 'Vínculo consulta → nota',
        description: 'Consultas do módulo de agenda podem gerar entradas no controle fiscal, facilitando o acompanhamento por atendimento.',
        icon: CalendarDays,
      },
      {
        title: 'Perfil fiscal da clínica',
        description: 'Configure dados fiscais da clínica (CNPJ, inscrição municipal, serviços) para uso nos rascunhos e em futuras integrações.',
        icon: ClipboardList,
      },
      {
        title: 'Acompanhamento de status',
        description: 'Acompanhe cada registro fiscal: pendente, rascunho ou emitido via provedor externo quando disponível.',
        icon: CheckCircle2,
      },
    ],
    benefits: [
      'Organização fiscal sem depender de planilhas manuais',
      'Vínculo claro entre consultas realizadas e registros fiscais',
      'Base de dados estruturada para emissão quando provedor estiver disponível',
      'Redução de retrabalho na organização de dados fiscais',
    ],
    workflow: [
      { step: 1, title: 'Consulta realizada', description: 'A consulta registrada no sistema pode gerar um rascunho de nota fiscal com os dados do atendimento.' },
      { step: 2, title: 'Rascunho gerado', description: 'O controle fiscal organiza o rascunho com paciente, serviço, valor e dados da clínica.' },
      { step: 3, title: 'Revisão pelo gestor', description: 'O gestor revisa os dados antes da emissão e ajusta informações se necessário.' },
      { step: 4, title: 'Emissão via provedor', description: 'Quando integrado com provedor homologado de NFS-e (em desenvolvimento), a nota será emitida oficialmente.' },
    ],
    roles: [
      { role: 'Gestor / Proprietário', value: 'Gerencia rascunhos, configura dados fiscais e acompanha o status de cada registro' },
      { role: 'Secretária / Assistente', value: 'Pode registrar rascunhos conforme permissão definida pelo gestor' },
    ],
    planNote: 'Disponível nos planos Professional e Premium.',
    disclaimer: 'O módulo fiscal organiza dados e rascunhos internamente. A emissão de notas fiscais eletrônicas (NFS-e) requer integração com provedor homologado, atualmente em desenvolvimento. O DentalFlow não promete emissão oficial automática sem essa configuração.',
  },
  agenda: {
    id: 'agenda',
    title: 'Agenda inteligente',
    eyebrow: 'Módulo de agenda',
    hero: 'Menos conflitos, mais consultas realizadas.',
    heroSub: 'Gerencie toda a agenda da clínica com controle por dentista, horário, status e disponibilidade. Integração com Google Calendar e notificações via WhatsApp.',
    problemTitle: 'O problema de gerenciar uma agenda sem sistema',
    problems: [
      'Horários perdidos e encaixes mal feitos geram conflitos e pacientes insatisfeitos',
      'Remarcações manuais por telefone consomem tempo da equipe de recepção',
      'Sem histórico de status, é difícil saber quantas consultas foram confirmadas ou faltaram',
      'Cada dentista usa um processo diferente, dificultando a organização centralizada',
    ],
    solutionTitle: 'O que o DentalFlow resolve na agenda',
    solutionItems: [
      {
        title: 'Agenda por dentista',
        description: 'Cada dentista tem sua agenda individual, visível para a recepção e para si mesmo com permissões distintas.',
        icon: CalendarDays,
      },
      {
        title: 'Status de consulta',
        description: 'Controle visual do status de cada atendimento: agendado, confirmado, em espera, realizado ou faltou.',
        icon: CheckCircle2,
      },
      {
        title: 'Google Calendar integrado',
        description: 'Sincronize a agenda com o Google Calendar para visualização em dispositivos pessoais dos profissionais.',
        icon: Globe,
      },
      {
        title: 'Lembretes via WhatsApp',
        description: 'Notificações automáticas de confirmação de consulta para pacientes, reduzindo faltas sem esforço manual.',
        icon: MessageCircle,
      },
    ],
    benefits: [
      'Redução de faltas com lembretes automáticos',
      'Recepção com menos retrabalho e mais agilidade',
      'Visão clara da ocupação da agenda da clínica',
      'Cada dentista acompanha seus próprios horários',
    ],
    workflow: [
      { step: 1, title: 'Agende a consulta', description: 'Selecione o dentista, horário e paciente. O sistema verifica disponibilidade automaticamente.' },
      { step: 2, title: 'Notificação enviada', description: 'O paciente recebe lembrete via WhatsApp antes da consulta (requer configuração da conta Meta).' },
      { step: 3, title: 'Status atualizado', description: 'Na recepção, atualize o status: chegou, em atendimento, concluído ou faltou.' },
      { step: 4, title: 'Financeiro registrado', description: 'A consulta aparece no módulo financeiro para acompanhamento do pagamento.' },
    ],
    roles: [
      { role: 'Secretária / Recepção', value: 'Gerencia todos os horários, confirma pacientes e atualiza status' },
      { role: 'Dentista', value: 'Vê a agenda do dia, seus pacientes e horários disponíveis' },
      { role: 'Gestor', value: 'Acompanha ocupação e produtividade da agenda da clínica' },
    ],
    planNote: 'Disponível em todos os planos.',
  },
  financeiro: {
    id: 'financeiro',
    title: 'Gestão financeira',
    eyebrow: 'Módulo financeiro',
    hero: 'Clareza financeira para quem gere a clínica.',
    heroSub: 'Registre entradas, saídas e status de pagamento das consultas. Acompanhe o fluxo de caixa da clínica com dados organizados e relatórios por período.',
    problemTitle: 'O problema de gerir finanças sem sistema',
    problems: [
      'A clínica atende muito, mas o gestor não sabe ao certo se está lucrando',
      'Controle em planilhas gera inconsistências e retrabalho toda semana',
      'Consultas com pagamento pendente se perdem sem um processo de cobrança',
      'Decisões financeiras são tomadas por intuição, sem base em dados reais',
    ],
    solutionTitle: 'O que o DentalFlow organiza no financeiro',
    solutionItems: [
      {
        title: 'Entradas e saídas',
        description: 'Registre todas as receitas e despesas da clínica. Separe por categoria e acompanhe o fluxo por período.',
        icon: CreditCard,
      },
      {
        title: 'Status de pagamento por consulta',
        description: 'Vincule cada consulta à situação de pagamento: pago, pendente ou parcial. Acompanhe o que ainda está em aberto.',
        icon: CheckCircle2,
      },
      {
        title: 'Despesas fixas',
        description: 'Registre custos fixos mensais da clínica e acompanhe o impacto no resultado geral.',
        icon: TrendingUp,
      },
      {
        title: 'Relatórios por período',
        description: 'Visualize o desempenho financeiro por semana, mês ou período customizado para tomar decisões mais fundamentadas.',
        icon: LayoutDashboard,
      },
    ],
    benefits: [
      'Visão clara do caixa sem depender de planilhas',
      'Consultas com pagamento pendente identificadas com facilidade',
      'Redução de perdas por consultas não cobradas',
      'Base de dados para relatórios e decisões financeiras',
    ],
    workflow: [
      { step: 1, title: 'Consulta agendada', description: 'Ao agendar, a consulta já aparece no pipeline financeiro.' },
      { step: 2, title: 'Pagamento registrado', description: 'Após o atendimento, registre o pagamento: valor, forma e status.' },
      { step: 3, title: 'Despesas lançadas', description: 'Registre saídas e despesas da clínica para compor o resultado real.' },
      { step: 4, title: 'Relatório gerado', description: 'Acompanhe receita, despesas e saldo por período no painel financeiro.' },
    ],
    roles: [
      { role: 'Gestor / Proprietário', value: 'Acesso completo ao financeiro, relatórios e histórico' },
      { role: 'Secretária / Recepção', value: 'Registra pagamentos de consultas e status financeiro' },
      { role: 'Dentista', value: 'Sem acesso ao financeiro — permissão restrita ao gestor' },
    ],
    planNote: 'Disponível em todos os planos.',
  },
  ia: {
    id: 'ia',
    title: 'IA de gestão',
    eyebrow: 'Inteligência artificial',
    hero: 'Dados da clínica transformados em decisões mais informadas.',
    heroSub: 'O assistente de IA analisa financeiro, estoque e operação da clínica e apresenta insights práticos para apoiar o gestor. Não substitui — complementa a visão de quem decide.',
    problemTitle: 'O problema de ter dados sem conseguir interpretá-los',
    problems: [
      'A clínica acumula dados no sistema, mas o gestor não sabe como aproveitá-los',
      'Sem análise periódica, tendências negativas passam despercebidas por semanas',
      'Relatórios complexos são difíceis de interpretar sem tempo dedicado',
      'Decisões importantes são tomadas com base em percepção, não em dados',
    ],
    solutionTitle: 'Como a IA de gestão do DentalFlow funciona',
    solutionItems: [
      {
        title: 'Análise baseada em dados reais',
        description: 'O assistente analisa os dados registrados no DentalFlow — financeiro, estoque, agenda — e apresenta um resumo interpretado.',
        icon: Bot,
      },
      {
        title: 'Alertas e pontos de atenção',
        description: 'Identifica automaticamente situações que merecem atenção: queda de receita, estoque crítico, queda na ocupação da agenda.',
        icon: Zap,
      },
      {
        title: 'Sugestões práticas',
        description: 'Apresenta recomendações baseadas nos padrões identificados, com linguagem clara e aplicável à rotina da clínica.',
        icon: Sparkles,
      },
      {
        title: 'Atualizado com os dados da clínica',
        description: 'Cada análise usa os dados atuais da clínica. Quanto mais completo o uso do sistema, mais úteis os insights gerados.',
        icon: TrendingUp,
      },
    ],
    benefits: [
      'Identificação rápida de tendências na operação',
      'Alertas sobre pontos de atenção antes que virem problemas',
      'Apoio ao gestor sem necessidade de analisar planilhas',
      'Decisões mais fundamentadas e menos reativas',
    ],
    workflow: [
      { step: 1, title: 'Dados registrados no sistema', description: 'Quanto mais a clínica usa o DentalFlow, mais dados o assistente tem para analisar.' },
      { step: 2, title: 'Análise solicitada', description: 'O gestor acessa o módulo de IA e solicita uma análise do período desejado.' },
      { step: 3, title: 'Insights apresentados', description: 'O assistente apresenta um resumo com pontos positivos, alertas e sugestões.' },
      { step: 4, title: 'Ação pelo gestor', description: 'O gestor decide o que fazer com base nas informações. A IA apoia, não decide.' },
    ],
    roles: [
      { role: 'Gestor / Proprietário', value: 'Acesso exclusivo ao módulo de IA de gestão' },
    ],
    planNote: 'Disponível nos planos Professional e Premium.',
    disclaimer: 'O assistente de IA apoia decisões com base em dados registrados no sistema. Ele não realiza diagnósticos clínicos, decisões contábeis ou substituição de análise profissional.',
  },
  whatsapp: {
    id: 'whatsapp',
    title: 'WhatsApp e notificações',
    eyebrow: 'Notificações e lembretes',
    hero: 'Menos faltas. Pacientes sempre informados.',
    heroSub: 'Configure lembretes, confirmações de consulta e notificações de pós-atendimento via WhatsApp. Reduza faltas e retrabalho da recepção com automações estruturadas.',
    problemTitle: 'O problema de confirmar consultas manualmente',
    problems: [
      'Confirmar consultas por telefone consome horas da recepção todo dia',
      'Pacientes esquecem horários marcados com antecedência e faltam sem avisar',
      'Retorno e pós-consulta são esquecidos por falta de processo definido',
      'Sem acompanhamento, pacientes com pagamento pendente somem sem notícia',
    ],
    solutionTitle: 'O que o DentalFlow oferece em notificações',
    solutionItems: [
      {
        title: 'Lembrete de consulta',
        description: 'Notificação automática enviada com antecedência para o paciente lembrar do horário marcado.',
        icon: MessageCircle,
      },
      {
        title: 'Confirmação de presença',
        description: 'Paciente recebe notificação e pode confirmar ou reagendar pelo próprio WhatsApp.',
        icon: CheckCircle2,
      },
      {
        title: 'Notificação de pagamento pendente',
        description: 'Aviso automático para pacientes com consultas realizadas e pagamento ainda em aberto.',
        icon: CreditCard,
      },
      {
        title: 'Pós-consulta e retorno',
        description: 'Mensagem automática de acompanhamento após o atendimento e lembrete de retorno agendado.',
        icon: UserCheck,
      },
    ],
    benefits: [
      'Redução de faltas com lembretes automatizados',
      'Recepção com menos tempo em ligações de confirmação',
      'Pacientes mais engajados e informados',
      'Processo de cobrança mais eficiente',
    ],
    workflow: [
      { step: 1, title: 'Consulta agendada', description: 'Ao registrar a consulta, o sistema programa automaticamente os lembretes.' },
      { step: 2, title: 'Lembrete enviado', description: 'O paciente recebe a notificação via WhatsApp com os dados da consulta.' },
      { step: 3, title: 'Confirmação recebida', description: 'O paciente confirma ou a recepção registra a situação no sistema.' },
      { step: 4, title: 'Status atualizado', description: 'A agenda reflete o status de confirmação e o gestor acompanha em tempo real.' },
    ],
    roles: [
      { role: 'Secretária / Recepção', value: 'Monitora confirmações e gerencia o fluxo de notificações' },
      { role: 'Gestor', value: 'Configura templates, frequência e tipos de notificação' },
      { role: 'Paciente', value: 'Recebe e responde notificações no próprio WhatsApp' },
    ],
    planNote: 'Disponível nos planos Professional e Premium.',
    disclaimer: 'O envio de notificações via WhatsApp requer conta Business aprovada pela Meta e configuração de templates. O suporte do DentalFlow orienta o processo de configuração.',
  },
}
