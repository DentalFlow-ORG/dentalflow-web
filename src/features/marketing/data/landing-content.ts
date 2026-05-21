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
