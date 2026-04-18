// ── Validation helpers ──────────────────────────────────────────────────────
// Règles de validation côté frontend pour feedback immédiat.
// TODO backend : dupliquer ces validations côté serveur (express-validator / Zod)
//   → ne JAMAIS faire confiance aux données du client seul.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[\d\s+\-().]+$/
const URL_RE = /^(https?:\/\/)?[\w.-]+\.\w{2,}(\/\S*)?$/i
const NAME_RE = /^[^\d]+$/ // pas de chiffres

/**
 * Valide un champ selon son rôle / type et renvoie un message d'erreur ou ''.
 * @param {'name'|'firstName'|'lastName'|'fullName'|'email'|'phone'|'website'|'title'|'company'|'address'|'password'|'bio'|'cardName'|'generic'} role
 * @param {string} value
 * @returns {string} message d'erreur (vide si valide)
 */
export function validateField(role, value) {
  const v = (value ?? '').trim()
  if (!v) return '' // champ vide = pas d'erreur (les champs requis sont gérés séparément)

  switch (role) {
    case 'name':
    case 'firstName':
    case 'lastName':
    case 'fullName':
      if (!NAME_RE.test(v)) return 'Ce champ ne doit pas contenir de chiffres'
      if (v.length < 2) return 'Minimum 2 caractères'
      return ''

    case 'email':
      if (!EMAIL_RE.test(v)) return 'Format email invalide'
      return ''

    case 'phone':
      if (!PHONE_RE.test(v)) return 'Le téléphone ne doit contenir que des chiffres, +, -, (, )'
      if (v.replace(/\D/g, '').length < 6) return 'Numéro trop court (min 6 chiffres)'
      return ''

    case 'website':
      if (!URL_RE.test(v)) return 'Format URL invalide (ex: https://example.com)'
      return ''

    case 'title':
    case 'company':
      if (v.length < 2) return 'Minimum 2 caractères'
      return ''

    case 'address':
      if (v.length < 5) return 'Adresse trop courte'
      return ''

    case 'password':
      if (v.length < 6) return 'Minimum 6 caractères'
      return ''

    case 'bio':
      if (v.length > 200) return 'Maximum 200 caractères'
      return ''

    case 'cardName':
      if (v.length < 2) return 'Minimum 2 caractères'
      return ''

    default:
      return ''
  }
}

/**
 * Valide plusieurs champs d'un coup.
 * @param {Record<string, string>} fields  — { role: value }
 * @returns {Record<string, string>} — { role: errorMessage } (seulement les erreurs)
 */
export function validateFields(fields) {
  const errors = {}
  for (const [role, value] of Object.entries(fields)) {
    const err = validateField(role, value)
    if (err) errors[role] = err
  }
  return errors
}

/**
 * Mappe un rôle d'élément éditeur vers un type de validation.
 * Les rôles customs n'ont pas de validation spécifique.
 */
export function roleToValidationType(role) {
  if (!role) return 'generic'
  if (role.startsWith('custom_')) return 'generic'
  const map = {
    firstName: 'firstName',
    lastName: 'lastName',
    name: 'name',
    fullName: 'fullName',
    email: 'email',
    phone: 'phone',
    website: 'website',
    title: 'title',
    company: 'company',
    address: 'address',
  }
  return map[role] || 'generic'
}
