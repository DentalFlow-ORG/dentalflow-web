import { formatDatetime, formatDatetimeWithSeconds } from '@/features/compliance/utils/format-date'

describe('formatDatetime', () => {
  it('formats an ISO string as pt-BR date + time (minute precision)', () => {
    const result = formatDatetime('2026-06-15T14:30:00.000Z')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    expect(result).toMatch(/\d{2}:\d{2}/)
    expect(result).not.toMatch(/:\d{2}:\d{2}$/)
  })
})

describe('formatDatetimeWithSeconds', () => {
  it('formats an ISO string as pt-BR date + time with seconds', () => {
    const result = formatDatetimeWithSeconds('2026-06-15T14:30:05.000Z')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/)
  })
})
