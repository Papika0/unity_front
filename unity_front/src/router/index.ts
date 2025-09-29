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
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'

// Guards
import { requireAuth } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating to a new route
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  },
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
          component: () => import('@/views/admin/auth/LoginView.vue'),
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
              path: 'news',
              name: 'admin-news',
              component: () => import('@/views/admin/news/ListView.vue'),
            },
            {
              path: 'news/add',
              name: 'admin-news-add',
              component: () => import('@/views/admin/news/AddView.vue'),
            },
            {
              path: 'news/:id',
              name: 'admin-news-detail',
              component: () => import('@/views/admin/news/DetailView.vue'),
            },
            {
              path: 'news/:id/edit',
              name: 'admin-news-edit',
              component: () => import('@/views/admin/news/EditView.vue'),
            },
            {
              path: 'projects',
              name: 'admin-projects',
              component: () => import('@/views/admin/projects/ListView.vue'),
            },
            {
              path: 'projects/add',
              name: 'admin-project-add',
              component: () => import('@/views/admin/projects/AddView.vue'),
            },
            {
              path: 'projects/:id',
              name: 'admin-project-detail',
              component: () => import('@/views/admin/projects/DetailView.vue'),
            },
            {
              path: 'projects/:id/edit',
              name: 'admin-project-edit',
              component: () => import('@/views/admin/projects/EditView.vue'),
            },
            {
              path: 'features',
              name: 'admin-features',
              component: () => import('@/views/admin/features/ListView.vue'),
            },
            {
              path: 'features/add',
              name: 'admin-feature-add',
              component: () => import('@/views/admin/features/AddView.vue'),
            },
            {
              path: 'features/edit/:id',
              name: 'admin-feature-edit',
              component: () => import('@/views/admin/features/EditView.vue'),
            },
            {
              path: 'features/assign',
              name: 'admin-feature-assign',
              component: () => import('@/views/admin/features/AssignToProject.vue'),
            },
            {
              path: 'translations',
              name: 'admin-translations',
              component: () => import('@/views/admin/translations/ListView.vue'),
            },
            {
              path: 'contact-info',
              name: 'admin-contact-info',
              component: () => import('@/views/admin/contact-info/ListView.vue'),
            },
            {
              path: 'gallery',
              name: 'admin-gallery',
              component: () => import('@/views/admin/gallery/ListView.vue'),
            },
            {
              path: 'about-settings',
              name: 'admin-about-settings',
              component: () => import('@/views/admin/about/SettingsView.vue'),
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
  const { useAuthStore } = await import('@/stores/auth/auth')
  const authStore = useAuthStore()

  // Only initialize auth if navigating to admin routes and token exists but user is not loaded
  if (to.path.startsWith('/admin') && authStore.token && !authStore.user) {
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
