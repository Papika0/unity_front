import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import NewsView from '../views/NewsView.vue'
import NewsDetailView from '../views/NewsDetailView.vue'
import ContactView from '../views/ContactView.vue'
import GalleryView from '../views/GalleryView.vue'

// Layout imports
import PublicLayout from '../layouts/PublicLayout.vue'
import AdminRootLayout from '../layouts/AdminRootLayout.vue'

// Admin imports
import AdminLoginView from '../views/admin/AdminLoginView.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminProjectsView from '../views/admin/AdminProjectsView.vue'
import AdminProjectDetailView from '../views/admin/AdminProjectDetailView.vue'
import AdminTranslationsView from '../views/admin/AdminTranslationsView.vue'

// Guards
import { requireAuth, redirectIfAuthenticated } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes with header/footer
    {
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'about',
          name: 'about',
          component: AboutView,
        },
        {
          path: 'projects',
          name: 'projects',
          component: ProjectsView,
        },
        {
          path: 'projects/:id',
          name: 'project-detail',
          component: ProjectDetailView,
        },
        {
          path: 'news',
          name: 'news',
          component: NewsView,
        },
        {
          path: 'news/:id',
          name: 'news-detail',
          component: NewsDetailView,
        },
        {
          path: 'contact',
          name: 'contact',
          component: ContactView,
        },
        {
          path: 'gallery',
          name: 'gallery',
          component: GalleryView,
        },
      ],
    },
    // Admin routes without header/footer
    {
      path: '/admin',
      component: AdminRootLayout,
      children: [
        {
          path: 'login',
          name: 'admin-login',
          component: AdminLoginView,
          meta: { requiresGuest: true },
        },
        {
          path: '',
          component: AdminLayout,
          beforeEnter: requireAuth,
          children: [
            {
              path: '',
              redirect: '/admin/dashboard',
            },
            {
              path: 'dashboard',
              name: 'admin-dashboard',
              component: AdminDashboardView,
            },
            {
              path: 'projects',
              name: 'admin-projects',
              component: AdminProjectsView,
            },
            {
              path: 'projects/:id',
              name: 'admin-project-detail',
              component: AdminProjectDetailView,
            },
            {
              path: 'translations',
              name: 'admin-translations',
              component: AdminTranslationsView,
            },
          ],
        },
      ],
    },
  ],
})

// Initialize auth on app start
router.beforeEach(async (to, from, next) => {
  // Initialize auth store if needed
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  // Initialize auth if token exists but user is not loaded
  if (authStore.token && !authStore.user) {
    authStore.initAuth()
  }

  // Handle guest-only routes (like login)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('Already authenticated, redirecting from login to dashboard')
    next('/admin/dashboard')
    return
  }

  next()
})

export default router
