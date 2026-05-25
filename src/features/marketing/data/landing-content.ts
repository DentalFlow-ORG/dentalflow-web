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
    key: 'starter' as const,
    name: 'Starter',
    tagline: 'Para clínicas começando a se organizar',
    priceMonthly: 'R$ 99,90',
    normalMonthly: 'R$ 129,90',
    priceAnnualMonthly: 'R$ 108,25',
    priceAnnualTotal: 'R$ 1.299,00',
    savingsLabel: '2 meses grátis',
    isRecommended: false,
  },
  {
    key: 'professional' as const,
    name: 'Professional',
    tagline: 'Controle completo para clínicas ativas',
    priceMonthly: 'R$ 189,90',
    normalMonthly: 'R$ 219,90',
    priceAnnualMonthly: 'R$ 183,25',
    priceAnnualTotal: 'R$ 2.199,00',
    savingsLabel: '2 meses grátis',
    isRecommended: true,
  },
  {
    key: 'premium' as const,
    name: 'Premium',
    tagline: 'Alta performance, limites ampliados',
    priceMonthly: 'R$ 279,90',
    normalMonthly: 'R$ 299,90',
    priceAnnualMonthly: 'R$ 249,92',
    priceAnnualTotal: 'R$ 2.999,00',
    savingsLabel: '2 meses grátis',
    isRecommended: false,
  },
]
