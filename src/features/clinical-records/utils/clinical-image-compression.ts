import {
  ATTACHMENT_FILE_NAME_MAX_LENGTH,
  ATTACHMENT_MAX_BASE64_LENGTH,
} from '../constants/clinical-record-limits'

/**
 * Encodes the source image as JPEG base64 (no data-URL prefix), scaled so its
 * longest side is at most `maxDimension`, at the given JPEG `quality`.
 */
export type EncodeJpeg = (maxDimension: number, quality: number) => string

/** A pt-BR, user-facing failure raised while preparing an image for upload. */
export class ClinicalImageError extends Error {}

export type FittedImage = {
  dataBase64: string
  maxDimension: number
  quality: number
}

// Tried in order: full detail first, then lower quality, then smaller sizes.
// The floor (640 px at quality 0.5) keeps radiographs and intraoral photos
// legible; below it the image is rejected with a message instead.
/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export const CLINICAL_IMAGE_DIMENSIONS = [1200, 1024, 800, 640] as const
/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export const CLINICAL_IMAGE_QUALITIES = [0.82, 0.72, 0.62, 0.5] as const

export const CLINICAL_IMAGE_TOO_LARGE_MESSAGE =
  'Não foi possível reduzir a imagem ao tamanho aceito sem perder a legibilidade. Recorte a imagem ou envie uma foto com menos detalhes.'

/**
 * Finds the highest-detail encoding whose base64 payload fits the API limit
 * (MAX_BASE64_FIELD_LENGTH in clinical-attachment.dto.ts). Returns null when
 * even the floor encoding is too large.
 */
export function fitImageToBase64Limit(
  encode: EncodeJpeg,
  maxLength: number = ATTACHMENT_MAX_BASE64_LENGTH,
): FittedImage | null {
  for (const maxDimension of CLINICAL_IMAGE_DIMENSIONS) {
    for (const quality of CLINICAL_IMAGE_QUALITIES) {
      const dataBase64 = encode(maxDimension, quality)
      if (dataBase64.length <= maxLength) return { dataBase64, maxDimension, quality }
    }
  }
  return null
}

export function base64SizeBytes(base64: string): number {
  return Math.round((base64.length * 3) / 4)
}

const HEIC_PATTERN = /\.(heic|heif)$/i

export function isHeicImage(file: Pick<File, 'name' | 'type'>): boolean {
  return /heic|heif/i.test(file.type) || HEIC_PATTERN.test(file.name)
}

/**
 * Produces a file name the API accepts: no directory part or control
 * characters, at most 180 characters, and a `.jpg` extension because the
 * uploaded data is always re-encoded as JPEG.
 */
export function toAttachmentFileName(originalName: string): string {
  const baseName = originalName.split(/[/\\]/).pop() ?? ''
  const withoutControlChars = Array.from(baseName)
    .filter((char) => {
      const code = char.charCodeAt(0)
      return code > 0x1f && code !== 0x7f
    })
    .join('')
    .trim()
  const stem = withoutControlChars.replace(/\.[^.]*$/, '').trim() || 'imagem'
  const extension = '.jpg'
  return `${stem.slice(0, ATTACHMENT_FILE_NAME_MAX_LENGTH - extension.length)}${extension}`
}
