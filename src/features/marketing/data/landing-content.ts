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
    tagline: 'Perfeito para começar',
    priceMonthly: 'R$ 99,90',
    compareAtMonthly: 'R$ 129,90',
    isRecommended: false,
    features: [
      'Agenda online',
      'Prontuário eletrônico',
      'Financeiro básico',
      'Relatórios essenciais',
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
      'Financeiro avançado',
      'Gestão de equipe',
      'Relatórios inteligentes',
      'Suporte prioritário',
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    tagline: 'Para clínicas que querem mais',
    priceMonthly: 'R$ 279,90',
    compareAtMonthly: 'R$ 349,90',
    isRecommended: false,
    features: [
      'Tudo do Professional',
      'Metas e indicadores',
      'Integrações avançadas',
      'Suporte dedicado',
    ],
  },
] as const
