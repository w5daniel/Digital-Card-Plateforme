import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ADMIN_EMAIL } from '../data/mockData'

// ─────────────────────────────────────────────────────────────────────────────
// Registre global de tous les utilisateurs inscrits (sans mots de passe).
//
// RÔLE AVANT BACKEND
//   En l'absence de base de données, ce registre joue le rôle de table `users`.
//   Chaque inscription / connexion y écrit un snapshot du profil (sans password).
//   Utilisé exclusivement par les fonctions admin ci-dessous.
//
// SCHÉMA CIBLE — PostgreSQL
//   CREATE TABLE users (
//     id            BIGSERIAL PRIMARY KEY,
//     email         VARCHAR(255) UNIQUE NOT NULL,
//     name          VARCHAR(255) NOT NULL,
//     password_hash VARCHAR(255) NOT NULL,   -- bcrypt, JAMAIS exposé côté front
//     role          VARCHAR(20)  NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
//     is_premium    BOOLEAN      NOT NULL DEFAULT false,
//     premium_until TIMESTAMPTZ,
//     status        VARCHAR(20)  NOT NULL DEFAULT 'active', -- 'active' | 'blocked'
//     avatar_url    TEXT,                                   -- remplace userProfilePhoto_{email}
//     created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
//     updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
//     deleted_at    TIMESTAMPTZ                             -- soft-delete RGPD
//   );
//   CREATE INDEX idx_users_email  ON users(email);
//   CREATE INDEX idx_users_status ON users(status);
//
// MIGRATIONS FUTURES
//   - Table `user_sessions`  : JWT + refresh tokens avec expiration (remplace authToken)
//   - Table `admin_audit_log`: historique de toutes les actions admin (qui, quoi, quand)
//   - Table `subscriptions`  : abonnements Stripe liés à user_id
// ─────────────────────────────────────────────────────────────────────────────
// TODO backend : supprimer ce localStorage et alimenter getAllUsersWithStats
//   via GET /api/admin/users (paginé, filtrable, trié côté serveur)
const ALL_USERS_LS_KEY = 'digitalcard_allUsers'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // ── Registre réactif de tous les utilisateurs inscrits ──────────────────────
  // TODO backend : ce ref disparaît — les données viennent du serveur (GET /api/admin/users)
  const allUsers = ref([])

  // Charger le registre au démarrage du store (IIFE synchrone)
  ;(function _loadRegistry() {
    try {
      const raw = localStorage.getItem(ALL_USERS_LS_KEY)
      allUsers.value = raw ? JSON.parse(raw) : []
    } catch {
      allUsers.value = []
    }
  })()

  function _saveRegistry() {
    // TODO backend : remplacer par un appel API (le serveur est la source de vérité)
    try {
      localStorage.setItem(ALL_USERS_LS_KEY, JSON.stringify(allUsers.value))
    } catch { /* quota localStorage — non bloquant */ }
  }

  /**
   * Insère ou met à jour un utilisateur dans le registre.
   * Ne touche PAS au champ `status` si l'utilisateur existe déjà :
   * seul adminBanUser / adminUnbanUser peut modifier le statut.
   *
   * TODO backend : cette fonction devient inutile — le serveur gère l'upsert
   *   lors du login  → POST /auth/login   met à jour `last_login_at`
   *   lors du register → POST /auth/register crée la ligne `users`
   */
  function _upsertRegistry(userObj) {
    // IMPORTANT : matcher par email (stable) et non par id (Date.now() change à chaque login)
    // TODO backend : l'email est la clé UNIQUE en DB, le serveur gère l'upsert nativement
    const idx = allUsers.value.findIndex(
      (u) => u.email.toLowerCase() === userObj.email.toLowerCase(),
    )
    const entry = {
      id: userObj.id,
      email: userObj.email,
      name: userObj.name,
      role: userObj.role,
      createdAt: userObj.createdAt,
      isPremium: userObj.isPremium ?? false,
      premiumUntil: userObj.premiumUntil || null,
    }
    if (idx !== -1) {
      // Mise à jour : préserver `status` (seul l'admin peut le changer)
      // Conserver aussi l'id d'origine pour éviter les doublons après re-login
      allUsers.value[idx] = { ...allUsers.value[idx], ...entry, id: allUsers.value[idx].id }
    } else {
      // Première apparition dans le registre → statut actif par défaut
      allUsers.value.push({ ...entry, status: 'active' })
    }
    _saveRegistry()
  }

  // ── Photo de profil — source unique de vérité (NavBar + ProfileView) ──
  const profilePhoto = ref(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isPremium = computed(() => {
    if (!user.value?.isPremium) return false
    if (user.value.premiumUntil) return new Date() < new Date(user.value.premiumUntil)
    return true
  })

  function _loadProfilePhoto() {
    if (user.value?.email) {
      profilePhoto.value = localStorage.getItem(`userProfilePhoto_${user.value.email}`) || null
    }
  }

  function setProfilePhoto(dataUrl) {
    profilePhoto.value = dataUrl
    if (user.value?.email) {
      localStorage.setItem(`userProfilePhoto_${user.value.email}`, dataUrl)
    }
  }

  function removeProfilePhoto() {
    profilePhoto.value = null
    if (user.value?.email) {
      localStorage.removeItem(`userProfilePhoto_${user.value.email}`)
    }
  }

  /**
   * Connexion utilisateur
   * Mock : admin@ecodev.dev → role 'admin', tout autre email → role 'user'
   *
   * TODO backend : remplacer par POST /auth/login { email, password }
   *   → serveur vérifie bcrypt hash, renvoie { token, refreshToken, user }
   *   → stocker token en mémoire + refreshToken en HttpOnly cookie (sécurité XSS)
   *   → si user.status === 'blocked' → serveur renvoie HTTP 403 (pas besoin de vérifier côté front)
   */
  async function login(email, password) {
    isLoading.value = true
    error.value = null

    try {
      // TODO: remplacer par `const res = await api.post('/auth/login', { email, password })`
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!email || !password || password.length < 6) {
        throw new Error('Email ou mot de passe invalide')
      }

      // Vérification locale du statut bloqué (best-effort avant backend)
      // TODO backend : cette vérification sera faite par le serveur (HTTP 403)
      const existing = allUsers.value.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (existing?.status === 'blocked') {
        throw new Error('Ce compte a été bloqué. Contactez l\'administrateur.')
      }

      const role = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user'

      const mockUser = {
        id: existing?.id ?? (role === 'admin' ? 0 : Date.now()),
        email: email,
        name: existing?.name ?? (role === 'admin' ? 'Administrateur' : email.split('@')[0]),
        role,
        createdAt: existing?.createdAt || new Date().toISOString(),
        isPremium: existing?.isPremium ?? (role === 'admin'),
        premiumUntil: existing?.premiumUntil || null,
      }
      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('authToken', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      _loadProfilePhoto()
      // Enregistrer dans le registre global (pour la page admin/users)
      _upsertRegistry(mockUser)

      return mockUser
    } catch (err) {
      error.value = err.message || 'Erreur de connexion'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inscription utilisateur — rôle 'user' toujours (jamais admin par inscription)
   *
   * TODO backend : remplacer par POST /auth/register { email, password, fullName }
   *   → serveur hash le password (bcrypt, salt rounds >= 12)
   *   → vérifier unicité email (UNIQUE constraint en DB) → HTTP 409 si doublon
   *   → envoyer email de vérification (SendGrid / Resend) → champ `email_verified_at`
   *   → renvoyer { token, refreshToken, user } (connexion automatique post-inscription)
   *   → logguer dans `admin_audit_log` (type: 'user_registered')
   */
  async function register(email, password, confirmPassword, fullName) {
    isLoading.value = true
    error.value = null

    try {
      // TODO: remplacer par `const res = await api.post('/auth/register', { email, password, fullName })`
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!email || !password || !fullName) {
        throw new Error('Tous les champs sont requis')
      }

      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }

      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }

      // Vérification locale d'unicité email (best-effort avant backend)
      // TODO backend : géré par la contrainte UNIQUE en DB → HTTP 409
      const emailExists = allUsers.value.some((u) => u.email.toLowerCase() === email.toLowerCase())
      if (emailExists) {
        throw new Error('Un compte existe déjà avec cet email')
      }

      const mockUser = {
        id: Date.now(),
        email: email,
        name: fullName,
        role: 'user',
        createdAt: new Date().toISOString(),
        isPremium: false,
      }
      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('authToken', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      _loadProfilePhoto()
      // Enregistrer dans le registre global (pour la page admin/users)
      _upsertRegistry(mockUser)

      return mockUser
    } catch (err) {
      error.value = err.message || "Erreur d'inscription"
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Déconnexion utilisateur
   */
  function logout() {
    user.value = null
    token.value = null
    profilePhoto.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  /**
   * Restaurer session depuis localStorage
   */
  /**
   * Restaure la session depuis localStorage (appelé avant app.mount()).
   *
   * TODO backend : remplacer par une vérification côté serveur :
   *   GET /auth/me  (avec le token en header Authorization)
   *   → si token invalide / expiré → HTTP 401 → déconnecter
   *   → si user.status === 'blocked' → HTTP 403 → déconnecter
   *   → sinon renvoyer l'objet user à jour
   */
  function restoreSession() {
    try {
      const storedToken = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        // Rétrocompatibilité : sessions créées avant l'ajout du champ role
        if (!user.value.role) user.value.role = 'user'

        // Vérifier dans le registre si l'utilisateur a été banni par l'admin
        // TODO backend : cette vérification sera faite par le serveur (GET /auth/me → 403)
        const registryEntry = allUsers.value.find(
          (u) => u.email.toLowerCase() === user.value.email.toLowerCase(),
        )
        if (registryEntry?.status === 'blocked') {
          // Forcer la déconnexion
          user.value = null
          token.value = null
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          return
        }

        _loadProfilePhoto()
      }
    } catch {
      // Corrupt localStorage — clear and start fresh
      user.value = null
      token.value = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  /**
   * Upgrader au plan premium
   *
   * TODO backend : remplacer par POST /billing/upgrade
   *   → intégration Stripe : créer une Checkout Session ou un PaymentIntent
   *   → webhook Stripe `invoice.paid` → mettre à jour is_premium + premium_until en DB
   *   → NE PAS faire confiance au front pour valider le paiement
   *   → envoyer email de confirmation avec facture (obligations légales)
   */
  async function upgradeToPremium() {
    isLoading.value = true

    try {
      // TODO: remplacer par `const res = await api.post('/billing/upgrade')`
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!user.value) {
        throw new Error('Vous devez être connecté')
      }

      user.value.isPremium = true
      user.value.premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      localStorage.setItem('user', JSON.stringify(user.value))
      // Synchroniser le registre admin
      _upsertRegistry(user.value)

      return user.value
    } catch (err) {
      error.value = err.message || 'Erreur lors de la mise à niveau'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Vérifier si l'utilisateur a un plan actif
   */
  function hasPremium() {
    if (!user.value?.isPremium) return false
    if (user.value.premiumUntil) {
      return new Date() < new Date(user.value.premiumUntil)
    }
    return true
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS ADMIN — Gestion des utilisateurs
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retourne tous les utilisateurs avec leur nombre de cartes calculé en temps réel.
   *
   * TODO backend : GET /api/admin/users?page=1&limit=50&search=&status=&plan=&sort=createdAt
   *   → réponse paginée : { data: User[], total: number, page: number, pages: number }
   *   → cardCount calculé en SQL :
   *       SELECT u.*, COUNT(c.id) AS card_count
   *       FROM users u
   *       LEFT JOIN cards c ON c.owner_id = u.id AND c.deleted_at IS NULL
   *       WHERE u.deleted_at IS NULL
   *       GROUP BY u.id
   *   → filtres serveur : status, isPremium, role, search (full-text sur name + email)
   *   → tri serveur : createdAt DESC par défaut, configurable
   *   → ne jamais renvoyer password_hash dans la réponse
   */
  const getAllUsersWithStats = computed(() => {
    return allUsers.value.map((u) => {
      // cardCount : lu directement depuis localStorage (sans importer cardsStore
      // pour éviter une dépendance circulaire authStore ↔ cardsStore)
      // TODO backend : vient du COUNT() SQL ci-dessus
      let cardCount = 0
      try {
        const raw = localStorage.getItem(`digitalcard_userCards_${u.email}`)
        cardCount = raw ? JSON.parse(raw).length : 0
      } catch { /* ignorer */ }
      return { ...u, cardCount }
    })
  })

  /**
   * Bloque un utilisateur (admin uniquement).
   *
   * TODO backend : PATCH /api/admin/users/:id { status: 'blocked' }
   *   → middleware `requireAdmin` sur la route (vérifier role === 'admin' via JWT)
   *   → en DB : UPDATE users SET status='blocked', updated_at=NOW() WHERE id=:id
   *   → invalider TOUS les tokens actifs : DELETE FROM user_sessions WHERE user_id=:id
   *   → l'utilisateur sera déconnecté à sa prochaine requête (token invalide)
   *   → logguer : INSERT INTO admin_audit_log (admin_id, action, target_user_id, created_at)
   */
  function adminBanUser(id) {
    const u = allUsers.value.find((u) => u.id === id)
    if (!u || u.role === 'admin') return // protéger les comptes admin
    u.status = 'blocked'
    _saveRegistry()
  }

  /**
   * Débloque un utilisateur (admin uniquement).
   *
   * TODO backend : PATCH /api/admin/users/:id { status: 'active' }
   *   → en DB : UPDATE users SET status='active', updated_at=NOW() WHERE id=:id
   *   → logguer dans admin_audit_log
   */
  function adminUnbanUser(id) {
    const u = allUsers.value.find((u) => u.id === id)
    if (!u) return
    u.status = 'active'
    _saveRegistry()
  }

  /**
   * Bascule le plan Premium d'un utilisateur (admin uniquement).
   *
   * TODO backend : PATCH /api/admin/users/:id/premium { isPremium, premiumUntil }
   *   → en DB : UPDATE users SET is_premium=?, premium_until=?, updated_at=NOW()
   *   → si retrait premium ET abonnement Stripe actif :
   *       stripe.subscriptions.cancel(subscriptionId) + notifier par email
   *   → si attribution admin (offert) : créer un abonnement "admin_gift" sans paiement
   *       ou simplement mettre un flag `premium_source: 'admin'` pour distinguer
   *   → logguer dans admin_audit_log avec ancien et nouveau statut
   */
  function adminTogglePremium(id) {
    const u = allUsers.value.find((u) => u.id === id)
    if (!u) return
    u.isPremium = !u.isPremium
    u.premiumUntil = u.isPremium
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : null
    _saveRegistry()
    // Synchroniser la session courante si l'utilisateur connecté est la cible
    if (user.value?.id === id) {
      user.value.isPremium = u.isPremium
      user.value.premiumUntil = u.premiumUntil
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  /**
   * Supprime définitivement un utilisateur (admin uniquement).
   *
   * TODO backend : DELETE /api/admin/users/:id
   *   → SOFT DELETE recommandé (conformité RGPD) :
   *       UPDATE users SET deleted_at=NOW(), email='deleted_:id@deleted', name='[Supprimé]'
   *       (anonymiser email + nom pour libérer la contrainte UNIQUE tout en conservant l'audit)
   *   → CASCADE logique :
   *       - Marquer deleted_at sur toutes ses `cards`
   *       - Retirer ses snapshots publics de la CDN / cache
   *       - Révoquer ses tokens (DELETE FROM user_sessions WHERE user_id=:id)
   *       - Annuler abonnement Stripe actif si applicable
   *   → Obligations RGPD (article 17 — droit à l'effacement) :
   *       - Envoyer email de confirmation de suppression à l'adresse avant anonymisation
   *       - Conserver données anonymisées 13 mois minimum pour obligations comptables
   *       - Documenter la demande dans un registre des traitements RGPD
   *   → logguer dans admin_audit_log avant suppression
   *   → NE PAS exposer cet endpoint sans authentification admin + confirmation 2FA
   */
  function adminDeleteUser(id) {
    const u = allUsers.value.find((u) => u.id === id)
    if (!u || u.role === 'admin') return // protéger les comptes admin
    allUsers.value = allUsers.value.filter((u) => u.id !== id)
    _saveRegistry()
    // Nettoyage localStorage associé à cet utilisateur
    // TODO backend : géré par CASCADE DELETE / anonymisation côté serveur
    try {
      // Lire les cartes de l'utilisateur pour nettoyer les snapshots publics
      const cardsRaw = localStorage.getItem(`digitalcard_userCards_${u.email}`)
      if (cardsRaw) {
        const cards = JSON.parse(cardsRaw)
        // Supprimer chaque snapshot public (digitalcard_public_{cardId})
        for (const card of cards) {
          localStorage.removeItem(`digitalcard_public_${card.id}`)
        }
      }
      localStorage.removeItem(`digitalcard_userCards_${u.email}`)
      localStorage.removeItem(`userProfilePhoto_${u.email}`)
    } catch { /* non bloquant — données potentiellement corrompues */ }
  }

  return {
    user,
    token,
    isLoading,
    error,
    profilePhoto,
    isAuthenticated,
    isAdmin,
    isPremium,
    login,
    register,
    logout,
    restoreSession,
    upgradeToPremium,
    hasPremium,
    setProfilePhoto,
    removeProfilePhoto,
    // Admin — gestion des utilisateurs
    getAllUsersWithStats,
    adminBanUser,
    adminUnbanUser,
    adminTogglePremium,
    adminDeleteUser,
  }
})
