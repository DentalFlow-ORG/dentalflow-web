import { featureDetailContents, integrationCards } from '@/features/marketing/data/public-content'

describe('public notification capability contract', () => {
  it('describes sending as a staff action instead of advertising an absent scheduler', () => {
    const whatsapp = featureDetailContents.whatsapp
    expect(whatsapp.workflow[0].description).toMatch(/equipe|recepção/i)
    expect(whatsapp.disclaimer).toMatch(/não.*agendamento automático/i)
    expect(JSON.stringify(whatsapp.solutionItems)).not.toMatch(
      /notificação automática|aviso automático|mensagem automática|reagendar pelo próprio WhatsApp/i,
    )
  })

  it('makes the external setup and manual-send boundary visible on the integration card', () => {
    const whatsapp = integrationCards.find((card) => card.name === 'WhatsApp Cloud API')
    expect(whatsapp?.status).toBe('configuring')
    expect(whatsapp?.benefit).toMatch(/equipe|manual/i)
    expect(whatsapp?.description).toMatch(/consentimento/i)
  })
})
