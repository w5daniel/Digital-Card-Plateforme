import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'
import { useNotificationStore } from '@/stores/notificationStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/AuthView.vue'),
      meta: { requiresAuth: false, hideLayout: true, guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      redirect: { name: 'login', query: { mode: 'register' } },
      meta: { requiresAuth: false, hideLayout: true, guestOnly: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/AuthView.vue'),
      meta: { requiresAuth: false, hideLayout: true },
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: () => import('../views/GalleryView.vue'),
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../views/EditorView.vue'),
      meta: { requiresAuth: true, hideLayout: true },
    },
    {
      path: '/editor/:id',
      name: 'editor-edit',
      component: () => import('../views/EditorView.vue'),
      meta: { requiresAuth: true, hideLayout: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, hideFooter: true },
    },
    {
      path: '/share/:cardId',
      name: 'share',
      component: () => import('../views/ShareView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('../views/PricingView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/UserProfileView.vue'),
      meta: { requiresAuth: true, hideFooter: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/UserProfileView.vue'),
      meta: { requiresAuth: true, hideFooter: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../views/VerifyEmailView.vue'),
      meta: { hideLayout: true },
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: () => import('../views/MaintenanceView.vue'),
      meta: { requiresAuth: false, hideLayout: true },
    },

    // ── Administration ────────────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true, hideLayout: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/AdminUsersView.vue'),
        },
        {
          path: 'templates',
          name: 'admin-templates',
          component: () => import('../views/admin/AdminTemplatesView.vue'),
        },
        {
          path: 'cards',
          name: 'admin-cards',
          component: () => import('../views/admin/AdminCardsView.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('../views/admin/AdminSettingsView.vue'),
        },
        {
          path: 'gallery',
          name: 'admin-gallery',
          component: () => import('../views/admin/AdminGalleryView.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// ── Navigation guard ──────────────────────────────────────────────────────────
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Restore session + config publique au premier chargement (toujours, quelle que soit l'auth)
  if (!from.name) {
    await authStore.restoreSession()
    await useAdminStore().loadPublicConfig()
  }

  const isAuthenticated = authStore.isAuthenticated
  const isAdmin = authStore.isAdmin
  const adminSettings = useAdminStore().settings

  // Mode maintenance : seuls les admins peuvent naviguer
  // /share reste accessible : les visiteurs doivent pouvoir voir une carte partagée même en maintenance
  if (adminSettings?.maintenanceMode && !isAdmin && to.name !== 'maintenance' && to.name !== 'login' && to.name !== 'share') {
    return next('/maintenance')
  }

  // Galerie fermée par l'admin
  if (to.name === 'gallery' && adminSettings?.allowGallery === false && !isAdmin) {
    useNotificationStore().warning('La galerie est temporairement indisponible.')
    return next('/')
  }

  // Vérifie si une des routes matchées exige l'admin (parent ou enfant)
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin)
  const requiresAuth = to.meta.requiresAuth

  if (requiresAdmin) {
    // Accès admin : doit être connecté ET avoir le rôle admin
    if (!isAuthenticated) return next('/login')
    if (!isAdmin) return next('/dashboard')
    return next()
  }

  if (requiresAuth && !isAuthenticated) {
    // Route protégée sans accès admin
    return next('/login')
  }

  if (to.meta.guestOnly && isAuthenticated) {
    // Déjà connecté : redirige vers admin ou dashboard selon le rôle
    return next(isAdmin ? '/admin' : '/dashboard')
  }

  next()
})

export default router
