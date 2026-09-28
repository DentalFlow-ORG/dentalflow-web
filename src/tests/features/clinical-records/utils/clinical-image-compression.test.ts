import {
  ATTACHMENT_FILE_NAME_MAX_LENGTH,
  ATTACHMENT_MAX_BASE64_LENGTH,
} from '@/features/clinical-records/constants/clinical-record-limits'
import {
  CLINICAL_IMAGE_DIMENSIONS,
  CLINICAL_IMAGE_QUALITIES,
  base64SizeBytes,
  fitImageToBase64Limit,
  isHeicImage,
  toAttachmentFileName,
} from '@/features/clinical-records/utils/clinical-image-compression'

// A fake encoder whose output length is proportional to dimension² × quality,
// which is roughly how JPEG size scales.
function encoderWithSize(sizeFor: (maxDimension: number, quality: number) => number) {
  return vi.fn((maxDimension: number, quality: number) =>
    'a'.repeat(sizeFor(maxDimension, quality)),
  )
}

describe('fitImageToBase64Limit', () => {
  it('keeps full detail when the first encoding already fits', () => {
    const encode = encoderWithSize(() => 50_000)
    const result = fitImageToBase64Limit(encode)
    expect(result).toMatchObject({ maxDimension: 1200, quality: 0.82 })
    expect(encode).toHaveBeenCalledOnce()
  })

  it('lowers quality before reducing the image size', () => {
    const encode = encoderWithSize((_dimension, quality) => (quality > 0.62 ? 200_000 : 100_000))
    expect(fitImageToBase64Limit(encode)).toMatchObject({ maxDimension: 1200, quality: 0.62 })
  })

  it('reduces the image size when no quality fits at the current size', () => {
    const encode = encoderWithSize((dimension) => (dimension > 800 ? 300_000 : 110_000))
    expect(fitImageToBase64Limit(encode)).toMatchObject({ maxDimension: 800, quality: 0.82 })
  })

  it('accepts a payload exactly at the API limit and rejects one character above it', () => {
    expect(
      fitImageToBase64Limit(encoderWithSize(() => ATTACHMENT_MAX_BASE64_LENGTH)),
    ).not.toBeNull()
    expect(
      fitImageToBase64Limit(encoderWithSize(() => ATTACHMENT_MAX_BASE64_LENGTH + 1)),
    ).toBeNull()
  })

  it('gives up after trying every size and quality down to the legibility floor', () => {
    const encode = encoderWithSize(() => 500_000)
    expect(fitImageToBase64Limit(encode)).toBeNull()
    expect(encode).toHaveBeenCalledTimes(
      CLINICAL_IMAGE_DIMENSIONS.length * CLINICAL_IMAGE_QUALITIES.length,
    )
    expect(encode).toHaveBeenLastCalledWith(640, 0.5)
  })

  it('honours a caller-provided limit', () => {
    expect(
      fitImageToBase64Limit(
        encoderWithSize(() => 10),
        9,
      ),
    ).toBeNull()
  })
})

describe('base64SizeBytes', () => {
  it('estimates the decoded size of a base64 payload', () => {
    expect(base64SizeBytes('aW1hZ2U=')).toBe(6)
  })
})

describe('isHeicImage', () => {
  it.each([
    [{ name: 'foto.heic', type: '' }, true],
    [{ name: 'foto.HEIF', type: '' }, true],
    [{ name: 'foto', type: 'image/heic' }, true],
    [{ name: 'foto.jpg', type: 'image/jpeg' }, false],
  ])('detects %o as HEIC=%s', (file, expected) => {
    expect(isHeicImage(file)).toBe(expected)
  })
})

describe('toAttachmentFileName', () => {
  it('uses a .jpg extension because the upload is re-encoded as JPEG', () => {
    expect(toAttachmentFileName('radiografia.png')).toBe('radiografia.jpg')
  })

  it('drops directory parts the API rejects', () => {
    expect(toAttachmentFileName('C:\\fotos\\paciente/intraoral.webp')).toBe('intraoral.jpg')
  })

  it('removes control characters', () => {
    expect(toAttachmentFileName('foto\u0000\u001f\u007f.jpg')).toBe('foto.jpg')
  })

  it('falls back to a generic name when nothing usable remains', () => {
    expect(toAttachmentFileName('.png')).toBe('imagem.jpg')
  })

  it('shortens long names to the 180-character API limit', () => {
    const name = toAttachmentFileName(`${'x'.repeat(400)}.jpeg`)
    expect(name).toHaveLength(ATTACHMENT_FILE_NAME_MAX_LENGTH)
    expect(name.endsWith('.jpg')).toBe(true)
  })
})
