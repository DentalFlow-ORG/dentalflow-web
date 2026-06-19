// Shared avatar compression utility.
// Used by PatientAvatarWidget (edit-in-place) and CreateAppointmentModal
// (pending upload after appointment creation). Kept here so neither
// component duplicates the canvas logic.

export const MAX_AVATAR_DIMENSION = 512
export const JPEG_QUALITY = 0.82
export const MAX_AVATAR_INPUT_BYTES = 5 * 1024 * 1024
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
