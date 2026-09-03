import {
  addAttachmentMetadata,
  cancelClinicalRecord,
  completeClinicalRecord,
  createClinicalRecord,
  getClinicalRecord,
  getClinicalRecordByAppointment,
  getClinicalRecordPrintData,
  getOdontogram,
  getPatientClinicalTimeline,
  listAttachments,
  listClinicalRecords,
  lockClinicalRecord,
  removeAttachment,
  restoreClinicalRecord,
  updateAttachmentDescription,
  updateClinicalRecord,
  upsertOdontogram,
} from '@/features/clinical-records/services/clinical-records.service'

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'tok-123')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockApiRequest.mockResolvedValue({})
})

describe('listClinicalRecords', () => {
  it('calls GET /clinical-records with no query string when no filters are given', async () => {
    await listClinicalRecords()
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records')
    expect(options.method).toBe('GET')
    expect(options.accessToken).toBe('tok-123')
  })

  it('appends only the status filter when only status is given', async () => {
    await listClinicalRecords({ status: 'DRAFT' })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records?status=DRAFT')
  })

  it('appends both filters when both are given', async () => {
    await listClinicalRecords({ status: 'DRAFT', dentistProfileId: 'p1' })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records?status=DRAFT&dentistProfileId=p1')
  })
})

describe('getClinicalRecord', () => {
  it('calls GET /clinical-records/:id', async () => {
    await getClinicalRecord('r1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1')
    expect(options.method).toBe('GET')
  })
})

describe('getClinicalRecordByAppointment', () => {
  it('calls GET /clinical-records/by-appointment/:id', async () => {
    await getClinicalRecordByAppointment('a1')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/by-appointment/a1')
  })
})

describe('createClinicalRecord', () => {
  it('POSTs the JSON-serialized payload', async () => {
    const dto = { appointmentId: 'a1' }
    await createClinicalRecord(dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('updateClinicalRecord', () => {
  it('PATCHes the JSON-serialized payload', async () => {
    const dto = { chiefComplaint: 'dor' }
    await updateClinicalRecord('r1', dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('lifecycle actions', () => {
  it('completeClinicalRecord POSTs to /complete', async () => {
    await completeClinicalRecord('r1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1/complete')
    expect(options.method).toBe('POST')
  })

  it('lockClinicalRecord POSTs to /lock', async () => {
    await lockClinicalRecord('r1')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1/lock')
  })

  it('cancelClinicalRecord POSTs to /cancel', async () => {
    await cancelClinicalRecord('r1')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1/cancel')
  })

  it('restoreClinicalRecord POSTs to /restore', async () => {
    await restoreClinicalRecord('r1')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1/restore')
  })
})

describe('getClinicalRecordPrintData', () => {
  it('calls GET /clinical-records/:id/print-data', async () => {
    await getClinicalRecordPrintData('r1')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1/print-data')
  })
})

describe('getPatientClinicalTimeline', () => {
  it('URL-encodes the identifier', async () => {
    await getPatientClinicalTimeline('123.456.789-00')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/patient-timeline?identifier=123.456.789-00')
  })

  it('encodes special characters in the identifier', async () => {
    await getPatientClinicalTimeline('a b/c')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/patient-timeline?identifier=a%20b%2Fc')
  })
})

describe('attachments', () => {
  it('listAttachments calls GET /:recordId/attachments', async () => {
    await listAttachments('r1')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1/attachments')
  })

  it('addAttachmentMetadata POSTs the payload', async () => {
    const data = { fileName: 'foto.jpg' }
    await addAttachmentMetadata('r1', data)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1/attachments')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(data))
  })

  it('updateAttachmentDescription PATCHes only the description', async () => {
    await updateAttachmentDescription('r1', 'att1', 'nova descrição')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1/attachments/att1')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify({ description: 'nova descrição' }))
  })

  it('removeAttachment DELETEs the attachment', async () => {
    await removeAttachment('r1', 'att1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/r1/attachments/att1')
    expect(options.method).toBe('DELETE')
  })
})

describe('odontogram', () => {
  it('getOdontogram URL-encodes the identifier', async () => {
    await getOdontogram('id/1')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/odontogram?identifier=id%2F1')
  })

  it('upsertOdontogram POSTs identifier, patientName and data', async () => {
    const data = { teeth: {} }
    await upsertOdontogram('id1', 'Ana', data as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinical-records/odontogram')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ identifier: 'id1', patientName: 'Ana', data }))
  })
})
