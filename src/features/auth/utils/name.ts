export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const [firstName = '', ...lastNameParts] = parts

  return {
    firstName,
    lastName: lastNameParts.join(' ') || firstName,
  }
}

export function getUserDisplayName(user: {
  firstName?: string
  lastName?: string
  email?: string
  id: string
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')

  return fullName || user.email || user.id
}
