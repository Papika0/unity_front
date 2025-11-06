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
import { requireAuth, requireAdmin, requireAdminOrMarketing } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating to a new route
    // Don't restore saved position on page refresh/reload
    if (to.path === from.path) {
      // Same route (e.g., refresh), always go to top
      return { top: 0 }
    }
    
    if (savedPosition) {
      // Only restore position when using browser back/forward buttons
      return savedPosition
    } else {
      // New navigation, scroll to top
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
          path: 'projects/:id/:buildingIdentifier',
          name: 'floor-selection',
          component: () => import('@/views/FloorSelectionView.vue'),
          props: (route) => ({
            projectId: Number(route.params.id),
            buildingIdentifier: route.params.buildingIdentifier,
          }),
        },
        {
          path: 'projects/:id/:buildingIdentifier/floor-:floorNumber',
          name: 'apartment-selection',
          component: () => import('@/views/ApartmentSelectionView.vue'),
          props: (route) => ({
            projectId: Number(route.params.id),
            buildingIdentifier: route.params.buildingIdentifier,
            floorNumber: Number(route.params.floorNumber),
          }),
        },
        {
          path: 'projects/:id/:buildingIdentifier/floor-:floorNumber/apartment-:apartmentId',
          name: 'apartment-detail',
          component: () => import('@/views/ApartmentDetailView.vue'),
          props: (route) => ({
            projectId: Number(route.params.id),
            buildingIdentifier: route.params.buildingIdentifier,
            floorNumber: Number(route.params.floorNumber),
            apartmentId: Number(route.params.apartmentId),
          }),
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
              path: 'dashboard',
              name: 'admin-dashboard',
              component: AdminDashboardView,
              beforeEnter: requireAdmin,
            },
            {
              path: 'news',
              name: 'admin-news',
              component: () => import('@/views/admin/news/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'news/add',
              name: 'admin-news-add',
              component: () => import('@/views/admin/news/AddView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'news/:id',
              name: 'admin-news-detail',
              component: () => import('@/views/admin/news/DetailView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'news/:id/edit',
              name: 'admin-news-edit',
              component: () => import('@/views/admin/news/EditView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'projects',
              name: 'admin-projects',
              component: () => import('@/views/admin/projects/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'projects/add',
              name: 'admin-project-add',
              component: () => import('@/views/admin/projects/AddView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'projects/:id',
              name: 'admin-project-detail',
              component: () => import('@/views/admin/projects/DetailView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'projects/:id/edit',
              name: 'admin-project-edit',
              component: () => import('@/views/admin/projects/EditView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'features',
              name: 'admin-features',
              component: () => import('@/views/admin/features/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'features/add',
              name: 'admin-feature-add',
              component: () => import('@/views/admin/features/AddView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'features/edit/:id',
              name: 'admin-feature-edit',
              component: () => import('@/views/admin/features/EditView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'features/assign',
              name: 'admin-feature-assign',
              component: () => import('@/views/admin/features/AssignToProject.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'translations',
              name: 'admin-translations',
              component: () => import('@/views/admin/translations/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'contact-info',
              name: 'admin-contact-info',
              component: () => import('@/views/admin/contact-info/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'gallery',
              name: 'admin-gallery',
              component: () => import('@/views/admin/gallery/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'about-settings',
              name: 'admin-about-settings',
              component: () => import('@/views/admin/about/SettingsView.vue'),
              beforeEnter: requireAdmin,
            },
            // Apartment Navigation Management
            {
              path: 'buildings',
              name: 'admin-buildings',
              component: () => import('@/views/admin/buildings/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'apartments',
              name: 'admin-apartments',
              component: () => import('@/views/admin/apartments/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'zones',
              name: 'admin-zones',
              component: () => import('@/views/admin/zones/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'zone-images',
              name: 'admin-zone-images',
              component: () => import('@/views/admin/zone-images/ListView.vue'),
              beforeEnter: requireAdmin,
            },
            // PHASE 7: Interactive Polygon Editors
            {
              path: 'projects/:id/zones/buildings',
              name: 'admin-zones-building-blocks',
              component: () => import('@/views/admin/zones/BuildingBlockEditor.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'projects/:id/buildings/:buildingId/zones/floors',
              name: 'admin-zones-floor-strips',
              component: () => import('@/views/admin/zones/FloorStripEditor.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'projects/:id/buildings/:buildingId/floors/:floorNumber/zones/apartments',
              name: 'admin-zones-apartments',
              component: () => import('@/views/admin/zones/ApartmentEditor.vue'),
              beforeEnter: requireAdmin,
            },
            // Customer Management
            {
              path: 'customers',
              name: 'admin-customers',
              component: () => import('@/views/admin/customers/AdminCustomersView.vue'),
            },
            {
              path: 'marketing-emails',
              name: 'admin-marketing-emails',
              component: () => import('@/views/admin/marketing-emails/AdminMarketingEmailsView.vue'),
              beforeEnter: requireAdmin,
            },
            {
              path: 'calculator',
              name: 'admin-calculator',
              component: () => import('@/views/admin/calculator/AdminCalculatorView.vue'),
              beforeEnter: requireAdminOrMarketing,
            },
            {
              path: 'bank-rates',
              name: 'admin-bank-rates',
              component: () => import('@/views/admin/bank-rates/AdminBankRatesView.vue'),
              beforeEnter: requireAdminOrMarketing,
            },
            {
              path: 'users',
              name: 'admin-users',
              component: () => import('@/views/admin/users/AdminUsersView.vue'),
              beforeEnter: requireAdmin,
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
    await authStore.initAuth()
  }

  // Handle guest-only routes (like login)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      next('/admin/dashboard')
    } else {
      next('/admin/customers')
    }
    return
  }

  // Handle default /admin redirect based on role
  if (to.path === '/admin' || to.path === '/admin/') {
    if (authStore.isAuthenticated) {
      if (authStore.isAdmin) {
        next('/admin/dashboard')
      } else {
        next('/admin/customers')
      }
      return
    }
  }

  // Don't block navigation - let pages load and fetch their own translations
  // The App.vue will handle hiding content until translations are ready
  next()
})

export default router
